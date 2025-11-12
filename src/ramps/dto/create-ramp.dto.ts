import { IsNumber, IsString } from 'class-validator';
import { ImageModel } from '../../common/entities/image.entity';

export class CreateRampDto {
  @IsString()
  district: string;

  @IsString()
  type: string;

  @IsString()
  address: string;

  @IsString()
  tradeName: string;

  @IsNumber()
  width: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  state: string;

  userId: number;

  images: ImageModel[];
}
