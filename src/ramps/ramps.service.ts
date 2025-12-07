import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { RampsModel } from './entities/ramps.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateRampDto } from './dto/paginate-ramp.dto';
import { DEFAULT_RAMPS_FIND_OPTIONS } from './const/default-post-find-options.const';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ORDERABLE_KEYS } from './const/orderable-keys.const';
import { DeleteRampDto } from './dto/delete-ramp.dto';
import { UpdateRampDto } from './dto/update-ramp.dto';
import { CreateRampDto } from './dto/create-ramp.dto';
import { ImagesService } from './image/images.service';
import * as XLSX from 'xlsx';
import { GeocodingService } from '../common/geocoding/geocoding.service';

@Injectable()
export class RampsService {
  constructor(
    @InjectRepository(RampsModel)
    private readonly rampsRepository: Repository<RampsModel>,
    private readonly imagesService: ImagesService,
    private readonly geocodingService: GeocodingService,
  ) {}

  paginateRamps(dto: PaginateRampDto) {
    return this.paginate(dto, this.rampsRepository, {
      ...DEFAULT_RAMPS_FIND_OPTIONS,
    });
  }

  async getRampsById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const ramp = await repository.findOne({
      relations: ['images'],
      where: { id },
    });

    if (!ramp) {
      throw new NotFoundException();
    }

