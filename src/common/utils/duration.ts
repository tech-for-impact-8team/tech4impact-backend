// src/common/utils/duration.ts
import * as ms from 'ms';

export const toMs = (v: string | number | undefined, fallbackMs: number) => {
  if (v == null) return fallbackMs;
  if (typeof v == 'number') return v;
  const parsed = ms(v as any);
  return typeof parsed === 'number' ? parsed : fallbackMs;
};
