import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  constructor(private readonly s3Service: S3Service) {}

  async createPresignedUrl(dto: CreatePresignedUrlDto) {
    const { fileName, contentType } = dto;
    const ext = fileName.split('.').pop() || 'png';
    const key = `uploads/test/${randomUUID()}.${ext}`;
    return this.s3Service.getPresignedUploadUrl(key, contentType);
  }
}
