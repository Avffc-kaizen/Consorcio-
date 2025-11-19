
import type { ConsorcioPlan } from '../types';

/**
 * Simulates fetching consórcio plans from the Mapfre API based on user criteria.
 * @param category The asset category.
 * @param targetValue The estimated asset value the user is looking for.
 * @returns A promise that resolves to an array of Mapfre consórcio plans.
 */
export const getAvailableGroups = async (
  category: 'Automóvel' | 'Imóvel' | 'Serviços',
  targetValue: number
): Promise<ConsorcioPlan[]> => {
  console.log(`Mapfre API: Searching for groups in '${category}' near ${targetValue}...`);

  // Base templates for generating plans dynamically
  const planTemplates = {
    Automóvel: [
        { baseValue: 65000, term: 80, fee: 0.14, nameTemplate: 'Plano Econômico Flex' },
        { baseValue: 95000, term: 75, fee: 0.165, nameTemplate: 'Seu Carro Novo' },
        { baseValue: 140000, term: 70, fee: 0.155, nameTemplate: 'Sedan Executivo' },
        { baseValue: 45000, term: 80, fee: 0.15, nameTemplate: 'Primeiro Carro' },
    ],
    Imóvel: [
        { baseValue: 200000, term: 180, fee: 0.20, nameTemplate: 'Terreno para Construir' },
        { baseValue: 450000, term: 200, fee: 0.185, nameTemplate: 'Lar Doce Lar' },
        { baseValue: 300000, term: 190, fee: 0.19, nameTemplate: 'Investimento Garantido' },
    ],
    Serviços: [
        { baseValue: 30000, term: 36, fee: 0.23, nameTemplate: 'Cirurgia Plástica' },
        { baseValue: 40000, term: 40, fee: 0.21, nameTemplate: 'Educação Garantida' },
    ],
  };

  const relevantTemplates = planTemplates[category];

  const generatedGroups: ConsorcioPlan[] = relevantTemplates
    .map(template => {
      const valueMultiplier = targetValue > 0 ? targetValue / template.baseValue : 1;
      const assetValue = Math.round((template.baseValue * (0.85 + Math.random() * 0.3 * valueMultiplier)) / 5000) * 5000;
      
      if (assetValue <= 0) return null;

      if (Math.abs(assetValue - targetValue) > targetValue * 0.9 && relevantTemplates.length > 1) {
        return null;
      }
      
      const totalCost = assetValue * (1 + template.fee);
      const monthlyInstallment = Math.round(totalCost / template.term);
      
      return {
        provider: 'Mapfre',
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
    .slice(0, 4); // Return up to 4 best matches from Mapfre

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 750));
  
  console.log(`Mapfre API: Found ${generatedGroups.length} matching groups.`);
  return generatedGroups;
};
