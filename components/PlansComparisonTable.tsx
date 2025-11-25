
import React, { useMemo } from 'react';
import type { RecommendedPlan } from '../services/geminiService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const PlansComparisonTable: React.FC<{ plans: RecommendedPlan[], appliedBid: number, useFgts: boolean }> = ({ plans, appliedBid, useFgts }) => {
    
    const processedPlans = useMemo(() => {
        const mapped = plans.map(p => {
            const totalCost = p.assetValue * (1 + (p.adminFee > 1 ? p.adminFee / 100 : p.adminFee));
            const costBenefitRatio = totalCost / p.assetValue;
            
            let verdict = '';
            if (p.provider === 'Bancorbrás') verdict = 'Retorno Fundo Reserva';
            else if (p.provider === 'Porto Seguro') verdict = 'Segurança';
            else if (p.provider === 'Mapfre') verdict = 'Flexibilidade';
            
            return { ...p, totalCost, costBenefitRatio, verdict };
        });

        return mapped.sort((a, b) => a.costBenefitRatio - b.costBenefitRatio);
    }, [plans]);

    return (
        <div className="mb-12 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Todas as Oportunidades</h3>
                    <p className="text-sm text-slate-500">Lista completa ordenada por eficiência financeira.</p>
                </div>
                <div className="hidden md:block text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {plans.length} Ativos Encontrados
                </div>
            </div>

            <div className="space-y-3">
                {/* Header Row (Hidden on Mobile for cleaner look) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    <div className="col-span-3">Grupo / Administradora</div>
                    <div className="col-span-2 text-right">Crédito</div>
                    <div className="col-span-2 text-right">Parcela</div>
                    <div className="col-span-2 text-center">Taxa Adm.</div>
                    <div className="col-span-3 text-right">Custo Total (Final)</div>
                </div>

                {/* Opportunity Strips */}
                {processedPlans.map((plan, index) => {
                    const isTopPick = index === 0;
                    
                    return (
                        <div 
                            key={`${plan.planName}-${index}`}
                            className={`group relative bg-white rounded-xl p-4 md:p-0 md:h-24 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-sm border transition-all duration-300 hover:shadow-md hover:border-cyan-200 ${isTopPick ? 'border-cyan-400 ring-1 ring-cyan-100' : 'border-slate-200'}`}
                        >
                             {isTopPick && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-12 bg-cyan-500 rounded-r-full"></div>
                             )}

                            {/* Provider & Name */}
                            <div className="col-span-3 md:pl-6 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${plan.provider === 'Porto Seguro' ? 'bg-blue-50 text-blue-700' : plan.provider === 'Bancorbrás' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                                    {plan.provider.substring(0, 2)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{plan.planName}</p>
                                    <p className="text-xs text-slate-500">{plan.provider}</p>
                                    <p className="text-[9px] font-bold text-cyan-600 uppercase mt-1">{plan.verdict}</p>
                                </div>
                            </div>

                            {/* Values */}
                            <div className="col-span-2 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end text-right border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                                <span className="md:hidden text-xs text-slate-400 font-bold uppercase">Crédito</span>
                                <p className="font-bold text-slate-900 text-lg md:text-base">{formatCurrency(plan.assetValue)}</p>
                            </div>

                            <div className="col-span-2 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end text-right border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                                <span className="md:hidden text-xs text-slate-400 font-bold uppercase">Parcela</span>
                                <p className="font-bold text-slate-600 text-base md:text-sm">{formatCurrency(plan.monthlyInstallment)}</p>
                            </div>

                            {/* Fee Tag (Highlighted) */}
                            <div className="col-span-2 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-center text-center border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                                <span className="md:hidden text-xs text-slate-400 font-bold uppercase">Taxa Adm.</span>
                                <span className="bg-amber-50 text-amber-800 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-amber-100">
                                    {formatPercent(plan.adminFee)}
                                </span>
                            </div>

                            {/* Total Cost (Highlighted) */}
                            <div className="col-span-3 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end text-right md:pr-6 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                                <span className="md:hidden text-xs text-slate-400 font-bold uppercase">Custo Total</span>
                                <div className="md:text-right">
                                    <p className="font-extrabold text-slate-800 text-base md:text-lg bg-slate-100 px-2 py-1 rounded-md inline-block">
                                        {formatCurrency(plan.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlansComparisonTable;
