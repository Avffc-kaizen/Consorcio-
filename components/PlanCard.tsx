
import React, { useState, useEffect } from 'react';
import type { RecommendedPlan } from '../services/geminiService';

interface PlanCardProps {
  plan: RecommendedPlan;
  appliedBid?: number | null;
  onContract: () => void;
  isBestChoice?: boolean;
}

const ProviderContactModal: React.FC<{ provider: string; onClose: () => void }> = ({ provider, onClose }) => {
    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{provider}</h3>
                    <p className="text-gray-500 mb-6 text-sm">Canal oficial de atendimento para reservas.</p>
                    <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, appliedBid, onContract, isBestChoice = false }) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    
    // --- SIMULATOR STATE ---
    const [cashBid, setCashBid] = useState<number>(appliedBid || 0);
    const [embeddedPercent, setEmbeddedPercent] = useState<number>(0);
    const [strategy, setStrategy] = useState<'prazo' | 'parcela'>('prazo');

    useEffect(() => {
        if (appliedBid !== undefined && appliedBid !== null) {
            setCashBid(appliedBid);
        }
    }, [appliedBid]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(value / 100);

    // Cálculos
    const embeddedValue = (plan.assetValue * embeddedPercent) / 100;
    const totalBid = cashBid + embeddedValue;
    const bidPercentage = (totalBid / plan.assetValue) * 100;
    
    // Impacto do lance
    const installmentsEliminated = Math.floor(totalBid / plan.monthlyInstallment);
    const newTerm = Math.max(1, plan.termInMonths - installmentsEliminated);
    
    const totalDebt = plan.monthlyInstallment * plan.termInMonths;
    const remainingDebt = Math.max(0, totalDebt - totalBid);
    const newInstallment = remainingDebt / plan.termInMonths;

    // --- HEATMAP LOGIC (ENHANCED) ---
    const avgBid = plan.stats?.averageBid || 40;
    const maxScale = 65; // Capping visual scale at 65% for better resolution
    
    // Position Calculations (0-100% relative to maxScale)
    const avgPos = Math.min((avgBid / maxScale) * 100, 100);
    const userPos = Math.min((bidPercentage / maxScale) * 100, 100);
    const diff = bidPercentage - avgBid;

    // Status Determination
    const getHeatmapStatus = () => {
        if (diff >= 5) return { label: 'Alta Probabilidade', color: 'text-emerald-400', markerColor: 'bg-emerald-500' };
        if (diff >= -2) return { label: 'Competitivo', color: 'text-amber-400', markerColor: 'bg-amber-500' };
        return { label: 'Baixa Probabilidade', color: 'text-rose-400', markerColor: 'bg-rose-500' };
    };
    const status = getHeatmapStatus();

    // UI Helpers
    const getProviderColor = (p: string) => {
        if (p.includes('Porto')) return 'text-blue-700 bg-blue-50';
        if (p.includes('Mapfre')) return 'text-red-700 bg-red-50';
        return 'text-orange-700 bg-orange-50';
    };

    // Features Logic
    const features = plan.features || [];
    const visibleFeatures = showAllFeatures ? features : features.slice(0, 3);
    const hiddenCount = features.length - 3;

    return (
    <div className={`relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 flex flex-col h-full min-w-[320px] select-none group overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isBestChoice ? 'ring-4 ring-cyan-400/20' : 'border border-slate-200'}`}>
        
        {/* Top Badge */}
        {plan.recommendationTag && (
            <div className="absolute top-6 right-6 z-10">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wide ${isBestChoice ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {isBestChoice && "★"} {plan.recommendationTag}
                </span>
            </div>
        )}

        {/* HEADER & HERO VALUE */}
        <div className="px-8 pt-8 pb-2">
             <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 ${getProviderColor(plan.provider)}`}>
                {plan.provider}
            </div>
            
            <div className="mb-1">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">Crédito Disponível</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(plan.assetValue)}</p>
            </div>

            <div className="flex items-center gap-3 mt-4 mb-4">
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex-grow">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Parcela Base</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(plan.monthlyInstallment)}</p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Prazo</p>
                    <p className="text-xl font-bold text-slate-800">{plan.termInMonths}x</p>
                </div>
            </div>

            {/* FEATURES COMPACT LIST */}
            {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {visibleFeatures.map((feature, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                            <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[10px] font-semibold text-slate-600 leading-none">{feature}</span>
                        </div>
                    ))}
                    
                    {features.length > 3 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowAllFeatures(!showAllFeatures); }}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-cyan-700 transition-colors border border-transparent hover:border-slate-200"
                        >
                            {showAllFeatures ? 'Menos' : `+${hiddenCount}`}
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* SIMULATOR COCKPIT */}
        <div className="bg-slate-50/80 border-t border-slate-200 p-6 flex-grow flex flex-col backdrop-blur-sm">
            
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    Simulador de Lances
                </h4>
                {/* Strategy Toggle */}
                <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                     <button onClick={() => setStrategy('prazo')} className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${strategy === 'prazo' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Reduzir Prazo</button>
                     <button onClick={() => setStrategy('parcela')} className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${strategy === 'parcela' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Reduzir Parcela</button>
                </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-3 mb-5">
                {/* Lance Livre Input */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all shadow-sm">
                    <div className="flex justify-between mb-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Lance Livre (Recurso Próprio)</label>
                        <span className="text-[9px] font-bold text-slate-400">Dinheiro</span>
                    </div>
                    <div className="relative">
                         <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                        <input 
                            type="number" 
                            value={cashBid || ''}
                            onChange={(e) => setCashBid(Number(e.target.value))}
                            className="w-full pl-6 text-base font-bold text-slate-900 outline-none placeholder-slate-300"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                {/* Lance Embutido Slider */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                         <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Lance Embutido
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        </label>
                        <div className="text-right">
                            <span className="text-xs font-bold text-cyan-700">{embeddedPercent}%</span>
                            <span className="text-[9px] text-slate-400 font-medium ml-1">(-{formatCurrency(embeddedValue)})</span>
                        </div>
                    </div>
                    <input 
                        type="range" min="0" max="30" step="1" 
                        value={embeddedPercent}
                        onChange={(e) => setEmbeddedPercent(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500"
                    />
                     <div className="flex justify-between mt-1 px-1">
                        <span className="text-[8px] text-slate-300 font-bold">0%</span>
                        <span className="text-[8px] text-slate-300 font-bold">30%</span>
                    </div>
                </div>
            </div>

            {/* Results Display - Dark Mode Widget with Heatmap */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg mb-4 relative overflow-hidden">
                 {/* Background decoration */}
                 <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500 rounded-full blur-[40px] opacity-20 pointer-events-none"></div>
                 
                 <div className="relative z-10">
                     <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-3">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Lance Total</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white tracking-tight">{formatPercent(bidPercentage)}</span>
                                <span className="text-[10px] text-slate-400">({formatCurrency(totalBid)})</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-300 uppercase block mb-0.5">
                                {strategy === 'prazo' ? 'Novo Prazo' : 'Nova Parcela'}
                            </span>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                                    {strategy === 'prazo' ? `${newTerm} meses` : formatCurrency(newInstallment)}
                                </span>
                                {strategy === 'prazo' && installmentsEliminated > 0 && (
                                    <span className="text-[9px] text-green-400 font-bold">
                                        - {installmentsEliminated} parcelas
                                    </span>
                                )}
                            </div>
                        </div>
                     </div>
                     
                     {/* HEATMAP / BID PROBABILITY (ENHANCED) */}
                     <div>
                        <div className="flex justify-between items-end mb-1.5">
                             <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Probabilidade</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${status.color}`}>{status.label}</span>
                             </div>
                             <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Diferença</span>
                                <span className={`text-[10px] font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                </span>
                             </div>
                        </div>
                        
                        <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-visible mt-2 select-none group/heatmap">
                            {/* Gradient Bar */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80"></div>
                            
                            {/* Average Marker (Historical Benchmark) */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10" style={{ left: `${avgPos}%` }}>
                                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 whitespace-nowrap opacity-0 group-hover/heatmap:opacity-100 transition-opacity">
                                    Média: {avgBid}%
                                 </div>
                            </div>

                            {/* User Marker (Dynamic) */}
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-white border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 transition-all duration-500 flex items-center justify-center cursor-help" 
                                style={{ left: `${userPos}%`, transform: 'translate(-50%, -50%)' }}
                                title={`Seu lance: ${bidPercentage.toFixed(1)}%`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${status.markerColor} ${diff >= 5 ? 'animate-pulse' : ''}`}></div>
                            </div>
                        </div>
                         <div className="flex justify-between mt-1.5 px-1 text-[8px] text-slate-500 font-bold">
                            <span>0%</span>
                            <span className="text-slate-600">Média Histórica: {avgBid}%</span>
                            <span>{maxScale}%+</span>
                        </div>
                     </div>
                 </div>
            </div>

            <button 
                onClick={onContract}
                className="w-full mt-auto bg-slate-900 hover:bg-blue-950 text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group border border-slate-800"
            >
                Validar com Especialista
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
        </div>

        {isContactModalOpen && <ProviderContactModal provider={plan.provider} onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
};

export default PlanCard;
