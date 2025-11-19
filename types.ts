

export type DiagnosticStep = 'category' | 'investment' | 'priority' | 'contact' | 'done';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  options?: { text: string; payload: any }[];
  step?: DiagnosticStep;
}

export interface UserProfile {
  category?: 'Automóvel' | 'Imóvel' | 'Serviços';
  investment?: number;
  priority?: 'Velocidade' | 'Economia' | 'Alavancagem';
  contact?: {
    name: string;
    email: string;
    phone: string;
    referralSource?: string;
  };
}

export interface ConsorcioPlan {
  // FIX: Added 'Mapfre' to the provider type to support multiple providers.
  provider: 'Porto Seguro' | 'Mapfre';
  planName: string;
  category: 'Automóvel' | 'Imóvel' | 'Serviços';
  assetValue: number;
  termInMonths: number;
  monthlyInstallment: number;
  adminFee: number; // as a percentage, e.g., 0.15 for 15%
}

export type PortfolioPlanStatus = 'Ativa' | 'Contemplada' | 'Quitada' | 'À Venda' | 'Em Análise (Anuência)';

export interface Payment {
    date: string;
    amount: number;
    type: 'Parcela' | 'Lance';
}

export interface Bid {
    date: string;
    amount: number;
    status: 'Aceito' | 'Recusado' | 'Pendente';
}

export interface PortfolioPlan extends ConsorcioPlan {
    status: PortfolioPlanStatus;
    paidAmount: number;
    paidPercentage: number;
    installmentsPaid: number;
    nextDueDate: string;
    paymentHistory: Payment[];
    bidHistory: Bid[];
}

export type MarketplaceListingStatus = 'Disponível' | 'Negociação Iniciada';

export type OrchestrationStatus = 'dossie_concluido' | 'enviado_administradora' | 'anuencia_aprovada' | 'transferencia_concluida';
export type OpenFinanceStatus = 'nao_iniciado' | 'conectando' | 'analisando' | 'concluido';

export interface Proposal {
    orchestrationStatus: OrchestrationStatus;
    openFinanceStatus: OpenFinanceStatus;
    timestamp: string;
}

export interface MarketplaceListing {
    id: string;
    plan: ConsorcioPlan;
    paidPercentage: number;
    askingPrice: number;
    sellerName: string;
    profitPercentage: number;
    listingStatus: MarketplaceListingStatus;
    proposal?: Proposal;
}

export type UserVerificationStatus = 'unverified' | 'pending' | 'verified';

export interface AiPricingAnalysisResponse {
  suggestedPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  justification: string;
}

export type InsightPriority = 'Alta' | 'Média' | 'Informativa';
export type InsightActionType = 'CONTEMPLAR' | 'VENDER' | 'COMPRAR';

export interface AiPortfolioInsight {
  title: string;
  description: string;
  priority: InsightPriority;
  action: {
    type: InsightActionType;
    label: string;
    targetId?: string; 
  };
}

export interface AiPortfolioAnalysisResponse {
    insights: AiPortfolioInsight[];
}