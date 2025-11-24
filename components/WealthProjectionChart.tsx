
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PortfolioPlan } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const WealthProjectionChart: React.FC<{ portfolio: PortfolioPlan[] }> = ({ portfolio }) => {
    const projectionData = useMemo(() => {
        if (portfolio.length === 0) return [];
        
        const data = [];
        const projectionYears = 10;

        for (let year = 0; year <= projectionYears; year++) {
            let totalInvested = 0;
            let totalAssets = 0;
            let totalDebt = 0;

            portfolio.forEach(plan => {
                const totalCost = plan.assetValue * (1 + plan.adminFee);
                const annualPayment = plan.monthlyInstallment * 12;
                
                let futurePaidAmount = plan.paidAmount + (annualPayment * year);
                if (futurePaidAmount > totalCost) {
                    futurePaidAmount = totalCost;
                }

                totalInvested += futurePaidAmount;
                // Simple appreciation model (e.g., 5% per year for real estate/assets)
                totalAssets += plan.assetValue * Math.pow(1.05, year);
                
                const remainingDebt = Math.max(0, totalCost - futurePaidAmount);
                totalDebt += remainingDebt;
            });

            data.push({
                name: year === 0 ? 'Hoje' : `${year}a`,
                'Capital Investido': Math.round(totalInvested),
                'Patrimônio Projetado': Math.round(totalAssets - totalDebt),
            });
        }
        return data;
    }, [portfolio]);

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 md:p-6 rounded-2xl shadow-sm mb-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Curva de Alavancagem</h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Projeção de crescimento patrimonial vs. custo.</p>
                 </div>
            </div>
            <div style={{ width: '100%', height: 250 }}>
                 <ResponsiveContainer>
                    <LineChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} interval={1} />
                        <YAxis 
                            tickFormatter={(value) => `R$${value / 1000}k`} 
                            tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                           formatter={(value: number) => formatCurrency(value)}
                           contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: 'none', borderRadius: '8px', color: '#f3f4f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                           itemStyle={{ paddingBottom: '2px' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                        <Line 
                            type="monotone" 
                            dataKey="Capital Investido" 
                            stroke="#9CA3AF" 
                            strokeWidth={2} 
                            dot={false}
                            name="Investido"
                            strokeDasharray="5 5"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="Patrimônio Projetado" 
                            stroke="#06b6d4" 
                            strokeWidth={3} 
                            dot={{ r: 0 }} 
                            activeDot={{ r: 6 }}
                            name="Patrimônio"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WealthProjectionChart;
