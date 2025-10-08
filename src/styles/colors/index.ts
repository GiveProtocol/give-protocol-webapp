export * from './base';
export * from './brand';
export * from './semantic';
export * from './components';

import { baseColors } from './base';
import { brandColors } from './brand';
import { semanticColors } from './semantic';
import { componentColors } from './components';

export const colors = {
  ...baseColors,
  brand: brandColors,
  status: semanticColors,
  ...componentColors,
} as const;