import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel, ImageType } from '../../common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { RampsModel } from '../entities/ramps.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createRampImages(ramp: RampsModel, keys: string[], qr?: QueryRunner) {
    if (!keys.length) {
      throw new BadRequestException(
        '경사로 데이터 생성에는 이미지를 필수로 등록해야 합니다.',
      );
    }

    const repository = this.getRepository(qr);

    const images = keys.map((key) => ({
      type: ImageType.RAMP_IMAGE,
      key,
      ramp,
    }));

    return await repository.save(images);
  }
}
