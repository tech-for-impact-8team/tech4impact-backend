import { OmitType } from '@nestjs/mapped-types';
import { CreateRampDto } from './create-ramp.dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateRampDto extends PartialType(
  OmitType(CreateRampDto, ['longitude', 'latitude']),
) {
  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  tradeName?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  imagesKeys?: string[];

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  district?: string;
}
