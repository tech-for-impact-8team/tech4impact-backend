import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { ConfigModule } from '@nestjs/config';
import { extname } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MulterModule.register({
      limits: {
        files: 10000000, // 파일 최대 크기 10MB
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb (에러, boolean)
         * 첫 번째 파리미터에는 에러가 있을 경우 에러 정보를 넣어준다
         * 두 번째 파라미터에는 파일을 받을지 말지 boolean을 넣어준다
         */
        // xxx.jpg -> .jpg
        const ext = extname(file.originalname);

        if (
          ext !== '.jpg' &&
          ext !== '.jpeg' &&
          ext !== '.png' &&
          ext !== '.webp'
        ) {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, 'temp/ramps/images/');
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
