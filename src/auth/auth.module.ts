import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import {
  AccessTokenGuard,
  RefreshTokenCookieGuard,
} from './guard/bearer-token.guard';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenCookieGuard, AccessTokenGuard],
})
export class AuthModule {}
