
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ScenarioSimulatorProps {
  initialCategory: 'Automóvel' | 'Imóvel' | 'Serviços';
  initialValue: number;
  initialInstallment: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ initialCategory, initialValue, initialInstallment }) => {
  const [assetValue, setAssetValue] = useState(initialValue);
  const [monthlyInstallment, setMonthlyInstallment] = useState(initialInstallment);

  const config = useMemo(() => {
    switch (initialCategory) {
      case 'Imóvel': return { minVal: 100000, maxVal: 2000000, minInst: 500, maxInst: 10000, avgFee: 0.19 };
      case 'Automóvel': return { minVal: 30000, maxVal: 300000, minInst: 300, maxInst: 5000, avgFee: 0.16 };
      default: return { minVal: 10000, maxVal: 100000, minInst: 150, maxInst: 2000, avgFee: 0.22 };
    }
  }, [initialCategory]);

  const simulation = useMemo(() => {
    const volumeDiscount = assetValue > config.maxVal * 0.5 ? 0.02 : 0;
    const effectiveFee = Math.max(0.10, config.avgFee - volumeDiscount);
    const totalCost = assetValue * (1 + effectiveFee);
    const safeInstallment = monthlyInstallment || 1;
    const estimatedTerm = Math.ceil(totalCost / safeInstallment);

    return { totalCost, estimatedTerm, effectiveFee };
  }, [assetValue, monthlyInstallment, config]);

  const chartData = [
    { name: 'Crédito', value: assetValue, color: '#06b6d4' },
    { name: 'Total', value: simulation.totalCost, color: '#10b981' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
         <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
         </div>
         <div>
             <h3 className="font-bold text-gray-900 dark:text-white">Simulador de Cenário</h3>
             <p className="text-xs text-gray-500 dark:text-gray-400">Ajuste os valores para ver o impacto no prazo.</p>
         </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Asset Slider */}
          <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">Valor do Bem</label>
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(assetValue)}</span>
            </div>
            <input
              type="range"
              min={config.minVal} max={config.maxVal} step={config.minVal < 100000 ? 1000 : 5000}
              value={assetValue}
              onChange={(e) => setAssetValue(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-cyan-600 hover:accent-cyan-500 touch-none"
            />
          </div>

          {/* Installment Slider */}
          <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">Sua Parcela Mensal</label>
             <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{formatCurrency(monthlyInstallment)}</span>
            </div>
            <input
              type="range"
              min={config.minInst} max={config.maxInst} step={50}
              value={monthlyInstallment}
              onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-purple-600 hover:accent-purple-500 touch-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-between">
           <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Prazo Estimado</p>
                    <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{simulation.estimatedTerm} <span className="text-sm font-medium text-gray-400">meses</span></p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                     <p className="text-xs text-gray-500 uppercase font-semibold">Taxa Adm.</p>
                    <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{(simulation.effectiveFee * 100).toFixed(1)}%</p>
                </div>
           </div>

           <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }} barSize={20}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff'}} formatter={(val:number) => formatCurrency(val)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
