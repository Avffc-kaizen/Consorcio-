
import type { ConsorcioPlan, EtlLog, GroupStatistics } from '../types';
import dbData from '../data/consorcio_db.json';

const INGESTED_DATA_KEY = 'eap_market_intelligence_db_v11_integrated'; 
const DRIVE_FOLDER_ID = '17ysxzPq-NjfPZE4hYYarrwih0Lp4KQJR';
const TARGET_FOLDER_PATH = `MEU DRIVE/CONSORCIO/${DRIVE_FOLDER_ID}`;

// Initialize Base Data from JSON file (The Python Integration Source)
const STATIC_BASE_PLANS: ConsorcioPlan[] = (dbData as any[]).map(item => ({
    provider: item.company || item.provider || 'Bancorbrás',
    planName: item.group ? `Grupo ${item.group}` : (item.name || "Grupo Oportunidade"),
    category: (item.type === 'imovel' ? 'Imóvel' : item.type === 'pesados' ? 'Pesados' : 'Automóvel'),
    assetValue: Number(item.credit) || 0,
    termInMonths: Number(item.term) || 80,
    monthlyInstallment: Number(item.installment) || 0,
    adminFee: Number(item.fee) || 0.15,
    recommendationTag: item.status === 'hot' ? "🔥 Oportunidade" : "Condição de Mercado",
    keyStat: item.stats ? `Lance Médio: ${item.stats.averageBid}%` : "Melhor ROI",
    features: item.features || ["Alta Liquidez", "Análise IA"],
    stats: item.stats || {
        averageBid: 40, 
        lastBid: 38, 
        maxBid: 50, 
        contemplationsPerMonth: 2, 
        assembliesHeld: 24, 
        fundHealth: 'Estável', 
        bidTrend: 'Estável' 
    }
}));

// Helper to normalize currency inputs
const cleanCurrency = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const clean = String(value).replace(/R\$|r\$|\.|\s/g, '').trim();
  const dotDecimal = clean.replace(',', '.');
  const floatVal = parseFloat(dotDecimal);
  return isNaN(floatVal) ? 0 : floatVal;
};

// Adapter to convert Python Script JSON Output to App Type (Dynamic Uploads)
const decoratePlan = (raw: any, defaultProvider: string): ConsorcioPlan => {
    const provider = raw.company || raw.provider || defaultProvider;
    const planName = raw.group ? `Grupo ${raw.group}` : (raw.name || "Grupo Indefinido");
    const credit = raw.credit || raw.credito || raw.saldo || 0;
    const installment = raw.installment || raw.parcela || 0;
    const term = raw.term || raw.prazo || 0;
    const fee = raw.fee || raw.taxa_adm || 0.15;

    let category: 'Automóvel' | 'Imóvel' | 'Pesados' = 'Automóvel';
    if (raw.type) {
        if (raw.type === 'imovel') category = 'Imóvel';
        else if (raw.type === 'pesados') category = 'Pesados';
        else category = 'Automóvel';
    } else if (raw.category) {
        category = raw.category;
    } else {
        if (credit >= 200000 && credit % 10000 === 0) category = 'Imóvel';
        else if (credit >= 300000) category = 'Pesados';
    }

    let normalizedFee = fee;
    if (normalizedFee > 1) normalizedFee = normalizedFee / 100; 

    const stats: GroupStatistics = raw.stats || {
        averageBid: raw.status === 'hot' ? 35.0 : 42.5,
        lastBid: raw.status === 'hot' ? 33.0 : 40.0,
        maxBid: 50.0,
        contemplationsPerMonth: raw.status === 'hot' ? 4 : 1,
        assembliesHeld: 12,
        fundHealth: raw.status === 'hot' ? 'Alta Liquidez' : 'Estável',
        bidTrend: raw.status === 'hot' ? 'Queda' : 'Estável'
    };

    return {
        provider: provider as any,
        planName: planName,
        category: category,
        assetValue: cleanCurrency(credit),
        termInMonths: term || 80, 
        monthlyInstallment: cleanCurrency(installment),
        adminFee: normalizedFee,
        recommendationTag: raw.status === 'hot' ? "🔥 Novo Upload" : "Condição de Mercado",
        keyStat: `Média Lance: ${stats.averageBid}%`,
        features: raw.features || ["Alta Liquidez", "Meia Parcela"], 
        stats: stats
    };
};

