
import type { ConsorcioPlan } from '../types';
import { getAvailableGroups as getPortoGroups } from './portoSeguroApi';
import { getAvailableGroups as getMapfreGroups } from './mapfreApi';

/**
 * Acts as the "Aggregator Microservice".
 * It queries all provider APIs based on the user's initial input
 * to find relevant plans/groups.
 * @param category The desired asset category.
 * @param investment The user's planned monthly investment.
 * @returns A promise that resolves to a combined array of available consórcio plans.
 */
export const findAvailablePlans = async (
  category: 'Automóvel' | 'Imóvel' | 'Serviços',
  investment: number
): Promise<ConsorcioPlan[]> => {
  console.log('Aggregator service started: Searching for plans...');
  
  // Estimate a target asset value. A simple heuristic can be based on a common term length,
  // e.g., 80 months for cars, 180 for properties. This guides the API search.
  const estimatedTerm = category === 'Imóvel' ? 180 : 80;
  const targetValue = investment * estimatedTerm;
  
  // Fetch plans from all providers concurrently
  const [portoPlans, mapfrePlans] = await Promise.all([
    getPortoGroups(category, targetValue),
    getMapfreGroups(category, targetValue)
  ]);

  const allPlans = [...portoPlans, ...mapfrePlans];
  console.log(`Aggregation complete. Total plans found for user profile: ${allPlans.length}`);
  
  return allPlans;
};
