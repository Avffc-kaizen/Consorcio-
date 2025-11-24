
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RecommendedPlan } from '../services/geminiService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const EquityEvolutionChart: React.FC<{ plan: RecommendedPlan }> = ({ plan }) => {
    const data = useMemo(() => {
        const years = Math.ceil(plan.termInMonths / 12);
        const result = [];
        const assetStart = plan.assetValue;
        const totalCost = plan.assetValue * (1 + (plan.adminFee > 1 ? plan.adminFee / 100 : plan.adminFee));
        const annualCost = totalCost / years; 

        for (let i = 0; i <= years + 2; i++) {
             // Asset appreciates 6% a year
             const assetVal = assetStart * Math.pow(1.06, i);
             // Cost accumulates linearly until term ends
             let costPaid = annualCost * i;
             if (costPaid > totalCost) costPaid = totalCost;
             
             result.push({
                 name: `Ano ${i}`,
                 'Valor do Ativo': Math.round(assetVal),
                 'Total Pago': Math.round(costPaid),
             });
        }
        return result;
    }, [plan]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 h-full">
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Evolução Patrimonial (ROI)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Projeção de valorização do ativo (6% a.a.) vs. Custo acumulado.</p>
                </div>
                 <div className="mt-2 md:mt-0 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                    Ponto de Virada (Break-even): ~Ano 3
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAtivo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPago" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip 
                             formatter={(value: number) => formatCurrency(value)}
                             contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                        <Area type="monotone" dataKey="Valor do Ativo" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAtivo)" strokeWidth={3} />
                        <Area type="monotone" dataKey="Total Pago" stroke="#6b7280" fillOpacity={1} fill="url(#colorPago)" strokeWidth={2} strokeDasharray="5 5"/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EquityEvolutionChart;
