
import type { ConsorcioPlan, UserProfile } from '../types';

// In a real scenario, these credentials would be securely managed and used to authenticate API requests.
// As per the architecture report, the provided token is for a different service, 
// but we include it here symbolically for the future API connector.
const API_TOKEN = 'SlpSB09151125121227';
const API_PASSWORD = 'fszbs30h';

/**
 * Simulates a more realistic API call where we query for available groups
 * based on user's needs, instead of fetching a static list.
 * @param category The asset category.
 * @param targetValue The estimated asset value the user is looking for.
 * @returns A promise that resolves to an array of matching Porto Seguro consórcio plans.
 */
export const getAvailableGroups = async (
  category: 'Automóvel' | 'Imóvel' | 'Serviços',
  targetValue: number
): Promise<ConsorcioPlan[]> => {
  console.log(`Porto Seguro API: Searching for groups in '${category}' near ${targetValue}...`);

  // Base templates for generating plans dynamically
  const planTemplates = {
    Automóvel: [
      { baseValue: 80000, term: 80, fee: 0.18, nameTemplate: 'Auto Essencial' },
      { baseValue: 150000, term: 72, fee: 0.17, nameTemplate: 'Auto Premium' },
      { baseValue: 200000, term: 60, fee: 0.16, nameTemplate: 'SUV Confort' },
      { baseValue: 50000, term: 80, fee: 0.19, nameTemplate: 'Auto Entrada' },
    ],
    Imóvel: [
      { baseValue: 300000, term: 200, fee: 0.20, nameTemplate: 'Meu Apê' },
      { baseValue: 700000, term: 180, fee: 0.19, nameTemplate: 'Casa dos Sonhos' },
      { baseValue: 1200000, term: 200, fee: 0.18, nameTemplate: 'Investidor Imobiliário' },
      { baseValue: 250000, term: 210, fee: 0.21, nameTemplate: 'Imóvel Compacto' },
    ],
    Serviços: [
      { baseValue: 25000, term: 36, fee: 0.25, nameTemplate: 'Viagem Inesquecível' },
      { baseValue: 50000, term: 48, fee: 0.22, nameTemplate: 'Reforma e Construção' },
      { baseValue: 35000, term: 40, fee: 0.23, nameTemplate: 'Estética e Saúde' },
    ],
  };

  const relevantTemplates = planTemplates[category];

  // Generate more options (up to 6) to allow AI to filter better for the 3 slots
  const generatedGroups: ConsorcioPlan[] = relevantTemplates
    .map(template => {
      // Create variations around the target value
      const valueMultiplier = targetValue > 0 ? targetValue / template.baseValue : 1;
      const assetValue = Math.round((template.baseValue * (0.8 + Math.random() * 0.4 * valueMultiplier)) / 5000) * 5000;

      if (assetValue <= 0) return null;

      // Ensure the generated value is within a reasonable range of the target
      if (Math.abs(assetValue - targetValue) > targetValue * 0.85 && relevantTemplates.length > 1) {
        return null;
      }
      
      const totalCost = assetValue * (1 + template.fee);
      const monthlyInstallment = Math.round(totalCost / template.term);
      
      return {
        provider: 'Porto Seguro',
        planName: `${template.nameTemplate} ${Math.round(assetValue / 1000)}k`,
        category,
        assetValue,
        termInMonths: template.term,
        monthlyInstallment,
        adminFee: template.fee,
      };
    })
    .filter((plan): plan is ConsorcioPlan => plan !== null)
    .sort((a, b) => Math.abs(a.assetValue - targetValue) - Math.abs(b.assetValue - targetValue))
    .slice(0, 5); // Return up to 5 best matches

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 650));
  
  console.log(`Porto Seguro API: Found ${generatedGroups.length} matching groups.`);
  return generatedGroups;
};


/**
 * Simulates submitting a consórcio application directly to Porto Seguro's system.
 * In a real scenario, this would be a secure, authenticated POST request with the user's and plan's data.
 * @param userProfile The user's collected profile data.
 * @param plan The specific plan the user is contracting.
 * @returns A promise that resolves to a mock submission response.
 */
// FIX: The UserProfile type was not imported, causing a build error.
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
