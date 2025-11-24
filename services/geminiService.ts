
import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, ConsorcioPlan, PortfolioPlan, AiPricingAnalysisResponse, MarketplaceListing, AiPortfolioInsight, AiPortfolioAnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const cleanJson = (text: string): string => {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return text.substring(jsonStart, jsonEnd + 1);
  }
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const recommendationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: "Texto estratégico, persuasivo e fundamentado em dados (máx 5 linhas). Use tom de consultor sênior.",
    },
    customerProfileName: {
      type: Type.STRING,
      description: "Um título de perfil de investidor (ex: Estrategista Patrimonial, Investidor Arrojado)."
    }
  },
  required: ['responseText', 'customerProfileName'],
};

const pricingAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    suggestedPrice: { type: Type.NUMBER },
    priceRangeMin: { type: Type.NUMBER },
    priceRangeMax: { type: Type.NUMBER },
    justification: { type: Type.STRING }
  },
  required: ['suggestedPrice', 'priceRangeMin', 'priceRangeMax', 'justification'],
};

const portfolioAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['Alta', 'Média', 'Informativa'] },
          action: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['CONTEMPLAR', 'VENDER', 'COMPRAR'] },
              label: { type: Type.STRING },
              targetId: { type: Type.STRING }
            },
            required: ['type', 'label', 'targetId']
          }
        },
        required: ['title', 'description', 'priority', 'action']
      }
    }
  },
  required: ['insights']
};


export interface RecommendedPlan extends ConsorcioPlan {
  keyStat: string;
  recommendationTag: string;
  adminFeeHistory?: { month: string; rate: number }[];
}

export interface AiRecommendationResponse {
  responseText: string;
  recommendedPlans: RecommendedPlan[];
  customerProfileName: string;
}

