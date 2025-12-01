import { BaseModel } from './base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsString } from 'class-validator';
import { RampsModel } from '../../ramps/entities/ramps.entity';

export enum ImageType {
  RAMP_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({ type: 'enum', enum: ImageType })
  @IsEnum(ImageType)
  @IsString()
  type: ImageType;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  key: string;

  @ManyToOne((type) => RampsModel, (ramps) => ramps.images, {
    onDelete: 'CASCADE',
  })
  ramps?: RampsModel;
}
