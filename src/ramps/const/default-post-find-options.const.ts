import { FindManyOptions } from 'typeorm';
import { RampsModel } from '../entities/ramps.entity';

export const DEFAULT_RAMPS_FIND_OPTIONS: FindManyOptions<RampsModel> = {
  relations: {},
};
