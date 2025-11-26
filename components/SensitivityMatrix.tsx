
import React, { useMemo } from 'react';
import type { RecommendedPlan } from '../services/geminiService';

interface SensitivityMatrixProps {
  plan: RecommendedPlan;
  currentBid: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);

export const SensitivityMatrix: React.FC<SensitivityMatrixProps> = ({ plan, currentBid }) => {
  const scenarios = useMemo(() => {
    const credit = plan.assetValue;
    const avgBidPercent = plan.stats?.averageBid || 30;
    
    // Base scenarios relative to group average
    const definitions = [
      { label: 'Conservador', factor: 0.8, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', activeClass: 'ring-2 ring-yellow-400 bg-yellow-100' },
      { label: 'Estatístico (Média)', factor: 1.0, color: 'text-blue-600 bg-blue-50 border-blue-200', activeClass: 'ring-2 ring-blue-400 bg-blue-100' },
      { label: 'Agressivo (Estratégico)', factor: 1.25, color: 'text-green-600 bg-green-50 border-green-200', activeClass: 'ring-2 ring-green-400 bg-green-100' },
    ];

    // Identify which scenario matches the current user bid
    const userBidPercent = (currentBid / credit) * 100;

    return definitions.map(def => {
      const bidPercent = avgBidPercent * def.factor;
      const bidValue = credit * (bidPercent / 100);
      
      // Calculate impact
      const installmentsEliminated = Math.floor(bidValue / plan.monthlyInstallment);
      const newTerm = Math.max(1, plan.termInMonths - installmentsEliminated);
      const timeSaved = plan.termInMonths - newTerm;
      
      // Probability logic (simplified heuristic)
      let probability = 'Baixa';
      if (def.factor >= 0.95) probability = 'Média';
      if (def.factor >= 1.15) probability = 'Alta';
      if (def.factor >= 1.3) probability = 'Muito Alta';

      // Check if this scenario is the "closest" to the current user bid
      // Tolerance of +/- 10% relative difference
      const isMatch = Math.abs(userBidPercent - bidPercent) < 5 || (userBidPercent > bidPercent && def.label.includes('Agressivo') && userBidPercent < bidPercent + 15);

      return {
        ...def,
        bidValue,
        bidPercent,
        newTerm,
        timeSaved,
        probability,
        isMatch
      };
    });
  }, [plan, currentBid]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Matriz de Sensibilidade de Lance
        </h3>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Análise de Cenários</span>
      </div>
      
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-bold">Cenário</th>
              <th className="px-6 py-3 font-bold">Lance Necessário</th>
              <th className="px-6 py-3 font-bold">Probabilidade</th>
              <th className="px-6 py-3 font-bold text-right">Redução de Prazo</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row, idx) => (
              <tr key={idx} className={`border-b border-slate-50 transition-colors ${row.isMatch ? row.activeClass : 'hover:bg-slate-50/50'}`}>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${row.color}`}>
                    {row.label}
                  </span>
                  {row.isMatch && <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase">(Seu Cenário)</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{formatCurrency(row.bidValue)}</div>
                  <div className="text-xs text-slate-500">aprox. {row.bidPercent.toFixed(1)}%</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${row.probability === 'Alta' || row.probability === 'Muito Alta' ? 'bg-green-500' : row.probability === 'Média' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                     <span className="font-medium text-slate-700">{row.probability}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-indigo-600">-{row.timeSaved} meses</div>
                  <div className="text-xs text-slate-400">Novo prazo: {row.newTerm}x</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 text-xs text-center text-slate-500 italic border-t border-slate-100">
        * Dados baseados na média histórica e saúde financeira do grupo nos últimos 12 meses.
      </div>
    </div>
  );
};
