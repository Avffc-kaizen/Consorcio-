
import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, ConsorcioPlan, PortfolioPlan, AiPricingAnalysisResponse, MarketplaceListing, AiPortfolioInsight, AiPortfolioAnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const cleanJson = (text: string): string => {
  // More robust JSON extraction
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return text.substring(jsonStart, jsonEnd + 1);
  }
  // Fallback to removing markdown if precise extraction fails
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const recommendationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: "Uma mensagem persuasiva e estruturada, atuando como um Arquiteto Financeiro. Explique as 3 estratégias apresentadas (Custo, Prazo, Equilíbrio) e destaque a diferença entre as seguradoras.",
    },
    customerProfileName: {
      type: Type.STRING,
      description: "O nome do perfil do cliente identificado pela IA. Ex: 'Investidor de Longo Prazo', 'Estrategista de Liquidez'."
    },
    recommendedPlans: {
      type: Type.ARRAY,
      description: "Um array contendo EXATAMENTE 3 opções de planos para comparação.",
      items: {
        type: Type.OBJECT,
        properties: {
          provider: { type: Type.STRING, enum: ['Porto Seguro', 'Mapfre'] },
          planName: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['Automóvel', 'Imóvel', 'Serviços'] },
          assetValue: { type: Type.NUMBER },
          termInMonths: { type: Type.NUMBER },
          monthlyInstallment: { type: Type.NUMBER },
          adminFee: { type: Type.NUMBER },
          keyStat: { 
            type: Type.STRING,
            description: "Uma estatística chave poderosa. Ex: 'Taxa 20% menor que a média', 'Histórico de 15 contemplações/mês'."
          },
          recommendationTag: {
            type: Type.STRING,
            description: "A etiqueta da estratégia. Deve ser: 'Menor Custo Final', 'Maior Chance de Contemplação' ou 'Melhor Custo-Benefício'."
          },
          adminFeeHistory: {
            type: Type.ARRAY,
            description: "Opcional. Histórico de taxas.",
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                rate: { type: Type.NUMBER }
              },
              required: ['month', 'rate']
            }
          }
        },
        required: ['provider', 'planName', 'category', 'assetValue', 'termInMonths', 'monthlyInstallment', 'adminFee', 'keyStat', 'recommendationTag'],
      },
    },
  },
  required: ['responseText', 'customerProfileName', 'recommendedPlans'],
};

const pricingAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    suggestedPrice: {
      type: Type.NUMBER,
      description: "O preço de venda sugerido, calculado como o valor pago mais um 'ágio' (prêmio) de mercado justo. Deve ser um número inteiro."
    },
    priceRangeMin: {
      type: Type.NUMBER,
      description: "O preço mínimo para uma venda rápida. Geralmente, o valor pago com um pequeno ágio. Deve ser um número inteiro."
    },
    priceRangeMax: {
      type: Type.NUMBER,
      description: "O preço máximo para maximizar o lucro, visando um comprador com urgência. Deve ser um número inteiro."
    },
    justification: {
      type: Type.STRING,
      description: "Uma análise curta e estratégica explicando a lógica por trás da sugestão de preço. Mencione a liquidez do ativo e o valor do 'ágio' como um prêmio pela conveniência oferecida ao comprador."
    }
  },
  required: ['suggestedPrice', 'priceRangeMin', 'priceRangeMax', 'justification'],
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

  const systemInstruction = `
    Você é o "Arquiteto Financeiro Sênior" do EAP (Ecossistema de Alavancagem Patrimonial).
    
    Sua Missão:
    Projetar a estrutura financeira ideal para o cliente adquirir ativos sem juros.
    Não aja como um vendedor, aja como um Engenheiro de Patrimônio. Use termos como "Fundação", "Estrutura", "Aceleração", "Liquidez".
    
    Diretrizes de Seleção (Busque diversidade entre Porto Seguro e Mapfre):
    1. ESTRUTURA 1 (Equilíbrio): O melhor balanço entre prazo e custo.
    2. ESTRUTURA 2 (Custo Mínimo): A menor taxa de administração para quem visa lucro final na alavancagem.
    3. ESTRUTURA 3 (Aceleração/Lance): Grupos propícios para contemplação rápida via lance.

    Se o usuário priorizou "Velocidade", foque em grupos com características de lance agressivo.
    
    Retorne APENAS JSON válido. SEM markdown.
  `;
  
  const plansContent = availablePlans.length > 0 
    ? `MATERIAIS DE CONSTRUÇÃO DISPONÍVEIS (PLANOS):
      ${JSON.stringify(availablePlans, null, 2)}`
    : `AVISO: Crie 3 planos hipotéticos realistas (Porto Seguro e Mapfre) para comparação.`;

  const userPrompt = `
    PERFIL DO PROJETO:
    - Objetivo da Construção: ${userProfile.category}
    - Fluxo de Caixa Mensal: R$ ${userProfile.investment}
    - Pilar Prioritário: ${userProfile.priority}

    ${plansContent}

    Desenhe o projeto com 3 opções estruturais distintas.
    O 'responseText' deve ser o seu parecer técnico de Arquiteto, explicando por que essas 3 opções formam o melhor projeto.
    O 'customerProfileName' deve ser um arquétipo como 'Construtor de Renda', 'Arquiteto de Futuro', 'Investidor de Valor'.
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
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON. Raw text:", response.text);
        throw new Error("Invalid JSON format from AI");
    }

    if (parsedResponse.responseText && parsedResponse.customerProfileName && Array.isArray(parsedResponse.recommendedPlans)) {
      return parsedResponse as AiRecommendationResponse;
    } else {
      throw new Error("Invalid JSON structure received from AI.");
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    // Fallback mock data ensuring 3 options
    return {
      responseText: "Desenhei 3 projetos estruturais distintos para sua análise. O foco aqui é garantir que a fundação (custo) e a estrutura (prazo) estejam alinhadas com seu objetivo de alavancagem.",
      customerProfileName: "Arquiteto de Patrimônio",
      recommendedPlans: [
          {
            ...availablePlans[0] || {},
            provider: 'Porto Seguro',
            planName: 'Auto Premium 80k',
            category: 'Automóvel',
            assetValue: 80000,
            termInMonths: 80,
            monthlyInstallment: 1150,
            adminFee: 0.16,
            keyStat: "Maior índice de contemplação",
            recommendationTag: "Melhor Custo-Benefício"
          },
          {
             provider: 'Mapfre',
             planName: 'Economia Flex 80k',
             category: 'Automóvel',
             assetValue: 80000,
             termInMonths: 90,
             monthlyInstallment: 1020,
             adminFee: 0.14,
             keyStat: "Taxa 14% (Menor do Mercado)",
             recommendationTag: "Menor Custo Final"
          },
          {
             provider: 'Porto Seguro',
             planName: 'Acelerador 80k',
             category: 'Automóvel',
             assetValue: 80000,
             termInMonths: 70,
             monthlyInstallment: 1350,
             adminFee: 0.17,
             keyStat: "Permite Lance Embutido 30%",
             recommendationTag: "Maior Chance de Contemplação"
          }
      ],
    };
  }
};


export const getAiPricingAnalysis = async (plan: PortfolioPlan): Promise<AiPricingAnalysisResponse> => {
  const systemInstruction = `
    Você é um avaliador de ativos financeiros.
    Retorne APENAS JSON válido.
  `;
  const userPrompt = `
    Avalie esta cota:
    - Crédito: R$ ${plan.assetValue}
    - Pago: R$ ${plan.paidAmount}
    
    Gere um preço de venda com ágio justo.
  `;

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

    const jsonText = cleanJson(response.text || "{}");
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as AiPricingAnalysisResponse;

  } catch (error) {
    const fallbackPrice = Math.round((plan.paidAmount * 1.1) / 50) * 50;
    return {
      suggestedPrice: fallbackPrice,
      priceRangeMin: Math.round((plan.paidAmount * 1.05) / 50) * 50,
      priceRangeMax: Math.round((plan.paidAmount * 1.15) / 50) * 50,
      justification: "Estimativa baseada em média de mercado devido à indisponibilidade da IA."
    };
  }
};

export const getAiPortfolioAnalysis = async (portfolio: PortfolioPlan[], marketplace: MarketplaceListing[]): Promise<AiPortfolioAnalysisResponse> => {
  // Updated logic: The "Architect" suggests the next steps for the project
  const mockInsights: AiPortfolioInsight[] = [];
  
  // 1. Contemplation Opportunity (The "Roof" is ready)
  const contemplationOpportunity = portfolio.find(p => p.status === 'Ativa' && p.paidPercentage > 0.30);
  if (contemplationOpportunity) {
      mockInsights.push({
          title: "Estrutura Pronta para Cobertura",
          description: `O plano '${contemplationOpportunity.planName}' atingiu 30% de maturação. A estrutura está sólida. Um lance estratégico agora tem alta probabilidade de contemplação, permitindo a aquisição do bem.`,
          priority: 'Alta',
          action: { type: 'CONTEMPLAR', label: 'Simular Lance', targetId: contemplationOpportunity.planName }
      });
  }

  // 2. Expansion/Leverage Insight (New Foundation)
  // If user has healthy plans, suggest expanding the project
  const healthyPlans = portfolio.filter(p => p.status === 'Ativa' || p.status === 'Contemplada');
  if (healthyPlans.length > 0 && mockInsights.length < 3) {
      mockInsights.push({
          title: "Expansão do Projeto",
          description: `Sua fundação financeira está estável. É o momento ideal para iniciar uma nova torre no seu ciclo de alavancagem. Adquirir uma nova carta agora cria um fluxo de caixa futuro escalonado.`,
          priority: 'Média',
          action: { type: 'COMPRAR', label: 'Nova Aquisição', targetId: 'new_acquisition' }
      });
  }
  
  // 3. Maintenance (Regularity)
  if (mockInsights.length === 0 && portfolio.length > 0) {
       mockInsights.push({
          title: "Inspeção de Rotina",
          description: `Seu projeto segue o cronograma perfeitamente. A regularidade dos pagamentos é o cimento dessa construção. Continue assim para manter seu score alto no grupo.`,
          priority: 'Informativa',
          action: { type: 'CONTEMPLAR', label: 'Ver Detalhes', targetId: '' }
      });
  }

  await new Promise(resolve => setTimeout(resolve, 1000)); 
  
  return { insights: mockInsights.slice(0,3) };
};
