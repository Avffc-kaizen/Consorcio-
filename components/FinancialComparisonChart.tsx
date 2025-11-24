
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import type { RecommendedPlan } from '../services/geminiService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                <p className="font-bold mb-2 border-b border-slate-600 pb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between gap-4 mb-1">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-bold">{formatCurrency(entry.value)}</span>
                    </div>
                ))}
                {payload.length > 1 && (
                     <div className="mt-2 pt-2 border-t border-slate-600 flex justify-between gap-4">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-bold text-white">
                            {formatCurrency(payload.reduce((acc: number, curr: any) => acc + curr.value, 0))}
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const FinancialComparisonChart: React.FC<{ plan: RecommendedPlan }> = ({ plan }) => {
    const [viewMode, setViewMode] = useState<'cost' | 'flow'>('cost');

    const data = useMemo(() => {
        const assetValue = plan.assetValue;
        
        // Consórcio
        // Taxa administrativa total em R$
        const adminFeeTotal = assetValue * (plan.adminFee > 1 ? plan.adminFee / 100 : plan.adminFee);
        const consortiumTotal = assetValue + adminFeeTotal;
        
        // Financiamento (Simulação Mercado - 1.59% a.m. - Tabela Price)
        const rate = 0.0159;
        const n = plan.termInMonths; 
        const pmt = assetValue * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
        const financingTotal = pmt * n;
        const interestTotal = financingTotal - assetValue;

        const savings = financingTotal - consortiumTotal;
        const savingsPercent = (savings / financingTotal) * 100;

        // Dados para Gráfico de Barras Empilhadas (Stacked)
        // Mostra claramente que o "Bem" é o mesmo, o que muda é o custo extra
        const stackedChartData = [
            {
                name: 'Consórcio',
                'Valor do Bem': Math.round(assetValue),
                'Custo Admin.': Math.round(adminFeeTotal),
                total: Math.round(consortiumTotal),
                colorBase: '#0891b2', // Cyan 600
                colorExtra: '#67e8f9' // Cyan 300
            },
            {
                name: 'Financiamento',
                'Valor do Bem': Math.round(assetValue),
                'Juros Bancários': Math.round(interestTotal),
                total: Math.round(financingTotal),
                colorBase: '#94a3b8', // Slate 400 (Asset visually neutral)
                colorExtra: '#ef4444' // Red 500 (Interest Warning)
            }
        ];

        // Dados para Linha do Tempo (Fluxo)
        const timeSeriesData = [];
        // Estimativa: Contemplação ocorre em média no primeiro terço ou com lance
        const estimatedContemplationMonth = Math.max(3, Math.floor(n * 0.1)); 
        
        for (let i = 0; i <= n; i += Math.max(1, Math.floor(n/10))) { 
            const consortiumPaid = (consortiumTotal / n) * i;
            const financingPaid = pmt * i;
            
            timeSeriesData.push({
                month: i,
                'Consórcio': Math.round(consortiumPaid),
                'Financiamento': Math.round(financingPaid),
            });
        }

        return {
            stackedChartData,
            timeSeriesData,
            consortiumTotal,
            financingTotal,
            savings,
            savingsPercent,
            pmt,
            estimatedContemplationMonth,
            adminFeeTotal,
            interestTotal
        };
    }, [plan]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200 h-full flex flex-col relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-50 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-6 flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="bg-slate-900 text-white p-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </span>
                        Matemática Financeira
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Comparativo oficial: Custo vs. Tempo.</p>
                </div>
                
                {/* Toggle View */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                    <button 
                        onClick={() => setViewMode('cost')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'cost' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        Dinheiro (Custo)
                    </button>
                    <button 
                        onClick={() => setViewMode('flow')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'flow' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        Tempo (Fluxo)
                    </button>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center min-h-[320px] relative z-10">
                
                {viewMode === 'cost' ? (
                    <div className="animate-in fade-in duration-500 h-full flex flex-col">
                         <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p>
                                    <strong className="text-slate-900">Onde vai seu dinheiro:</strong> No financiamento, você paga o bem <strong className="text-red-600">quase 2 vezes</strong> (Juros). No consórcio, a taxa é fixa e previsível.
                                </p>
                            </div>
                        </div>

                        {/* Stacked Bar Chart */}
                        <div className="h-64 w-full mb-4 flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.stackedChartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barSize={40}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={100} 
                                        tick={{fontSize: 12, fontWeight: 700, fill: '#334155'}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}/>
                                    
                                    {/* Base Stack: Asset Value */}
                                    <Bar dataKey="Valor do Bem" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} animationDuration={1500} />
                                    
                                    {/* Top Stack: Costs */}
                                    <Bar dataKey="Custo Admin." stackId="a" fill="#06b6d4" radius={[0, 8, 8, 0]} animationDuration={1500} />
                                    <Bar dataKey="Juros Bancários" stackId="a" fill="#ef4444" radius={[0, 8, 8, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Economy Banner */}
                        <div className="mt-auto bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/10">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider mb-1">Economia Real Projetada</p>
                                <p className="text-3xl font-black tracking-tight">{formatCurrency(data.savings)}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg">
                                    <span className="text-sm font-bold text-white">{Math.round(data.savingsPercent)}%</span>
                                    <span className="text-[10px] text-slate-300">mais barato</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500 h-full flex flex-col">
                         <div className="mb-2 flex gap-4 text-xs font-medium text-slate-500 justify-center pb-4 border-b border-slate-100">
                             <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-red-500"></span> Aquisição Imediata (Alto Custo)
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-cyan-600"></span> Aquisição Planejada (Economia)
                             </div>
                         </div>
                        
                        <div className="flex-grow h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.timeSeriesData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="month" tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(v) => `Mês ${v}`}/>
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    
                                    <Line 
                                        type="monotone" 
                                        dataKey="Financiamento" 
                                        stroke="#ef4444" 
                                        strokeWidth={3} 
                                        dot={false}
                                        name="Financiamento"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Consórcio" 
                                        stroke="#0891b2" 
                                        strokeWidth={4} 
                                        dot={false}
                                        name="Consórcio"
                                    />
                                    
                                    {/* Annotations for Time Trade-off */}
                                    <ReferenceLine x={0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Compra Imediata', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                                    <ReferenceLine x={data.estimatedContemplationMonth} stroke="#0891b2" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Contemplação (Média)', fill: '#0891b2', fontSize: 10, fontWeight: 'bold' }} />

                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                             <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                 <p className="text-[10px] font-bold text-red-400 uppercase">Parcela Banco</p>
                                 <p className="font-black text-red-600 text-lg">{formatCurrency(data.pmt)}</p>
                             </div>
                             <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                                 <p className="text-[10px] font-bold text-cyan-600 uppercase">Parcela Consórcio</p>
                                 <p className="font-black text-cyan-700 text-lg">{formatCurrency(plan.monthlyInstallment)}</p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialComparisonChart;
