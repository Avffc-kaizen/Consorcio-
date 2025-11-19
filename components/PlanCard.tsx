
import React, { useState, useEffect } from 'react';
import type { RecommendedPlan } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlanCardProps {
  plan: RecommendedPlan;
  appliedBid?: number | null;
  onToggleCompare?: (planName: string) => void;
  isSelectedForCompare?: boolean;
  showCompareToggle?: boolean;
  compareDisabled?: boolean;
  onContract: () => void;
  isBestChoice?: boolean;
}

const InfoItem: React.FC<{ label: string, value: string | number, className?: string }> = ({ label, value, className }) => (
    <div className="flex flex-col">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{label}</p>
        <p className={`font-bold ${className}`}>{value}</p>
    </div>
);

const ProviderLogo: React.FC<{ provider: 'Porto Seguro' | 'Mapfre' }> = ({ provider }) => {
    const initial = provider.charAt(0);
    const color = provider === 'Porto Seguro' ? 'bg-blue-600' : 'bg-red-600';
    return (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} text-white font-bold text-lg flex-shrink-0 shadow-sm`}>
            {initial}
        </div>
    );
}

interface ProviderContactModalProps {
    provider: 'Porto Seguro' | 'Mapfre';
    onClose: () => void;
}

const ProviderContactModal: React.FC<ProviderContactModalProps> = ({ provider, onClose }) => {
    // ... (Same implementation as before, keeping it concise for the diff)
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const providerDetails = {
        'Porto Seguro': { name: 'Porto Seguro Consórcio', phone: '0800 727 0909', website: 'www.portoseguro.com.br/consorcio', description: 'Líder em confiabilidade.' },
        'Mapfre': { name: 'Mapfre Consórcios', phone: '0800 775 1234', website: 'www.mapfre.com.br/consorcio', description: 'Solidez global.' }
    };
    const details = providerDetails[provider];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{details.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{details.description}</p>
                <div className="space-y-2">
                    <p className="font-mono">{details.phone}</p>
                    <p className="text-cyan-600">{details.website}</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-100 dark:bg-gray-700 py-2 rounded-lg font-bold">Fechar</button>
            </div>
        </div>
    );
};

const getContemplationRates = (category: 'Automóvel' | 'Imóvel' | 'Serviços') => {
    // ... (Simplified for display)
    switch (category) {
        case 'Automóvel': return "Lance Médio: 35% a 45%";
        case 'Imóvel': return "Lance Médio: 40% a 50%";
        case 'Serviços': return "Lance Médio: 25% a 35%";
        default: return "";
    }
};

export const PlanCard: React.FC<PlanCardProps> = ({ plan, appliedBid, onToggleCompare, isSelectedForCompare, showCompareToggle, compareDisabled, onContract, isBestChoice = false }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [embeddedBidPercent, setEmbeddedBidPercent] = useState(0);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    const formatPercent = (value: number) => {
        const normalizedValue = value > 1 ? value / 100 : value;
        return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(normalizedValue);
    }

    const embeddedBidValue = (plan.assetValue * embeddedBidPercent) / 100;
    const totalAppliedBid = (appliedBid || 0) + embeddedBidValue;
    
    let newMonthlyInstallment: number | null = null;
    if (totalAppliedBid > 0 && totalAppliedBid < plan.assetValue) {
        const normalizedFee = plan.adminFee > 1 ? plan.adminFee / 100 : plan.adminFee;
        const totalAdminFeeAmount = plan.assetValue * normalizedFee;
        const newPrincipal = plan.assetValue - totalAppliedBid;
        newMonthlyInstallment = (newPrincipal + totalAdminFeeAmount) / plan.termInMonths;
    }
    
    return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border
        ${isBestChoice 
            ? 'border-cyan-500 ring-1 ring-cyan-500 dark:border-cyan-400' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
    >
        {/* Comparison Toggle (Desktop mostly, but functional on mobile) */}
        {showCompareToggle && onToggleCompare && (
            <div className="absolute top-4 right-4 z-10 hidden md:block">
                <input
                    type="checkbox"
                    checked={isSelectedForCompare}
                    onChange={() => onToggleCompare(plan.planName)}
                    disabled={compareDisabled}
                    className="h-5 w-5 rounded-full text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
            </div>
        )}
        
        {/* Recommended Badge */}
        {isBestChoice && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap z-10">
                RECOMENDAÇÃO IA
            </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4 mt-2">
             <ProviderLogo provider={plan.provider} />
            <div className="flex-grow leading-tight">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{plan.planName}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{plan.provider}</span>
            </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
            <InfoItem label="Crédito (Bem)" value={formatCurrency(plan.assetValue)} className="text-xl text-cyan-600 dark:text-cyan-400" />
            <InfoItem label="Parcela Mensal" value={formatCurrency(plan.monthlyInstallment)} className="text-lg text-gray-800 dark:text-white" />
            <InfoItem label="Prazo" value={`${plan.termInMonths} meses`} className="text-sm text-gray-700 dark:text-gray-300" />
            <InfoItem label="Taxa Adm." value={formatPercent(plan.adminFee)} className="text-sm text-gray-700 dark:text-gray-300" />
        </div>
        
        {/* Recommendation Tag */}
        {plan.recommendationTag && (
             <div className="mb-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50 w-full justify-center">
                    {plan.recommendationTag}
                </span>
            </div>
        )}

        {/* Dynamic Simulation Result */}
        {totalAppliedBid > 0 && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800/50 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-green-800 dark:text-green-300 font-medium">Com Lance de {formatCurrency(totalAppliedBid)}</span>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Nova Parcela:</span>
                    <span className="text-xl font-extrabold text-green-600 dark:text-green-400">{newMonthlyInstallment ? formatCurrency(newMonthlyInstallment) : '-'}</span>
                </div>
            </div>
        )}

        <div className="flex-grow"></div>

        {/* Collapsible Details */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailsVisible ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
             <div className="pt-2 pb-2 text-sm text-gray-600 dark:text-gray-300 space-y-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <p><strong>Histórico:</strong> {getContemplationRates(plan.category)}</p>
                <p><strong>Estatística:</strong> {plan.keyStat}</p>
                
                {/* Embedded Bid Slider within details */}
                <div className="mt-2">
                    <label className="text-xs font-bold text-gray-500">Simular Lance Embutido (%)</label>
                    <input 
                        type="range" min="0" max="30" step="5" 
                        value={embeddedBidPercent}
                        onChange={(e) => setEmbeddedBidPercent(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-cyan-600"
                    />
                    <div className="flex justify-between text-xs mt-1">
                        <span>0%</span>
                        <span className="font-bold text-cyan-600">{embeddedBidPercent}% ({formatCurrency(embeddedBidValue)})</span>
                        <span>30%</span>
                    </div>
                </div>
             </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
             <button 
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                className="text-xs font-semibold text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 flex items-center justify-center py-2"
            >
                {isDetailsVisible ? 'Menos Detalhes' : 'Mais Detalhes & Configurar'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isDetailsVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            
            <button 
                onClick={onContract}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl text-base shadow-lg shadow-cyan-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
                Iniciar Projeto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>

        {isContactModalOpen && <ProviderContactModal provider={plan.provider} onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
};
