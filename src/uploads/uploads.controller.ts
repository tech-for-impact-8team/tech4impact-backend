import { Body, Controller, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned')
  @ApiBody({ type: CreatePresignedUrlDto })
  @ApiBearerAuth('authorization')
  async getPresignedUrl(@Body() body: CreatePresignedUrlDto) {
    return this.uploadsService.createPresignedUrl(body);
  }
}
