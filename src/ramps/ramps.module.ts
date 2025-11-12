import { Module } from '@nestjs/common';
import { RampsService } from './ramps.service';
import { RampsController } from './ramps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RampsModel } from './entities/ramps.entity';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RampsModel]),
    CommonModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [RampsController],
  providers: [RampsService],
})
export class RampsModule {}
