import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
