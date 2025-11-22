import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'profile.png',
    description: '업로드할 파일의 원본 이름. 확장자를 포함해야 합니다.',
  })
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @ApiProperty({
    example: 'image/png',
    description:
      '업로드할 파일의 MIME 타입. 프론트에서 File 객체의 type 값을 그대로 전달합니다.',
  })
  contentType: string;
}