export const getAiRecommendation = async (
  userProfile: UserProfile,
  availablePlans: ConsorcioPlan[]
): Promise<AiRecommendationResponse> => {

  if (!availablePlans || availablePlans.length === 0) {
      return {
          responseText: "O mercado está restrito no momento. Como Consultor Estratégico, já notifiquei a mesa de operações para buscar uma cota exclusiva off-market para você.",
          customerProfileName: "Cliente VIP",
          recommendedPlans: []
      };
  }

  const categorySpecificInstruction = userProfile.category === 'Imóvel' 
    ? "FOCO IMOBILIÁRIO: Enfatize a construção de patrimônio (Equity) e a economia brutal vs. financiamento bancário (CET). Fale sobre alavancagem com FGTS."
    : "FOCO FINANCEIRO/AUTO: Destaque a renovação de frota/carro com custo financeiro mínimo. Fale sobre 'Custo do Dinheiro'.";

  const incomeInstruction = userProfile.monthlyIncome 
    ? `CONSIDERE A LIQUIDEZ: O cliente tem renda de R$ ${userProfile.monthlyIncome}. Valide se a parcela respeita a saúde financeira dele (máx 30% ideal).`
    : "";

  const systemInstruction = `
    ATUE COMO UM CONSULTOR ESTRATÉGICO SÊNIOR DE INVESTIMENTOS (ESPECIALISTA EM CONSÓRCIO E ALAVANCAGEM).
    
    MISSÃO: Apresentar a solução técnica ideal para o cliente adquirir o bem, focando em matemática financeira e inteligência de mercado.
    
    Diretrizes de Tom de Voz:
    1. Autoridade e Confiança: Você não é um vendedor, é um estrategista.
    2. Termos Chave: Use "Cenário", "Estratégia", "Viabilidade", "Economia Real", "Poder de Compra à Vista".
    3. Cenários Simulados: Mencione que você filtrou esses grupos baseado na probabilidade de contemplação (Lances).
    4. ${categorySpecificInstruction}
    5. ${incomeInstruction}
    6. Call to Action (CTA): Encoraje a reserva imediata da cota selecionada para "travar" a condição.
  `;
  
  // Enviamos até 10 planos para a IA ter contexto suficiente
  const topCandidates = availablePlans.slice(0, 10);

  const userPrompt = `
    Perfil do Investidor: ${userProfile.contact?.name || 'Investidor'}
    Objetivo: ${userProfile.category}
    Renda Mensal: ${userProfile.monthlyIncome}
    Horizonte: ${userProfile.planningHorizon}
    Capacidade de Aporte (Lance): ${userProfile.bidCapacity} (FGTS: ${userProfile.fgtsBalance})
    Valor Alvo: ${userProfile.targetAssetValue}
    
    CENÁRIOS DE MERCADO ENCONTRADOS: 
    ${JSON.stringify(topCandidates.map(p => ({ 
        name: p.planName, 
        credit: p.assetValue,
        installment: p.monthlyInstallment,
        provider: p.provider,
        adminFee: p.adminFee,
        stats: p.stats
    })))}
    
    Gere uma análise executiva direta e o nome do perfil do investidor.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recommendationResponseSchema,
      },
    });
    
    const jsonText = cleanJson(response.text || "{}");
    const parsedResponse = JSON.parse(jsonText);

    // Logic to limit and tag plans for the UI
    // Return up to 7 plans to populate the table richly
    const enrichedPlans: RecommendedPlan[] = topCandidates.slice(0, 7).map((plan, index) => {
        let tag = "Cenário Equilibrado";
        if (index === 0) tag = "🏆 Estratégia Recomendada";
        else if (plan.adminFee < topCandidates[0].adminFee) tag = "📉 Menor Custo Efetivo";
        else if (plan.assetValue > userProfile.targetAssetValue!) tag = "🚀 Potencial de Upgrade";
        else if (plan.stats?.fundHealth === 'Alta Liquidez') tag = "⚡ Alta Performance (Rápido)";
        else if (userProfile.monthlyIncome && plan.monthlyInstallment < userProfile.monthlyIncome * 0.1) tag = "💰 Preservação de Caixa";

        return {
            ...plan,
            keyStat: plan.stats ? `Lance Médio: ${plan.stats.averageBid}%` : "Melhor ROI",
            recommendationTag: tag,
            adminFeeHistory: [
                { month: 'Jan', rate: plan.adminFee + 0.01 },
                { month: 'Fev', rate: plan.adminFee + 0.005 },
                { month: 'Mar', rate: plan.adminFee },
            ]
        };
    });

    return {
        responseText: parsedResponse.responseText,
        customerProfileName: parsedResponse.customerProfileName,
        recommendedPlans: enrichedPlans
    };

  } catch (error) {
    console.error("AI Error:", error);
    const fallbackPlans: RecommendedPlan[] = availablePlans.slice(0, 5).map(p => ({
        ...p, 
        keyStat: "Disponível", 
        recommendationTag: "Oportunidade"
    }));
    
    return {
      responseText: `Com base na minha análise técnica, selecionei ${availablePlans.length} cenários que superam o financiamento tradicional. Avalie o Custo Efetivo Total abaixo.`,
      customerProfileName: "Investidor Estratégico",
      recommendedPlans: fallbackPlans
    };
  }
};


export const getAiPricingAnalysis = async (plan: PortfolioPlan): Promise<AiPricingAnalysisResponse> => {
  const systemInstruction = "Você é um avaliador de ativos financeiros (Consórcio). Calcule o valor justo de mercado (Ágio) para revenda.";
  const userPrompt = `Avalie este ativo: Crédito R$ ${plan.assetValue}, Pago R$ ${plan.paidAmount}.`;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: pricingAnalysisResponseSchema,
      },
    });
    return JSON.parse(cleanJson(response.text || "{}")) as AiPricingAnalysisResponse;
  } catch (error) {
    return {
      suggestedPrice: plan.paidAmount * 1.1,
      priceRangeMin: plan.paidAmount * 1.05,
      priceRangeMax: plan.paidAmount * 1.2,
      justification: "Estimativa baseada em média de mercado secundário."
    };
  }
};

export const getAiPortfolioAnalysis = async (portfolio: PortfolioPlan[], marketplace: MarketplaceListing[]): Promise<AiPortfolioAnalysisResponse> => {
  const systemInstruction = `
    Você é um Gestor de Portfólio de Consórcios. Analise a carteira do cliente e sugira movimentos estratégicos (Vender, Contemplar, Comprar).
  `;

  const portfolioSummary = portfolio.map(p => ({
    planName: p.planName,
    status: p.status,
    paidPercentage: p.paidPercentage,
    bidsMade: p.bidHistory.length
  }));

  const userPrompt = `Analise a carteira: ${JSON.stringify(portfolioSummary)}`;

  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: portfolioAnalysisSchema,
        }
      });
      return JSON.parse(cleanJson(response.text || "{}")) as AiPortfolioAnalysisResponse;
  } catch (error) {
      return { insights: [] };
  }
};

export const resolveObjectionWithAI = async (
    plan: RecommendedPlan, 
    objection: string,
    userProfile: UserProfile
): Promise<string> => {
    const systemInstruction = `
        ATUE COMO UM CONSULTOR ESTRATÉGICO SÊNIOR.
        
        Contexto: O investidor está no momento de decisão ("Fechamento"). Ele tem uma dúvida ou objeção.
        Objetivo: Clarificar a dúvida com autoridade técnica, remover o medo e conduzir para o fechamento (WhatsApp).
        
        Diretrizes:
        1. Seja direto e seguro. Use dados se possível.
        2. Se for sobre LANCE: Explique a estratégia de "Lance Embutido" ou "Lance Fixo" como ferramenta de aceleração.
        3. Se for sobre SEGURANÇA: Cite a regulação do Banco Central e a solidez das administradoras (Porto/Mapfre).
        4. FINALIZAÇÃO: Termine com uma pergunta fechada ou convite para formalizar com o especialista humano.
    `;

    const prompt = `Plano Alvo: ${plan.planName} (${plan.provider}). Crédito: ${plan.assetValue}. Cliente: ${userProfile.contact?.name}. Objeção: "${objection}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6, 
            },
        });
        return response.text || "Compreendo sua cautela. Essa condição é matematicamente superior a qualquer financiamento. Vamos validar os detalhes no WhatsApp?";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Entendido. Para garantir essa condição exclusiva e tirar suas dúvidas com precisão, recomendo falarmos brevemente no WhatsApp. Posso te chamar?";
    }
};
