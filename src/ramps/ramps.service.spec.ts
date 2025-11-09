import { Test, TestingModule } from '@nestjs/testing';
import { RampsService } from './ramps.service';

describe('RampsService', () => {
  let service: RampsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RampsService],
    }).compile();

    service = module.get<RampsService>(RampsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
