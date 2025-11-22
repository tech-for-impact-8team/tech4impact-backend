import { RampsModel } from '../entities/ramps.entity';

export const ORDERABLE_KEYS = new Set<keyof RampsModel>([
  'createdAt',
  'updatedAt',
  'district',
  'type',
  'tradeName',
  'address',
  'width',
  'latitude',
  'longitude',
]);
