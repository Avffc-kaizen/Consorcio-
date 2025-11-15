

import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, ConsorcioPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: "Uma mensagem persuasiva para o painel de decisão, explicando POR QUE a recomendação é a melhor estratégia para o perfil do usuário (Velocidade, Economia ou Alavancagem).",
    },
    customerProfileName: {
      type: Type.STRING,
      description: "O nome do perfil do cliente identificado pela IA. Ex: 'Investidor Alavancador', 'Financiador Frustrado', 'Planejador Disciplinado'."
    },
    recommendedPlans: {
      type: Type.ARRAY,
      description: "Um array contendo as melhores opções de cada provedor (idealmente uma da Porto Seguro e uma da Mapfre), até um máximo de 3 planos.",
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
            description: "Uma estatística chave e poderosa para o plano, adaptada ao perfil. Perfil 'Velocidade': focar em lance (ex: 'Contemplação rápida: Lances de 25-30%'). Perfil 'Economia': focar em economia (ex: 'Custo 85% menor que financiamento'). Perfil 'Alavancagem': focar em poder de compra (ex: 'R$5 de crédito para cada R$1 investido no prazo total')."
          },
        },
        required: ['provider', 'planName', 'category', 'assetValue', 'termInMonths', 'monthlyInstallment', 'adminFee', 'keyStat'],
      },
    },
  },
  required: ['responseText', 'customerProfileName', 'recommendedPlans'],
};

export interface RecommendedPlan extends ConsorcioPlan {
  keyStat: string;
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
    Você é um consultor financeiro sênior, especialista em alavancagem de ativos via consórcio. Sua missão é analisar o perfil do cliente e os planos disponíveis para apresentar a estratégia de aquisição mais inteligente e decisiva. Siga as regras de análise estritamente e retorne a resposta no formato JSON solicitado.
  `;
  
  const userPrompt = `
    Por favor, analise o perfil de cliente e a lista de planos de consórcio abaixo para gerar a melhor recomendação estratégica.

    PERFIL DO CLIENTE:
    - Categoria do Bem: ${userProfile.category}
    - Faixa de Valor do Bem: ${userProfile.assetValueRange}
    - Investimento Mensal Planejado: R$ ${userProfile.investment}
    - Prioridade Principal: ${userProfile.priority}

    PLANOS DISPONÍVEIS PARA ANÁLISE:
    ${JSON.stringify(availablePlans, null, 2)}

    REGRAS DE ANÁLISE ESTRATÉGICA:
    0.  CLASSIFIQUE O PERFIL: Primeiro, classifique o cliente em um dos perfis e retorne no campo 'customerProfileName':
        - SE a prioridade for 'Velocidade', classifique como 'Financiador Frustrado'.
        - SE a prioridade for 'Economia', classifique como 'Planejador Disciplinado'.
        - SE a prioridade for 'Alavancagem', classifique como 'Investidor Alavancador'.

    1.  FILTRE PELA CATEGORIA E VALOR: Filtre os planos disponíveis para que a 'category' corresponda à 'Categoria do Bem' do cliente e o 'assetValue' esteja dentro da 'Faixa de Valor do Bem' informada.

    2.  APLIQUE A LÓGICA DA 'PRIORIDADE' (REGRA MAIS IMPORTANTE): Sua principal tarefa é selecionar as MELHORES OPÇÕES ESTRATÉGICAS para o cliente, idealmente UMA DA 'PORTO SEGURO' e UMA DA 'MAPFRE', para que ele possa comparar.
        
        - Para cada provedor ('Porto Seguro' e 'Mapfre'), encontre o melhor plano que se encaixa na prioridade do cliente:

        - SE o perfil for 'Financiador Frustrado' (Prioridade: Velocidade):
            - Para cada provedor, encontre o plano que oferece o MAIOR 'assetValue' (crédito) possível, desde que a 'monthlyInstallment' não ultrapasse o 'Investimento Mensal' em mais de 20%. Prazos ('termInMonths') mais curtos são um bônus.
            - Sua 'responseText' deve focar em oportunidade e agilidade, comparando as opções. Exemplo: "Apresento as duas estratégias com maior probabilidade de contemplação rápida. A Porto Seguro oferece X, enquanto a Mapfre foca em Y. Ambas permitem usar o capital de entrada de um financiamento para acelerar a aquisição sem juros."
            - O 'keyStat' para este perfil DEVE ser sobre velocidade/lance. Exemplo: "Histórico de contemplação: Lances entre 25-30%."

        - SE o perfil for 'Planejador Disciplinado' (Prioridade: Economia):
            - Para cada provedor, encontre o plano com a MENOR 'adminFee' (taxa de administração), desde que a 'monthlyInstallment' se encaixe no orçamento ('Investimento Mensal').
            - Sua 'responseText' deve focar em como a menor taxa é a decisão mais inteligente a longo prazo. Exemplo: "Para seu perfil focado em economia, a estratégia inteligente é minimizar o custo total. Apresentamos os planos com as menores taxas de cada provedor, garantindo a máxima economia."
            - O 'keyStat' para este perfil DEVE ser sobre a economia. Exemplo: "Custo Total 85% menor que financiamento."

        - SE o perfil for 'Investidor Alavancador' (Prioridade: Alavancagem):
            - Para cada provedor, encontre o plano que oferece o MAIOR 'assetValue' (crédito), mesmo que tenha um prazo 'termInMonths' maior, desde que a 'monthlyInstallment' (parcela) se mantenha o mais próximo possível do 'Investimento Mensal' do cliente.
            - Sua 'responseText' deve focar em como o consórcio permite adquirir um patrimônio maior com o mesmo investimento. Exemplo: "Sua prioridade é alavancagem. A estratégia da Porto Seguro maximiza seu crédito em X, enquanto a Mapfre oferece Y. Ambas multiplicam seu poder de compra."
            - O 'keyStat' para este perfil DEVE ser sobre o poder de compra. Exemplo: "Maior poder de compra da categoria." ou "Adquira um crédito 30% maior com a mesma parcela."

    3.  FORMATE A RESPOSTA: Retorne um único objeto JSON válido, contendo as melhores opções de cada provedor (idealmente 2 planos no total), seguindo estritamente o schema fornecido. Se para um provedor não houver nenhum plano que se encaixe nos filtros, você pode retornar apenas o plano do outro.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text;
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse.responseText && parsedResponse.customerProfileName && Array.isArray(parsedResponse.recommendedPlans)) {
      return parsedResponse as AiRecommendationResponse;
    } else {
      console.error("Invalid JSON structure received:", parsedResponse);
      throw new Error("Invalid JSON structure received from AI.");
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    // Provide a fallback response in case of an error
    return {
      responseText: "Não foi possível gerar uma recomendação neste momento. Nossa IA pode estar sobrecarregada. Por favor, tente novamente mais tarde.",
      customerProfileName: "Indefinido",
      recommendedPlans: [],
    };
  }
};
