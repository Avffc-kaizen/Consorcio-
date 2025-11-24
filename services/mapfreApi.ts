
import type { ConsorcioPlan } from '../types';

/**
 * DEPRECATED: The application now uses the Unified Database in consorcioService.ts
 * to read strictly from the "Drive Files".
 */
export const getAvailableGroups = async (
  category: 'Automóvel' | 'Imóvel' | 'Pesados',
  targetValue: number
): Promise<ConsorcioPlan[]> => {
  console.warn(`Mapfre API: Direct search is deprecated. Use consorcioService.ts`);
  return [];
};
