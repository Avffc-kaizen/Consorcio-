
export type DiagnosticStep = 'category' | 'income_check' | 'fgts_check' | 'planning_horizon' | 'objective' | 'bid_analysis' | 'persona_type' | 'target_asset' | 'priority' | 'lead_capture' | 'processing' | 'simulation_presentation' | 'done';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  options?: { text: string; payload: any }[];
  step?: DiagnosticStep;
}

export interface UserProfile {
  category?: 'Automóvel' | 'Imóvel' | 'Pesados';
  monthlyIncome?: number; // Nova métrica estratégica
  planningHorizon?: 'imediato' | 'curto_prazo' | 'medio_prazo' | 'longo_prazo'; // Urgência
  fgtsBalance?: number;
  personaType?: 'PF' | 'PJ';
  targetAssetValue?: number; 
  investment?: number; 
  objective?: 'imediato' | 'investimento' | 'frota';
  bidCapacity?: 'sem_lance' | 'baixo' | 'medio' | 'alto'; 
  priority?: 'Velocidade' | 'Planejamento' | 'Economia' | 'Alavancagem';
  contact?: {
    name: string;
    email: string;
    phone: string;
    referralSource?: string;
  };
}

export interface GroupStatistics {
    averageBid: number; // Média histórica em %
    lastBid: number;    // Último corte em %
    maxBid: number;     // Teto histórico
    contemplationsPerMonth: number; // Média de contemplados
    assembliesHeld: number; // Idade do grupo em meses
    fundHealth: 'Crítico' | 'Estável' | 'Alta Liquidez'; // Saúde do caixa
    bidTrend: 'Alta' | 'Estável' | 'Queda'; // Tendência dos lances
}

export interface ConsorcioPlan {
  provider: 'Porto Seguro' | 'Mapfre' | 'Bancorbrás';
  planName: string;
  category: 'Automóvel' | 'Imóvel' | 'Pesados';
  assetValue: number;
  termInMonths: number;
  monthlyInstallment: number;
  adminFee: number; // as a percentage, e.g., 0.15 for 15%
  recommendationTag?: string;
  keyStat?: string;
  features?: string[]; 
  stats?: GroupStatistics; // Dados de Inteligência de Mercado
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

export interface EtlLog {
    id: string;
    timestamp: string;
    level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
    message: string;
    source?: 'Drive' | 'Parser' | 'Database' | 'Market Intelligence';
}

export interface EtlPipelineStatus {
    isRunning: boolean;
    lastRun: string | null;
    totalIngested: number;
}

// --- GAMIFICATION TYPES ---

export type WeeklyQuoteType = 'Motivacional' | 'Estratégica' | 'Divina' | 'Financeira';

export interface WeeklyQuote {
  id: string;
  text: string;
  author: string;
  type: WeeklyQuoteType;
  unlockedAt?: string; // Date ISO string
}

export interface GamificationProfile {
  level: number;
  levelTitle: string; // e.g., "Aprendiz", "Estrategista", "Magnata"
  currentPoints: number; // Pontos de Alavancagem (ALV)
  nextLevelThreshold: number;
  streakDays: number; // Dias consecutivos de login/atividade
  lastActivityDate: string;
  unlockedQuotes: WeeklyQuote[];
  nextQuoteUnlockDate: string; // When the next quote is available
}
