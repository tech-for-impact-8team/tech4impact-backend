import { Test, TestingModule } from '@nestjs/testing';
import { RampsController } from './ramps.controller';
import { RampsService } from './ramps.service';

describe('RampsController', () => {
  let controller: RampsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RampsController],
      providers: [RampsService],
    }).compile();

    controller = module.get<RampsController>(RampsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
