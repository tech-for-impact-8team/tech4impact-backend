// common/geocoding.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(private readonly http: HttpService) {}

  /**
   * 카카오 주소 검색 API 사용
   * GET https://dapi.kakao.com/v2/local/search/address.json?query=...
   */
  async geocodeByAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    if (!address) return null;

    try {
      const url = 'https://dapi.kakao.com/v2/local/search/address.json';

      const resp$ = this.http.get(url, {
        params: {
          query: address,
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
      });

      const resp = await firstValueFrom(resp$);

      const doc = resp.data?.documents?.[0];
      if (!doc) {
        this.logger.warn(`No geocode result for address="${address}"`);
        return null;
      }

      // 카카오: x = 경도(longitude), y = 위도(latitude)
      const lng = Number(doc.x);
      const lat = Number(doc.y);

      return { lat, lng };
    } catch (e: any) {
      this.logger.error(
        `Kakao geocode error for "${address}": ${e.message}`,
        e.stack,
      );
      return null;
    }
  }
}
