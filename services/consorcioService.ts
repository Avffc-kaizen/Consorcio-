import type { ConsorcioPlan } from '../types';
import { getPortoSeguroPlans } from './portoSeguroApi';
import { getMapfrePlans } from './mapfreApi';

/**
 * Acts as the "Aggregator Microservice" described in the architecture document.
 * It fetches plans from all configured provider APIs and normalizes them into a single list.
 * This decouples the main application from the individual provider APIs.
 * @returns A promise that resolves to a combined array of all available consórcio plans.
 */
export const getAllAvailablePlans = async (): Promise<ConsorcioPlan[]> => {
  console.log('Aggregator service started: Fetching from all providers...');
  
  // Promise.all allows fetching from multiple sources concurrently
  const [portoPlans, mapfrePlans] = await Promise.all([
    getPortoSeguroPlans(),
    getMapfrePlans()
  ]);

  console.log('Aggregation complete. Total plans loaded:', portoPlans.length + mapfrePlans.length);
  
  // Combine the results into a single array
  return [...portoPlans, ...mapfrePlans];
};
