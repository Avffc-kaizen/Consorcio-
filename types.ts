
export type DiagnosticStep = 'category' | 'assetValue' | 'investment' | 'priority' | 'contact' | 'done';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  options?: { text: string; payload: any }[];
  step?: DiagnosticStep;
}

export interface UserProfile {
  category?: 'Automóvel' | 'Imóvel' | 'Serviços';
  assetValueRange?: string;
  investment?: number;
  priority?: 'Velocidade' | 'Economia' | 'Alavancagem';
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ConsorcioPlan {
  provider: 'Porto Seguro' | 'Mapfre';
  planName: string;
  category: 'Automóvel' | 'Imóvel' | 'Serviços';
  assetValue: number;
  termInMonths: number;
  monthlyInstallment: number;
  adminFee: number; // as a percentage, e.g., 0.15 for 15%
}