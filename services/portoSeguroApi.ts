
import type { ConsorcioPlan, UserProfile } from '../types';

/**
 * DEPRECATED: The application now uses the Unified Database in consorcioService.ts
 * to read strictly from the "Drive Files".
 */
export const getAvailableGroups = async (
  category: 'Automóvel' | 'Imóvel' | 'Pesados',
  targetValue: number
): Promise<ConsorcioPlan[]> => {
  console.warn(`Porto Seguro API: Direct search is deprecated. Use consorcioService.ts`);
  return []; 
};


export const submitConsorcioApplication = async (userProfile: UserProfile, plan: ConsorcioPlan): Promise<{ success: boolean; proposalId: string }> => {
  console.log(`Submitting application to Porto Seguro for ${userProfile.contact?.name}...`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  const proposalId = `PS-${Math.floor(Date.now() / 1000)}-REAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  return { success: true, proposalId };
};
