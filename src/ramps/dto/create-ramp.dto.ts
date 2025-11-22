import { IsArray, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRampDto {
  @IsString()
  @ApiProperty()
  district: string;

  @IsString()
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  tradeName: string;

  @IsNumber()
  @ApiProperty()
  width: number;

  @IsNumber()
  @ApiProperty()
  latitude: number;

  @IsNumber()
  @ApiProperty()
  longitude: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  imagesKeys: string[];
}