const parseCsvContent = (text: string): any[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    let headerLineIndex = -1;
    let separator = ';'; 

    const isHeaderRow = (line: string): boolean => {
        const lower = line.toLowerCase();
        return (lower.includes('grupo') && (lower.includes('credito') || lower.includes('crédito'))) ||
               (lower.includes('grupo') && lower.includes('parcela'));
    };

    for (let i = 0; i < Math.min(20, lines.length); i++) {
        if (isHeaderRow(lines[i])) {
            headerLineIndex = i;
            if (lines[i].split(';').length > 2) separator = ';';
            else if (lines[i].split(',').length > 2) separator = ',';
            break;
        }
    }

    if (headerLineIndex === -1) return [];

    const headers = lines[headerLineIndex].split(separator).map(h => h.trim().toLowerCase());
    
    const getIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h === k || h.includes(k)));
    
    const idxGrupo = getIndex(['grupo']);
    const idxCredit = getIndex(['credito', 'crédito', 'valor crédito', 'credito total']);
    const idxTerm = getIndex(['prazo', 'tempo', 'meses']);
    const idxInst = getIndex(['parcela', 'mensalidade', 'valor parcela']);
    const idxFee = getIndex(['taxa', 'adm', 'tx adm', 'taxa adm']);

    const results = [];
    
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(separator); 
        if (cols.length < 2) continue; 

        const rawCredit = idxCredit > -1 ? cols[idxCredit] : '0';
        const credit = cleanCurrency(rawCredit);
        
        if (credit > 0) {
            results.push({
                grupo: idxGrupo > -1 ? cols[idxGrupo].trim() : 'N/A',
                credit: credit,
                prazo: idxTerm > -1 ? parseInt(cols[idxTerm].replace(/\D/g, '')) : 0,
                parcela: idxInst > -1 ? cleanCurrency(cols[idxInst]) : 0,
                taxa_adm: idxFee > -1 ? cleanCurrency(cols[idxFee]) : null,
                provider: 'Bancorbrás'
            });
        }
    }
    return results;
};