    return ramp;
  }

  async createRamp(userId: number, body: CreateRampDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const ramp = repository.create({
      ...body,
      user: {
        id: userId,
      },
    });

    const savedRamp = await repository.save(ramp);

    await this.imagesService.createRampImages(savedRamp, body.imagesKeys, qr);

    return repository.findOne({
      where: { id: savedRamp.id },
      relations: ['images'],
    });
  }

  async deleteRamps(body: DeleteRampDto) {
    if (!body || body.ids.length === 0) {
      throw new BadRequestException('삭제할 ID 목록이 비어 있습니다.');
    }

    const ramps = await this.rampsRepository.find({
      where: { id: In(body.ids) },
    });

    if (ramps.length === 0) {
      throw new BadRequestException('삭제할 데이터가 존재하지 않습니다.');
    }

    await this.rampsRepository.delete(ramps.map((ramp) => ramp.id));

    return {
      deletedCount: ramps.length,
      deletedIds: body.ids,
    };
  }

  async patchRamps(id: number, body: UpdateRampDto, qr?: QueryRunner) {
    const repository = this.getRepository();
    const ramp = await repository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!ramp) {
      throw new NotFoundException('해당 경사로 데이터가 존재하지 않습니다.');
    }

    Object.assign(ramp, body);

    await repository.save(ramp);

    if (Array.isArray(body.imagesKeys) && body.imagesKeys.length > 0 && qr) {
      await this.imagesService.deleteRampImages(ramp, qr);

      await this.imagesService.createRampImages(ramp, body.imagesKeys, qr);
    }

    return await repository.findOne({ where: { id }, relations: ['images'] });
  }

  private async paginate(
    dto: PaginateRampDto,
    rampsRepository: Repository<RampsModel>,
    overrideFindOptions: FindManyOptions<RampsModel> = {},
  ) {
    const findOptions = this.composeFindOptions(dto);

    const [data, count] = await rampsRepository.findAndCount({
      ...overrideFindOptions,
      ...findOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private composeFindOptions(
    dto: PaginateRampDto,
  ): FindManyOptions<RampsModel> {
    let where: FindOptionsWhere<RampsModel> | FindOptionsWhere<RampsModel>[] =
      {};
    let order: FindOptionsOrder<RampsModel> = {};

    // 1) 먼저 일반 where, order 처리 (where__query는 일단 제외)
    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined || value === null || value === '') continue;

      if (key === 'where__query') {
        // 여기서는 스킵하고 아래에서 따로 처리
        continue;
      }

      if (key.startsWith('where__')) {
        where = {
          ...(where as any),
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOrderFilter(key, value),
        };
      }
    }

    // 2) 검색어(where__query) 처리
    if (dto.where__query) {
      const q = dto.where__query.trim();

      if (q) {
        const like = ILike(`%${q}%`);

        // baseWhere는 district/type 같은 다른 필터들
        const baseWhere =
          Array.isArray(where) && where.length > 0
            ? where[0]
            : (where as FindOptionsWhere<RampsModel>);

        // "기존 조건 AND (tradeName OR address OR district)" 형태로 OR 배열 생성
        where = [
          { ...baseWhere, tradeName: like },
          { ...baseWhere, address: like },
          { ...baseWhere, district: like },
        ];
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : undefined,
    };
  }

  private parseWhereFilter(
    key: string,
    value: unknown,
  ): FindOptionsWhere<RampsModel> {
    const out: FindOptionsWhere<RampsModel> = {};
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 분리 시 길이가 2 또는 3이어야 합니다. (문제 키: ${key})`,
      );
    }

    if (split.length === 2) {
      const [, field] = split;
      // 단순 equals
      (out as any)[field] = value;
      return out;
    }

    const [, field, operator] = split;

    // ILike 자동 % 래핑
    if (operator === 'i_like') {
      (out as any)[field] = ILike(`%${value}%`);
      return out;
    }

    const mapper = (FILTER_MAPPER as any)[operator];
    if (!mapper) {
      throw new BadRequestException(`지원하지 않는 where 연산자: ${operator}`);
    }

    (out as any)[field] = mapper(value);
    return out;
  }

  private parseOrderFilter(
    key: string,
    value: unknown,
  ): FindOptionsOrder<RampsModel> {
    const out: FindOptionsOrder<RampsModel> = {};
    const split = key.split('__');

    if (split.length !== 2) {
      throw new BadRequestException(
        `order 필터는 '__'로 분리 시 길이가 2여야 합니다. (문제 키: ${key})`,
      );
    }

    const [, fieldRaw] = split;
    const field = fieldRaw as keyof RampsModel;

    if (!ORDERABLE_KEYS.has(field)) {
      throw new BadRequestException(`정렬 불가 필드: ${fieldRaw}`);
    }

    // 값 정규화
    (out as any)[field] = this.normalizeOrderDirection(value);
    return out;
  }

  private normalizeOrderDirection(v: unknown): 'ASC' | 'DESC' {
    if (typeof v === 'number') {
      return v < 0 ? 'DESC' : 'ASC';
    }
    if (typeof v === 'string') {
      const up = v.toUpperCase();
      if (up === 'ASC' || up === 'DESC') return up;
      if (up === '1') return 'ASC';
      if (up === '-1') return 'DESC';
      if (up === 'A' || up === 'UP') return 'ASC';
      if (up === 'D' || up === 'DOWN') return 'DESC';
    }
    // 기본값
    return 'ASC';
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<RampsModel>(RampsModel)
      : this.rampsRepository;
  }

  async generateRamps(id: number) {
    for (let i = 0; i < 100; i++) {
      await this.createRamp(id, {
        type: '타입',
        district: '금천구',
        imagesKeys: [],
        width: 12.33,
        tradeName: '사람인',
        latitude: 33.444244,
        longitude: 24.10022,
        address: '서울시 금천구 어쩌구 저쩌구',
      });
    }
  }

  /**
   * 1. 총 데이터 수
   * 2. 적합 부적합 경사로 수
   * 3. 유형별 분포
   * 4. 자치구별 분포
   */
  async getRampsAnalytics() {
    const totalCount = this.getTotalCount();
    const typeDistribution = this.getTypeDistribution();
    const districtDistribution = this.getDistrictDistribution();

    return {
      totalCount,
      typeDistribution,
      districtDistribution,
    };
  }

  getTotalCount() {
    return this.rampsRepository.count();
  }

  getTypeDistribution() {
    return this.rampsRepository
      .createQueryBuilder('ramps')
      .select('ramps.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ramps.type')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  getDistrictDistribution() {
    return this.rampsRepository
      .createQueryBuilder('ramps')
      .select('ramps.district', 'district')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ramps.district')
      .getRawMany();
  }

  async parseRampsSheet(userId: number, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<any>(sheet, {
      range: 'A5:F999',
      header: [
        'index', // A: 연번
        'district', // B: 자치구명
        'facilityType', // C: 시설유형
        'tradeName', // D: 상호명
        'address', // E: 주소
        'width', // F: 폭
      ],
      defval: null,
    });

    const cleaned = rows
      .filter(
        (row) =>
          row.district && row.facilityType && row.tradeName && row.address,
      )
      .map((row) => ({
        index: Number(row.index),
        district: row.district.toString().trim(),
        facilityType: row.facilityType.toString().trim(),
        tradeName: row.tradeName.toString().trim(),
        address: row.address.toString().trim(),
        width: row.width != null ? Number(row.width) : null,
      }));

    const entities: RampsModel[] = [];

    for (const row of cleaned) {
      const fullAddress = row.address;

      const geo = await this.geocodingService.geocodeByAddress(fullAddress);

      const ramp = this.rampsRepository.create({
        district: row.district,
        type: row.facilityType,
        tradeName: row.tradeName,
        address: row.address,
        width: row.width,
        latitude: geo ? geo.lat : null,
        longitude: geo ? geo.lng : null,
        user: {
          id: userId,
        },
      });

      entities.push(ramp);
    }

    await this.rampsRepository.save(entities);

    return {
      totalRows: rows.length,
      imported: entities.length,
    };
  }
}
