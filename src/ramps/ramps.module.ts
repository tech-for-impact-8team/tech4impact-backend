import { Module } from '@nestjs/common';
import { RampsService } from './ramps.service';
import { RampsController } from './ramps.controller';

@Module({
  controllers: [RampsController],
  providers: [RampsService],
})
export class RampsModule {}
