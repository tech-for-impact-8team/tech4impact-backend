import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginateRampDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '페이지 위치',
    example: 1,
    required: false,
  })
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '페이지 당 데이터 수',
    example: 10,
    required: false,
  })
  take: number = 10;

  // order__
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  @ApiProperty({
    description: '정렬 오름차순 내림차순',
    example: 'ASC',
    required: false,
  })
  order__createdAt: 'ASC' | 'DESC' = 'DESC';

  // where__
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '자치구',
    example: '금천구',
    required: false,
  })
  where__district?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '시설 유형',
    example: '',
    required: false,
  })
  where__type?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '검색',
    example: '송파',
    required: false,
  })
  where__query?: string;
}