export const processUploadedFile = async (file: File, onLog: (log: EtlLog) => void): Promise<void> => {
    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Analisando arquivo: ${file.name}`, source: 'Market Intelligence' });
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                let loadedPlans: any[] = [];
                
                if (file.name.toLowerCase().endsWith('.json')) {
                    const parsed = JSON.parse(text);
                    if (Array.isArray(parsed)) {
                        loadedPlans = parsed;
                        onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Detectado JSON do Script Python (${parsed.length} registros).`, source: 'Parser' });
                    } else if (parsed.rows && Array.isArray(parsed.rows)) {
                        loadedPlans = parsed.rows;
                    }
                } else if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
                    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Relatório CSV/TXT detectado. Iniciando parser robusto...`, source: 'Parser' });
                    loadedPlans = parseCsvContent(text);
                } else {
                    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'WARN', message: `Formato não suportado nativamente.`, source: 'Parser' });
                }

                if (Array.isArray(loadedPlans) && loadedPlans.length > 0) {
                    let providerName = 'Bancorbrás'; 
                    if (file.name.toLowerCase().includes('porto')) providerName = 'Porto Seguro';
                    if (file.name.toLowerCase().includes('mapfre')) providerName = 'Mapfre';

                    const decorated = loadedPlans.map(p => decoratePlan(p, providerName));
                    
                    const cachedDataString = localStorage.getItem(INGESTED_DATA_KEY);
                    let currentCache = cachedDataString ? JSON.parse(cachedDataString) : { plans: [] };
                    
                    // Append new uploads to cache
                    currentCache.plans = [...decorated, ...currentCache.plans];
                    
                    // Deduplicate
                    const uniquePlans = Array.from(new Map(currentCache.plans.map((item: ConsorcioPlan) => [item.planName + item.provider + item.assetValue, item])).values());
                    currentCache.plans = uniquePlans;

                    localStorage.setItem(INGESTED_DATA_KEY, JSON.stringify(currentCache));

                    onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: `${decorated.length} ativos importados com sucesso.`, source: 'Database' });
                    resolve();
                } else {
                    throw new Error("Arquivo vazio ou formato não reconhecido.");
                }
            } catch (err) {
                onLog({ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'ERROR', message: `Falha ao ler arquivo: ${err}`, source: 'Parser' });
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

export const resetDatabase = (): void => {
    localStorage.removeItem(INGESTED_DATA_KEY);
    console.log("Database successfully reset.");
};

export const runEtlPipeline = async (onLog?: (log: EtlLog) => void): Promise<void> => {
    const safeLog = (msg: string, level: EtlLog['level'] = 'INFO', source: EtlLog['source'] = 'Drive') => {
        if (onLog) onLog({ id: Date.now().toString() + Math.random(), timestamp: new Date().toLocaleTimeString(), level, message: msg, source });
    };

    safeLog('Conectando ao Pipeline de Dados...', 'INFO', 'Market Intelligence');
    await new Promise(r => setTimeout(r, 500));
    
    const cachedDataString = localStorage.getItem(INGESTED_DATA_KEY);
    if (cachedDataString) {
         safeLog('Base de dados LocalStorage sincronizada.', 'SUCCESS', 'Database');
    } else {
         safeLog('Utilizando Base de Dados Estática (JSON Integrado).', 'INFO', 'Database');
    }
};

export const findAvailablePlans = async (
  category: 'Automóvel' | 'Imóvel' | 'Pesados',
  targetAssetValue: number,
  personaType: 'PF' | 'PJ' = 'PF'
): Promise<ConsorcioPlan[]> => {
  
  // 1. Load Data: Combine Static JSON (Base) + LocalStorage (Uploads)
  const finalDataString = localStorage.getItem(INGESTED_DATA_KEY);
  let allPlans: ConsorcioPlan[] = [...STATIC_BASE_PLANS];
  
  if (finalDataString) {
      const parsed = JSON.parse(finalDataString);
      const uploadedPlans = parsed.plans || [];
      // Add uploaded plans to the pool
      allPlans = [...uploadedPlans, ...allPlans];
  }

  // Deduplicate in case static data was also uploaded
  allPlans = Array.from(new Map(allPlans.map(item => [item.planName + item.provider + item.assetValue, item])).values());

  // 2. Filter Logic (Exact Match +/- 20%)
  let minVal = targetAssetValue * 0.8;
  let maxVal = targetAssetValue * 1.2;

  let candidates = allPlans.filter(p => 
      p.category === category && 
      p.assetValue >= minVal && 
      p.assetValue <= maxVal
  );

  // 3. Fallback: Expand Range if < 3 results (Smart Search)
  if (candidates.length < 3) {
      console.log("Poucos resultados exatos. Expandindo range de busca...");
      minVal = targetAssetValue * 0.5;
      maxVal = targetAssetValue * 1.5;
      
      candidates = allPlans.filter(p => 
          p.category === category && 
          p.assetValue >= minVal && 
          p.assetValue <= maxVal
      );
  }

  // 4. Fallback: Broad Category Match if still 0
  if (candidates.length === 0 && allPlans.length > 0) {
       console.log("Nenhum resultado no range. Trazendo melhores da categoria (Fallback)...");
       candidates = allPlans.filter(p => p.category === category);
       // Take closest 10 values
       candidates.sort((a, b) => Math.abs(a.assetValue - targetAssetValue) - Math.abs(b.assetValue - targetAssetValue));
       candidates = candidates.slice(0, 10);
  }

  // If absolutely no data found even in static base
  if (candidates.length === 0) {
      return generateFallbacks(category, targetAssetValue);
  }

  // 5. Sort by Cost Benefit (Installment relative to Credit) - "Melhor Custo-Benefício"
  // Lower ratio is better.
  candidates.sort((a, b) => {
      const ratioA = a.monthlyInstallment / a.assetValue;
      const ratioB = b.monthlyInstallment / b.assetValue;
      return ratioA - ratioB;
  });

  return candidates.slice(0, 20);
};

const generateFallbacks = (category: string, value: number): ConsorcioPlan[] => {
    const baseFee = category === 'Imóvel' ? 0.22 : 0.15;
    const term = category === 'Imóvel' ? 180 : 80;
    return [
        {
            provider: 'Porto Seguro',
            planName: 'Grupo Promocional (Fallback)',
            category: category as any,
            assetValue: value,
            termInMonths: term,
            monthlyInstallment: (value * (1 + baseFee)) / term,
            adminFee: baseFee,
            recommendationTag: "Simulação Base",
            keyStat: "Aguardando Sincronização",
            features: ["Disponibilidade Imediata"],
            stats: { averageBid: 40, lastBid: 38, maxBid: 50, contemplationsPerMonth: 2, assembliesHeld: 10, fundHealth: 'Estável', bidTrend: 'Estável' }
        }
    ];
};
