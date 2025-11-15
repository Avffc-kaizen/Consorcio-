import type { ConsorcioPlan } from '../types';

const mockMapfrePlans: ConsorcioPlan[] = [
    // Automóveis
     {
      provider: 'Mapfre',
      planName: 'Meu Primeiro Carro',
      category: 'Automóvel',
      assetValue: 45000,
      termInMonths: 84,
      monthlyInstallment: 590,
      adminFee: 0.155,
    },
     {
      provider: 'Mapfre',
      planName: 'Plano Econômico Flex',
      category: 'Automóvel',
      assetValue: 65000,
      termInMonths: 80,
      monthlyInstallment: 890,
      adminFee: 0.14,
    },
    {
      provider: 'Mapfre',
      planName: 'Seu Carro Novo',
      category: 'Automóvel',
      assetValue: 95000,
      termInMonths: 75,
      monthlyInstallment: 1350,
      adminFee: 0.165,
    },
    {
      provider: 'Mapfre',
      planName: 'SUV Família',
      category: 'Automóvel',
      assetValue: 115000,
      termInMonths: 72,
      monthlyInstallment: 1700,
      adminFee: 0.16,
    },
    {
      provider: 'Mapfre',
      planName: 'Sedan Executivo',
      category: 'Automóvel',
      assetValue: 140000,
      termInMonths: 70,
      monthlyInstallment: 2150,
      adminFee: 0.155,
    },
    {
      provider: 'Mapfre',
      planName: 'Mapfre Utilitários',
      category: 'Automóvel',
      assetValue: 180000,
      termInMonths: 60,
      monthlyInstallment: 3150,
      adminFee: 0.15,
    },
    {
      provider: 'Mapfre',
      planName: 'Elétrico do Futuro',
      category: 'Automóvel',
      assetValue: 250000,
      termInMonths: 72,
      monthlyInstallment: 3700,
      adminFee: 0.16,
    },
    // Imóveis
    {
      provider: 'Mapfre',
      planName: 'Terreno para Construir',
      category: 'Imóvel',
      assetValue: 200000,
      termInMonths: 180,
      monthlyInstallment: 1200,
      adminFee: 0.20,
    },
    {
      provider: 'Mapfre',
      planName: 'Lar Doce Lar',
      category: 'Imóvel',
      assetValue: 450000,
      termInMonths: 200,
      monthlyInstallment: 2400,
      adminFee: 0.185,
    },
    {
      provider: 'Mapfre',
      planName: 'Imóvel Comercial',
      category: 'Imóvel',
      assetValue: 900000,
      termInMonths: 150,
      monthlyInstallment: 6300,
      adminFee: 0.175,
    },
    // Serviços
    {
        provider: 'Mapfre',
        planName: 'Cirurgia Plástica',
        category: 'Serviços',
        assetValue: 30000,
        termInMonths: 36,
        monthlyInstallment: 900,
        adminFee: 0.23,
    },
    {
        provider: 'Mapfre',
        planName: 'Educação Garantida',
        category: 'Serviços',
        assetValue: 40000,
        termInMonths: 40,
        monthlyInstallment: 1050,
        adminFee: 0.21,
    },
];

/**
 * Simulates fetching consórcio plans from the Mapfre API.
 * In a real implementation, this would involve connecting to Mapfre's partner portal or dedicated B2B service.
 * @returns A promise that resolves to an array of Mapfre consórcio plans.
 */
export const getMapfrePlans = async (): Promise<ConsorcioPlan[]> => {
  console.log('Connecting to Mapfre API...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 450));
  console.log('Successfully fetched plans from Mapfre.');
  return mockMapfrePlans;
};