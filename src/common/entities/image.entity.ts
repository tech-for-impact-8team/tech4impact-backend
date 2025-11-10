import { BaseModel } from './base.entity';
import { Column, ManyToOne } from 'typeorm';
import { IsEnum, IsString } from 'class-validator';
import { RampsModel } from '../../ramps/entities/ramps.entity';
import { Transform } from 'class-transformer';
import { join } from 'path';

export enum ImageType {
  RAMP_IMAGE,
}

export class ImageModel extends BaseModel {
  @Column()
  @IsEnum(ImageType)
  @IsString()
  type: ImageType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageType.RAMP_IMAGE) {
      return `/${join(process.env.RAMP_IMAGE_PATH, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => RampsModel, (ramps) => ramps.images)
  ramps?: RampsModel;
}
