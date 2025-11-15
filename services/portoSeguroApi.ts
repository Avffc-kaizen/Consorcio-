import type { ConsorcioPlan, UserProfile } from '../types';

// In a real scenario, these credentials would be securely managed and used to authenticate API requests.
// As per the architecture report, the provided token is for a different service, 
// but we include it here symbolically for the future API connector.
const API_TOKEN = 'SlpSB09151125121227';
const API_PASSWORD = 'fszbs30h';

const mockPortoSeguroPlans: ConsorcioPlan[] = [
  // Automóveis
  {
    provider: 'Porto Seguro',
    planName: 'Moto Urbana',
    category: 'Automóvel',
    assetValue: 35000,
    termInMonths: 60,
    monthlyInstallment: 650,
    adminFee: 0.21,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Auto Básico',
    category: 'Automóvel',
    assetValue: 80000,
    termInMonths: 80,
    monthlyInstallment: 1100,
    adminFee: 0.18,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Auto Premium',
    category: 'Automóvel',
    assetValue: 150000,
    termInMonths: 72,
    monthlyInstallment: 2200,
    adminFee: 0.17,
  },
  {
    provider: 'Porto Seguro',
    planName: 'SUV Confort',
    category: 'Automóvel',
    assetValue: 200000,
    termInMonths: 60,
    monthlyInstallment: 3500,
    adminFee: 0.16,
  },
   {
    provider: 'Porto Seguro',
    planName: 'Frota Empresarial',
    category: 'Automóvel',
    assetValue: 500000,
    termInMonths: 80,
    monthlyInstallment: 6600,
    adminFee: 0.15,
  },
  // Imóveis
  {
    provider: 'Porto Seguro',
    planName: 'Meu Apê',
    category: 'Imóvel',
    assetValue: 300000,
    termInMonths: 200,
    monthlyInstallment: 1650,
    adminFee: 0.20,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Casa dos Sonhos',
    category: 'Imóvel',
    assetValue: 700000,
    termInMonths: 180,
    monthlyInstallment: 4100,
    adminFee: 0.19,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Investidor Imobiliário',
    category: 'Imóvel',
    assetValue: 1200000,
    termInMonths: 200,
    monthlyInstallment: 6500,
    adminFee: 0.18,
  },
  // Serviços
  {
    provider: 'Porto Seguro',
    planName: 'Viagem Inesquecível',
    category: 'Serviços',
    assetValue: 25000,
    termInMonths: 36,
    monthlyInstallment: 750,
    adminFee: 0.25,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Festa dos Sonhos',
    category: 'Serviços',
    assetValue: 40000,
    termInMonths: 40,
    monthlyInstallment: 1100,
    adminFee: 0.24,
  },
  {
    provider: 'Porto Seguro',
    planName: 'Reforma e Construção',
    category: 'Serviços',
    assetValue: 50000,
    termInMonths: 48,
    monthlyInstallment: 1150,
    adminFee: 0.22,
  },
];

/**
 * Simulates fetching consórcio plans from the Porto Seguro API.
 * In a real implementation, this function would use fetch() to make a network request
 * to the official Porto Seguro API endpoint, using the necessary authentication headers.
 * @returns A promise that resolves to an array of Porto Seguro consórcio plans.
 */
export const getPortoSeguroPlans = async (): Promise<ConsorcioPlan[]> => {
  console.log(`Connecting to Porto Seguro API with token ${API_TOKEN.substring(0, 8)}...`);
  // Simulate network delay to mimic a real API call
  await new Promise(resolve => setTimeout(resolve, 350));
  console.log('Successfully fetched plans from Porto Seguro.');
  return mockPortoSeguroPlans;
};

/**
 * Simulates submitting a consórcio application directly to Porto Seguro's system.
 * In a real scenario, this would be a secure, authenticated POST request with the user's and plan's data.
 * @param userProfile The user's collected profile data.
 * @param plan The specific plan the user is contracting.
 * @returns A promise that resolves to a mock submission response.
 */
export const submitConsorcioApplication = async (userProfile: UserProfile, plan: ConsorcioPlan): Promise<{ success: boolean; proposalId: string }> => {
  console.log(`Submitting application to Porto Seguro for ${userProfile.contact?.name}...`);
  console.log('Plan:', plan.planName);
  console.log('User Data:', userProfile.contact);
  
  // Simulate network delay for the API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  const proposalId = `PS-${Math.floor(Date.now() / 1000)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  console.log(`Porto Seguro API responded successfully. Proposal ID: ${proposalId}`);
  
  return { success: true, proposalId };
};