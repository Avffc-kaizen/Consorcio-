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
    const installmentsEliminated = Math.floor(totalBid / plan.monthlyInstallment);
    const newTerm = Math.max(1, plan.termInMonths - installmentsEliminated);
    
    // Cálculo de Diluição
    const totalDebt = plan.monthlyInstallment * plan.termInMonths;
    const remainingDebt = Math.max(0, totalDebt - totalBid);
    const newInstallment = remainingDebt / plan.termInMonths;

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
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Parcela</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(plan.monthlyInstallment)}</p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Taxa</p>
                    <p className="text-xl font-bold text-slate-800">{formatPercent(plan.adminFee * 100)}</p>
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
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Simulador
                </h4>
                <div className="flex bg-white p-0.5 rounded-lg shadow-sm border border-slate-200">
                     <button onClick={() => setStrategy('prazo')} className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${strategy === 'prazo' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Prazo</button>
                     <button onClick={() => setStrategy('parcela')} className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${strategy === 'parcela' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Parcela</button>
                </div>
            </div>

            {/* Inputs Compactos */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Lance Livre</label>
                    <input 
                        type="number" 
                        value={cashBid || ''}
                        onChange={(e) => setCashBid(Number(e.target.value))}
                        className="w-full text-sm font-bold text-slate-900 outline-none placeholder-slate-300"
                        placeholder="R$ 0"
                    />
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 group">
                    <label className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                        Embutido <span className="text-cyan-600">{embeddedPercent}%</span>
                    </label>
                    <input 
                        type="range" min="0" max="30" step="5" 
                        value={embeddedPercent}
                        onChange={(e) => setEmbeddedPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 mt-2"
                    />
                </div>
            </div>

            {/* Results Display */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
                 <div className="flex justify-between items-end mb-2 border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Lance Total</span>
                    <span className="text-sm font-bold text-slate-900">{formatPercent(bidPercentage)} <span className="text-slate-400 text-[10px]">({formatCurrency(totalBid)})</span></span>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {strategy === 'prazo' ? 'Novo Prazo Estimado' : 'Nova Parcela Estimada'}
                    </span>
                    <span className="text-lg font-black text-green-600">
                        {strategy === 'prazo' ? `${newTerm} meses` : formatCurrency(newInstallment)}
                    </span>
                 </div>
                 {strategy === 'prazo' && installmentsEliminated > 0 && (
                    <div className="text-right text-[10px] text-green-600 font-bold mt-1">
                        -{installmentsEliminated} parcelas eliminadas
                    </div>
                 )}
            </div>

            <button 
                onClick={onContract}
                className="w-full mt-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
                Reservar Estratégia
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
        </div>

        {isContactModalOpen && <ProviderContactModal provider={plan.provider} onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
};

export default PlanCard;