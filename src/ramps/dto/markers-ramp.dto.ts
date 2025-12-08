import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MarkersRampDto {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty()
  latitude: number;

  @IsNumber()
  @ApiProperty()
  longitude: number;
}
