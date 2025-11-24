
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { RecommendedPlan } from '../services/geminiService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

interface BudgetAnalysisChartProps {
    plan: RecommendedPlan;
    monthlyIncome: number;
}

export const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ plan, monthlyIncome }) => {
    const data = useMemo(() => {
        const installment = plan.monthlyInstallment;
        const remainingIncome = monthlyIncome - installment;
        const ratio = (installment / monthlyIncome) * 100;
        const isRisky = ratio > 30;

        return {
            chartData: [
                { name: 'Renda Total', value: monthlyIncome, color: '#9CA3AF' },
                { name: 'Parcela', value: installment, color: isRisky ? '#ef4444' : '#10b981' },
                { name: 'Livre', value: remainingIncome, color: '#60a5fa' }
            ],
            ratio,
            isRisky
        };
    }, [plan, monthlyIncome]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
             <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Saúde do Fluxo de Caixa
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Comprometimento da renda mensal.</p>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                 <div className={`mb-6 p-3 rounded-xl text-center border ${data.isRisky ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                     <p className="text-xs font-bold uppercase mb-1">Impacto Mensal</p>
                     <p className="text-2xl font-extrabold">{data.ratio.toFixed(1)}%</p>
                     <p className="text-[10px] mt-1">{data.isRisky ? '⚠️ Acima do recomendado (30%)' : '✅ Dentro da Margem Segura'}</p>
                 </div>

                 <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={24}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 600, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {data.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
