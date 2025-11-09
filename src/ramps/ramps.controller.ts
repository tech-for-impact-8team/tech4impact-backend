import { Controller } from '@nestjs/common';
import { RampsService } from './ramps.service';

@Controller('ramps')
export class RampsController {
  constructor(private readonly rampsService: RampsService) {}
}
