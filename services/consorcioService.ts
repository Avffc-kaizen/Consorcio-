
import type { ConsorcioPlan, EtlLog, GroupStatistics } from '../types';

const INGESTED_DATA_KEY = 'eap_market_intelligence_db_v7_expanded';
const TARGET_FOLDER_PATH = 'MEU DRIVE/CONSORCIO/11-2025';

// Estrutura simulando arquivos no Google Drive com metadados ricos
interface DriveFileMetadata {
    id: string;
    filename: string;
    path: string;
    hash: string; 
    lastModified: string;
    provider: 'Porto Seguro' | 'Mapfre' | 'Bancorbrás';
    category: 'Mista' | 'Automóvel' | 'Imóvel' | 'Pesados';
    rawContent: any[]; 
}

/**
 * INTELIGÊNCIA DE MERCADO - DADOS ESTATÍSTICOS REAIS (SIMULADOS & EXPANDIDOS)
 * Base de dados robusta para garantir cruzamento de dados eficiente.
 */
const DRIVE_FILE_SYSTEM: DriveFileMetadata[] = [
    {
        id: "file_bi_001",
        filename: "BANCORBRAS_Intelligence_Report_Nov25.pdf",
        path: "MEU DRIVE/CONSORCIO/11-2025",
        hash: "bnc_bi_nov25_v4_full",
        lastModified: "2025-11-03",
        category: "Mista", 
        provider: "Bancorbrás",
        rawContent: [
            // AUTOMÓVEIS
            { 
                name: "Grupo 6105 - Auto Flex", 
                credit: 45000, term: 80, installment: 645.00, fee: 0.15, category: "Automóvel", 
                features: ["Fundo Reserva Devolvido", "Alta Liquidez"],
                stats: { averageBid: 38.5, lastBid: 36.2, maxBid: 45.0, contemplationsPerMonth: 4, assembliesHeld: 12, fundHealth: 'Alta Liquidez', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo 6110 - Premium Car", 
                credit: 80000, term: 80, installment: 1150.00, fee: 0.14, category: "Automóvel", 
                features: ["Taxa Reduzida", "Lance Facilitado"],
                stats: { averageBid: 40.0, lastBid: 38.5, maxBid: 48.0, contemplationsPerMonth: 3, assembliesHeld: 24, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo 6112 - Executive", 
                credit: 95000, term: 80, installment: 1360.00, fee: 0.145, category: "Automóvel", 
                features: ["Parcela Linear", "Seguro Prestamista"],
                stats: { averageBid: 37.0, lastBid: 35.5, maxBid: 44.0, contemplationsPerMonth: 3, assembliesHeld: 8, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo 6200 - SUV Strategy", 
                credit: 120000, term: 80, installment: 1725.00, fee: 0.15, category: "Automóvel", 
                features: ["Parcela Linear", "Fundo Reserva Devolvido"],
                stats: { averageBid: 35.5, lastBid: 33.0, maxBid: 42.0, contemplationsPerMonth: 2, assembliesHeld: 6, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo 6205 - Luxury Wheels", 
                credit: 150000, term: 80, installment: 2150.00, fee: 0.14, category: "Automóvel", 
                features: ["Concierge", "Fundo Reserva Devolvido"],
                stats: { averageBid: 33.0, lastBid: 31.0, maxBid: 40.0, contemplationsPerMonth: 2, assembliesHeld: 10, fundHealth: 'Alta Liquidez', bidTrend: 'Estável' }
            },
            // IMÓVEIS
            { 
                name: "Grupo 8050 - Habitação Prime", 
                credit: 300000, term: 180, installment: 1983.33, fee: 0.19, category: "Imóvel", 
                features: ["Uso FGTS no Lance", "Quit. Financiamento", "Fundo Reserva Devolvido"],
                stats: { averageBid: 48.0, lastBid: 46.5, maxBid: 52.0, contemplationsPerMonth: 3, assembliesHeld: 45, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo 8055 - Opportunity", 
                credit: 350000, term: 200, installment: 2050.00, fee: 0.18, category: "Imóvel", 
                features: ["Taxa Reduzida", "Meia Parcela"],
                stats: { averageBid: 45.0, lastBid: 43.0, maxBid: 50.0, contemplationsPerMonth: 4, assembliesHeld: 20, fundHealth: 'Alta Liquidez', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo 8100 - Investidor High", 
                credit: 500000, term: 200, installment: 2916.00, fee: 0.17, category: "Imóvel", 
                features: ["Taxa Adm Regressiva", "Meia Parcela"],
                stats: { averageBid: 42.0, lastBid: 40.0, maxBid: 48.0, contemplationsPerMonth: 2, assembliesHeld: 12, fundHealth: 'Alta Liquidez', bidTrend: 'Alta' }
            },
            { 
                name: "Grupo 8090 - Corporate", 
                credit: 900000, term: 180, installment: 5900.00, fee: 0.18, category: "Imóvel", 
                features: ["PJ", "Quit. Financiamento", "Fundo Reserva Devolvido"],
                stats: { averageBid: 35.0, lastBid: 32.0, maxBid: 40.0, contemplationsPerMonth: 1, assembliesHeld: 6, fundHealth: 'Crítico', bidTrend: 'Queda' }
            },
        ]
    },
    {
        id: "file_bi_002",
        filename: "PORTO_SEGURO_BI_Analytics_11_25.pdf",
        path: "MEU DRIVE/CONSORCIO/11-2025",
        hash: "porto_bi_nov25_final_v4_full",
        lastModified: "2025-11-05",
        category: "Mista",
        provider: "Porto Seguro",
        rawContent: [
            // AUTO
            { 
                name: "Grupo I531 - Aceleração", 
                credit: 55000, term: 80, installment: 794.06, fee: 0.155, category: "Automóvel", 
                features: ["Adesão Isenta", "Lance Embutido 20%"],
                stats: { averageBid: 32.5, lastBid: 30.0, maxBid: 38.0, contemplationsPerMonth: 8, assembliesHeld: 3, fundHealth: 'Alta Liquidez', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo I540 - Compacto", 
                credit: 70000, term: 80, installment: 1010.00, fee: 0.155, category: "Automóvel", 
                features: ["Lance Embutido 20%", "Parcela Reduzida"],
                stats: { averageBid: 34.0, lastBid: 32.0, maxBid: 40.0, contemplationsPerMonth: 6, assembliesHeld: 12, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo I555 - Sedan Strategy", 
                credit: 110000, term: 80, installment: 1581.25, fee: 0.15, category: "Automóvel", 
                features: ["Parcela Reduzida", "Seguro Quebra"],
                stats: { averageBid: 44.0, lastBid: 45.5, maxBid: 55.0, contemplationsPerMonth: 3, assembliesHeld: 36, fundHealth: 'Estável', bidTrend: 'Alta' }
            },
            { 
                name: "Grupo Auto Premium", 
                credit: 180000, term: 80, installment: 2600.00, fee: 0.145, category: "Automóvel", 
                features: ["Blindagem Inclusa", "Concierge"],
                stats: { averageBid: 38.0, lastBid: 36.0, maxBid: 45.0, contemplationsPerMonth: 2, assembliesHeld: 18, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo Heavy Duty", 
                credit: 250000, term: 100, installment: 3000.00, fee: 0.20, category: "Automóvel", 
                features: ["Caminhões", "Utilitários"],
                stats: { averageBid: 28.0, lastBid: 26.0, maxBid: 35.0, contemplationsPerMonth: 2, assembliesHeld: 5, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            // IMÓVEIS
            { 
                name: "Grupo R105 - Opportunity (FGTS)", 
                credit: 250000, term: 200, installment: 1512.50, fee: 0.21, category: "Imóvel", 
                features: ["100% FGTS no Lance", "Quit. Financiamento", "Lance Embutido 30%"],
                stats: { averageBid: 52.0, lastBid: 51.0, maxBid: 58.0, contemplationsPerMonth: 5, assembliesHeld: 60, fundHealth: 'Alta Liquidez', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo R180 - Smart Living", 
                credit: 320000, term: 200, installment: 1950.00, fee: 0.20, category: "Imóvel", 
                features: ["Lance Diluído", "Uso de FGTS"],
                stats: { averageBid: 48.0, lastBid: 46.0, maxBid: 55.0, contemplationsPerMonth: 4, assembliesHeld: 30, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo R200 - Equity Build", 
                credit: 400000, term: 200, installment: 2350.00, fee: 0.19, category: "Imóvel", 
                features: ["Lance Diluído", "Pagar Meia Parcela até Contemplação"],
                stats: { averageBid: 45.0, lastBid: 42.0, maxBid: 50.0, contemplationsPerMonth: 3, assembliesHeld: 24, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo R350 - Patrimônio", 
                credit: 600000, term: 200, installment: 3550.00, fee: 0.185, category: "Imóvel", 
                features: ["Taxa Reduzida", "Interveniente Quitante"],
                stats: { averageBid: 41.5, lastBid: 39.0, maxBid: 46.0, contemplationsPerMonth: 2, assembliesHeld: 10, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo R500 - High End", 
                credit: 800000, term: 200, installment: 4700.00, fee: 0.175, category: "Imóvel", 
                features: ["Exclusivo", "Lance Embutido"],
                stats: { averageBid: 38.0, lastBid: 36.0, maxBid: 45.0, contemplationsPerMonth: 1, assembliesHeld: 8, fundHealth: 'Alta Liquidez', bidTrend: 'Estável' }
            },
            // PESADOS
            { 
                name: "Grupo P-700 - Agro Force", 
                credit: 400000, term: 120, installment: 4100.00, fee: 0.14, category: "Pesados", 
                features: ["Safra (Pagamento Anual)", "Maquinário Agrícola"],
                stats: { averageBid: 30.0, lastBid: 28.0, maxBid: 35.0, contemplationsPerMonth: 2, assembliesHeld: 12, fundHealth: 'Alta Liquidez', bidTrend: 'Estável' }
            },
             { 
                name: "Grupo P-850 - Fleet Master", 
                credit: 650000, term: 100, installment: 7200.00, fee: 0.13, category: "Pesados", 
                features: ["Renovação de Frota", "Carência 2 meses"],
                stats: { averageBid: 25.0, lastBid: 22.0, maxBid: 30.0, contemplationsPerMonth: 3, assembliesHeld: 18, fundHealth: 'Estável', bidTrend: 'Baixa' }
            }
        ]
    },
    {
        id: "file_bi_003",
        filename: "MAPFRE_Stats_Extract_Nov25.pdf", 
        path: "MEU DRIVE/CONSORCIO/11-2025",
        hash: "mapfre_bi_nov25_rev4_full",
        lastModified: "2025-11-02",
        category: "Mista",
        provider: "Mapfre",
        rawContent: [
            { 
                name: "Grupo 2050 - Starter", 
                credit: 40000, term: 84, installment: 560.00, fee: 0.175, category: "Automóvel", 
                features: ["Entrada Reduzida", "Lance Livre"],
                stats: { averageBid: 32.0, lastBid: 30.0, maxBid: 38.0, contemplationsPerMonth: 5, assembliesHeld: 48, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo 2100 - Gold", 
                credit: 70000, term: 84, installment: 975.00, fee: 0.17, category: "Automóvel", 
                features: ["Sorteio Garantido", "Seguro Incluso"],
                stats: { averageBid: 35.0, lastBid: 35.0, maxBid: 40.0, contemplationsPerMonth: 1, assembliesHeld: 40, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo 2150 - Family", 
                credit: 100000, term: 84, installment: 1390.00, fee: 0.165, category: "Automóvel", 
                features: ["Lance Embutido 20%", "Férias no Pagamento"],
                stats: { averageBid: 36.0, lastBid: 34.0, maxBid: 42.0, contemplationsPerMonth: 3, assembliesHeld: 24, fundHealth: 'Estável', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo 2200 - Platinum", 
                credit: 150000, term: 84, installment: 2100.00, fee: 0.16, category: "Automóvel", 
                features: ["Lance Fixo 25%", "Bônus Adimplência"],
                stats: { averageBid: 25.0, lastBid: 25.0, maxBid: 25.0, contemplationsPerMonth: 4, assembliesHeld: 12, fundHealth: 'Estável', bidTrend: 'Baixa' }
            },
            { 
                name: "Grupo MX-500 - Smart Home", 
                credit: 350000, term: 192, installment: 2150.00, fee: 0.18, category: "Imóvel", 
                features: ["Troca de Chaves", "Lance Embutido", "Uso de FGTS"],
                stats: { averageBid: 40.0, lastBid: 38.0, maxBid: 45.0, contemplationsPerMonth: 3, assembliesHeld: 20, fundHealth: 'Alta Liquidez', bidTrend: 'Queda' }
            },
            { 
                name: "Grupo MX-550 - Construtor", 
                credit: 450000, term: 192, installment: 2780.00, fee: 0.18, category: "Imóvel", 
                features: ["Construção", "Terreno + Obra"],
                stats: { averageBid: 42.0, lastBid: 40.0, maxBid: 48.0, contemplationsPerMonth: 2, assembliesHeld: 18, fundHealth: 'Estável', bidTrend: 'Estável' }
            },
            { 
                name: "Grupo MX-600 - Investor", 
                credit: 600000, term: 192, installment: 3687.50, fee: 0.18, category: "Imóvel", 
                features: ["Troca de Chaves", "Lance Embutido", "Uso de FGTS"],
                stats: { averageBid: 39.0, lastBid: 37.5, maxBid: 42.0, contemplationsPerMonth: 2, assembliesHeld: 15, fundHealth: 'Alta Liquidez', bidTrend: 'Queda' }
            },
        ]
    }
];

const decoratePlan = (raw: any, provider: string): ConsorcioPlan => {
    // Default Stats if not present in raw data (fallback)
    const stats: GroupStatistics = raw.stats || {
        averageBid: 40,
        lastBid: 40,
        maxBid: 50,
        contemplationsPerMonth: 1,
        assembliesHeld: 12,
        fundHealth: 'Estável',
        bidTrend: 'Estável'
    };

    return {
        provider: provider as any,
        planName: raw.name,
        category: raw.category,
        assetValue: raw.credit,
        termInMonths: raw.term,
        monthlyInstallment: raw.installment,
        adminFee: raw.fee,
        recommendationTag: stats.bidTrend === 'Queda' ? "📉 Oportunidade: Lances em Queda" : stats.fundHealth === 'Alta Liquidez' ? "🔥 Grupo Acelerado" : "Condição de Mercado",
        keyStat: `Média Lance: ${stats.averageBid}%`,
        features: raw.features || [],
        stats: stats
    };
};

export const processUploadedFile = async (file: File, onLog: (log: EtlLog) => void): Promise<void> => {
    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Processando arquivo de inteligência: ${file.name}`, source: 'Market Intelligence' });
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                let loadedPlans: any[] = [];
                
                if (file.name.endsWith('.json')) {
                    loadedPlans = JSON.parse(text);
                } else {
                    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'WARN', message: `CSV Parser: Tentando extrair colunas estatísticas (Média, Último, Saldo)...`, source: 'Parser' });
                    // Mock CSV logic would go here
                }

                if (Array.isArray(loadedPlans) && loadedPlans.length > 0) {
                    const decorated = loadedPlans.map(p => decoratePlan(p, "Arquivo Externo"));
                    
                    // Atualizar Cache
                    const cachedDataString = localStorage.getItem(INGESTED_DATA_KEY);
                    let currentCache = cachedDataString ? JSON.parse(cachedDataString) : { plans: [], processedFiles: [] };
                    
                    currentCache.plans = [...decorated, ...currentCache.plans];
                    
                    // Deduplicate based on plan name and provider
                    const uniquePlans = Array.from(new Map(currentCache.plans.map((item: ConsorcioPlan) => [item.planName + item.provider, item])).values());
                    currentCache.plans = uniquePlans;

                    localStorage.setItem(INGESTED_DATA_KEY, JSON.stringify(currentCache));

                    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: `${decorated.length} ativos com dados estatísticos importados.`, source: 'Database' });
                    resolve();
                } else {
                    throw new Error("Formato inválido ou array vazio");
                }
            } catch (err) {
                onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'ERROR', message: `Falha ao ler arquivo: ${err}`, source: 'Parser' });
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

/**
 * Executa o Pipeline de Dados (ETL) para sincronizar o "Google Drive" com o banco local.
 * Agora otimizado para processamento paralelo e deduplicação inteligente.
 */
export const runEtlPipeline = async (onLog?: (log: EtlLog) => void): Promise<void> => {
    const safeLog = (msg: string, level: EtlLog['level'] = 'INFO', source: EtlLog['source'] = 'Drive') => {
        if (onLog) onLog({ id: Date.now().toString() + Math.random(), timestamp: new Date().toLocaleTimeString(), level, message: msg, source });
    };

    safeLog('Iniciando Engine de Inteligência de Mercado (Otimizado)...', 'INFO', 'Market Intelligence');
    
    // Simula latência de conexão
    await new Promise(r => setTimeout(r, 300));

    safeLog(`Mapeando Data Lake: "${TARGET_FOLDER_PATH}"`, 'INFO', 'Drive');
    
    const targetFiles = DRIVE_FILE_SYSTEM.filter(f => f.path === TARGET_FOLDER_PATH);
    
    if (targetFiles.length === 0) {
        safeLog('CRÍTICO: Nenhum relatório de BI encontrado em 11/2025.', 'ERROR', 'Drive');
        return;
    }

    safeLog(`${targetFiles.length} arquivos de origem identificados.`, 'INFO', 'Drive');

    const cachedDataString = localStorage.getItem(INGESTED_DATA_KEY);
    let cachedData: { plans: ConsorcioPlan[], processedFiles: string[] } = { plans: [], processedFiles: [] };
    
    if (cachedDataString) {
        try {
            cachedData = JSON.parse(cachedDataString);
        } catch (e) {
            cachedData = { plans: [], processedFiles: [] };
        }
    }

    // Processamento Paralelo para Eficiência
    const filesToProcess = targetFiles.filter(f => !cachedData.processedFiles.includes(f.hash));
    const cachedFilesCount = targetFiles.length - filesToProcess.length;

    if (cachedFilesCount > 0) {
        safeLog(`[CACHE HIT] ${cachedFilesCount} arquivos já processados e recuperados da memória.`, 'SUCCESS', 'Database');
    }

    // FORCE REFRESH for demo purposes if cache is small
    const forceRefresh = cachedData.plans.length < 10; // Aumentei o threshold para garantir mais dados
    
    if (filesToProcess.length > 0 || forceRefresh) {
        safeLog(`Processando ${filesToProcess.length > 0 ? filesToProcess.length : 'ALL'} arquivos em paralelo (ETL Refresh)...`, 'INFO', 'Parser');
        
        // Simula delay de processamento paralelo (mais rápido que sequencial)
        await new Promise(r => setTimeout(r, 500));

        // If forcing refresh, use all files, otherwise just new ones
        const filesToUse = forceRefresh ? targetFiles : filesToProcess;

        const results = await Promise.all(filesToUse.map(async (file) => {
             const plans = file.rawContent.map(raw => decoratePlan(raw, file.provider));
             return { hash: file.hash, plans, filename: file.filename };
        }));

        results.forEach(res => {
            cachedData.plans = [...cachedData.plans, ...res.plans];
            if (!cachedData.processedFiles.includes(res.hash)) {
                cachedData.processedFiles.push(res.hash);
            }
            safeLog(`Ingestão Concluída: ${res.filename} (+${res.plans.length} registros)`, 'SUCCESS', 'Parser');
        });
    }

    // Deduplicação e Armazenamento
    const uniquePlans = Array.from(new Map(cachedData.plans.map(item => [item.planName + item.provider, item])).values());
    
    const newCacheState = {
        plans: uniquePlans,
        processedFiles: cachedData.processedFiles
    };

    localStorage.setItem(INGESTED_DATA_KEY, JSON.stringify(newCacheState));
    
    safeLog(`Pipeline Finalizado. Base de Ativos: ${uniquePlans.length} monitorados.`, 'SUCCESS', 'Market Intelligence');
};

export const findAvailablePlans = async (
  category: 'Automóvel' | 'Imóvel' | 'Pesados',
  targetAssetValue: number,
  personaType: 'PF' | 'PJ' = 'PF'
): Promise<ConsorcioPlan[]> => {
  
  // Garante que os dados existam chamando a Pipeline se o cache estiver vazio ou antigo
  const cachedDataString = localStorage.getItem(INGESTED_DATA_KEY);
  let needsEtl = !cachedDataString;
  
  if (cachedDataString) {
      const parsed = JSON.parse(cachedDataString);
      if (parsed.plans.length < 10) needsEtl = true;
  }

  if (needsEtl) {
      console.log("Cache insuficiente. Acionando Auto-ETL Expandido...");
      await runEtlPipeline(); 
  }

  // Leitura atualizada do banco
  const finalDataString = localStorage.getItem(INGESTED_DATA_KEY);
  let allPlans: ConsorcioPlan[] = [];
  
  if (finalDataString) {
      const parsed = JSON.parse(finalDataString);
      allPlans = parsed.plans || [];
  }

  // --- LÓGICA DE BUSCA ELÁSTICA REFINADA --- //
  
  // Nível 1: Busca Estrita (+/- 20%)
  let minVal = targetAssetValue * 0.8;
  let maxVal = targetAssetValue * 1.2;

  let candidates = allPlans.filter(p => 
      p.category === category && 
      p.assetValue >= minVal && 
      p.assetValue <= maxVal
  );

  // Nível 2: Busca Ampliada (Se encontrou poucos resultados - Aumentei o threshold para 5)
  if (candidates.length < 5) {
      console.log("Poucos resultados exatos. Expandindo range de busca (Busca Elástica)...");
      minVal = targetAssetValue * 0.5; // -50% (Permite "juntar cartas" ou upgrade)
      maxVal = targetAssetValue * 1.8; // +80% (Up-sell opportunities)
      
      candidates = allPlans.filter(p => 
          p.category === category && 
          p.assetValue >= minVal && 
          p.assetValue <= maxVal
      );
  }

  // Smart Sort: 
  // 1. Proximidade do valor alvo
  // 2. Saúde do fundo
  candidates.sort((a, b) => {
      // Score calculation (lower is better rank)
      const distA = Math.abs(a.assetValue - targetAssetValue);
      const distB = Math.abs(b.assetValue - targetAssetValue);
      
      let scoreA = distA;
      let scoreB = distB;

      // Penalty for Critical Fund Health
      if (a.stats?.fundHealth === 'Crítico') scoreA *= 2;
      if (b.stats?.fundHealth === 'Crítico') scoreB *= 2;

      // Bonus for Downward Bid Trend (Easier to win)
      if (a.stats?.bidTrend === 'Queda') scoreA *= 0.7;
      if (b.stats?.bidTrend === 'Queda') scoreB *= 0.7;
      
      // Bonus for "Alta Liquidez"
      if (a.stats?.fundHealth === 'Alta Liquidez') scoreA *= 0.8;
      if (b.stats?.fundHealth === 'Alta Liquidez') scoreB *= 0.8;

      return scoreA - scoreB;
  });

  // Retorna até 20 candidatos para a IA e o Frontend filtrarem, garantindo volume na tabela
  return candidates.slice(0, 20);
};
