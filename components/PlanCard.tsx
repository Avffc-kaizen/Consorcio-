

import React, { useState, useEffect } from 'react';
import type { ConsorcioPlan } from '../types';

interface PlanCardProps {
  plan: ConsorcioPlan & { keyStat?: string };
  appliedBid?: number | null;
  onToggleCompare?: (planName: string) => void;
  isSelectedForCompare?: boolean;
  showCompareToggle?: boolean;
}

const InfoItem: React.FC<{ label: string, value: string | number, className?: string }> = ({ label, value, className }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-semibold ${className}`}>{value}</p>
    </div>
);

const ProviderLogo: React.FC<{ provider: 'Porto Seguro' | 'Mapfre' }> = ({ provider }) => {
    const initial = provider.charAt(0);
    const color = provider === 'Porto Seguro' ? 'bg-blue-600' : 'bg-red-600';
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white font-bold text-xl flex-shrink-0 shadow-md`}>
            {initial}
        </div>
    );
}

interface ProviderContactModalProps {
    provider: 'Porto Seguro' | 'Mapfre';
    onClose: () => void;
}

const ProviderContactModal: React.FC<ProviderContactModalProps> = ({ provider, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const providerDetails = {
        'Porto Seguro': {
            name: 'Porto Seguro Consórcio',
            phone: '0800 727 0909',
            website: 'www.portoseguro.com.br/consorcio',
            description: 'Um dos maiores e mais confiáveis provedores de consórcio do Brasil, com ampla variedade de planos e grupos.'
        },
        'Mapfre': {
            name: 'Mapfre Consórcios',
            phone: '0800 775 1213',
            website: 'www.mapfre.com.br/consorcios',
            description: 'Oferece planos flexíveis e competitivos, com a solidez de um dos maiores grupos seguradores do mundo.'
        }
    };
    
    const details = providerDetails[provider];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="contact-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Informações de Contato</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Fechar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{details.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{details.description}</p>
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.024 11.024 0 006.254 6.254l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            <span className="text-gray-800 dark:text-gray-200 font-medium">{details.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                             <a href={`https://${details.website}`} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">{details.website}</a>
                        </div>
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

const getContemplationRates = (category: 'Automóvel' | 'Imóvel' | 'Serviços') => {
    let details;
    switch (category) {
        case 'Automóvel':
            details = (
                <ul className="pl-5 mt-1 space-y-1 list-['-_'] list-inside text-xs">
                    <li>Lance Médio Histórico: <strong>35% a 45%</strong> do crédito.</li>
                    <li>Lance Mínimo (grupos novos): <strong>20% a 25%</strong> do crédito.</li>
                </ul>
            );
            break;
        case 'Imóvel':
            details = (
                 <ul className="pl-5 mt-1 space-y-1 list-['-_'] list-inside text-xs">
                    <li>Lance Médio Histórico: <strong>40% a 50%</strong> do crédito.</li>
                    <li>Lance Mínimo (grupos novos): <strong>28% a 35%</strong> do crédito.</li>
                </ul>
            );
            break;
        case 'Serviços':
            details = (
                <ul className="pl-5 mt-1 space-y-1 list-['-_'] list-inside text-xs">
                    <li>Lance Médio Histórico: <strong>25% a 35%</strong> do crédito.</li>
                    <li>Lance Mínimo (grupos novos): <strong>15% a 20%</strong> do crédito.</li>
                </ul>
            );
            break;
        default:
            return null;
    }
    return (
        <li>
            <strong>Histórico de Lances:</strong>
            {details}
        </li>
    );
};

export const PlanCard: React.FC<PlanCardProps> = ({ plan, appliedBid, onToggleCompare, isSelectedForCompare, showCompareToggle }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isBidSimulationVisible, setIsBidSimulationVisible] = useState(true);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [embeddedBidPercent, setEmbeddedBidPercent] = useState(0);
    const [isEmbeddedBidInputVisible, setIsEmbeddedBidInputVisible] = useState(false);


    const toggleDetails = () => {
        setIsDetailsVisible(prev => !prev);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    const formatPercent = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
    }

    const embeddedBidValue = (plan.assetValue * embeddedBidPercent) / 100;
    const totalAppliedBid = (appliedBid || 0) + embeddedBidValue;
    
    let newMonthlyInstallment: number | null = null;
    if (totalAppliedBid > 0 && totalAppliedBid < plan.assetValue) {
        const totalAdminFeeAmount = plan.assetValue * plan.adminFee;
        const newPrincipal = plan.assetValue - totalAppliedBid;
        newMonthlyInstallment = (newPrincipal + totalAdminFeeAmount) / plan.termInMonths;
    }
    
    const showEmbeddedBidInput = isEmbeddedBidInputVisible || embeddedBidPercent > 0;
    const totalEffectiveCost = plan.assetValue * (1 + plan.adminFee);

  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-lg transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        {showCompareToggle && onToggleCompare && (
            <div className="absolute top-4 right-4 z-10">
                <label htmlFor={`compare-${plan.planName.replace(/\s+/g, '-')}`} className="flex items-center space-x-2 cursor-pointer bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-2 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/50 transition-colors">
                <input
                    type="checkbox"
                    id={`compare-${plan.planName.replace(/\s+/g, '-')}`}
                    checked={isSelectedForCompare}
                    onChange={() => onToggleCompare(plan.planName)}
                    className="h-5 w-5 rounded-full border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                </label>
            </div>
        )}

        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                 <ProviderLogo provider={plan.provider} />
                <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{plan.planName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.provider} - {plan.category}</p>
                </div>
            </div>
        </div>

        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Valor do Crédito</p>
            <p className="text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">{formatCurrency(plan.assetValue)}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-md">
            <InfoItem label="Prazo" value={`${plan.termInMonths} meses`} className="text-lg text-gray-800 dark:text-white" />
            <InfoItem label="Parcela Mensal" value={formatCurrency(plan.monthlyInstallment)} className="text-lg text-gray-800 dark:text-white" />
            <InfoItem label="Taxa Adm." value={formatPercent(plan.adminFee)} className="text-lg text-gray-800 dark:text-white" />
        </div>
        
        {totalAppliedBid > 0 && (
            <div className="mt-4">
                 <button
                    onClick={() => setIsBidSimulationVisible(!isBidSimulationVisible)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-green-700 dark:text-green-300 focus:outline-none p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/50"
                    aria-expanded={isBidSimulationVisible}
                    aria-controls={`bid-simulation-${plan.planName.replace(/\s+/g, '-')}`}
                >
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Simulação de Lance Aplicada
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform duration-300 ${isBidSimulationVisible ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div
                    id={`bid-simulation-${plan.planName.replace(/\s+/g, '-')}`}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isBidSimulationVisible ? 'max-h-96 mt-4' : 'max-h-0'}`}
                >
                    <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg border-l-4 border-green-500 dark:border-green-400">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-200">Lance Total Aplicado</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAppliedBid)}</p>
                            </div>
                            
                            <div className="col-span-2 text-xs text-gray-600 dark:text-gray-400">
                                {(appliedBid || 0) > 0 && <p>Lance Simulado: {formatCurrency(appliedBid || 0)}</p>}
                                {embeddedBidValue > 0 && <p>Lance Embutido ({embeddedBidPercent}%): {formatCurrency(embeddedBidValue)}</p>}
                            </div>
                            
                            <div className="col-span-2 pt-2 mt-2 border-t border-green-200 dark:border-green-700/50">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-200">Impacto na Parcela</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Parcela Original</p>
                                <p className="text-lg line-through text-gray-500 dark:text-gray-400 font-semibold">{formatCurrency(plan.monthlyInstallment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-green-700 dark:text-green-300">Nova Parcela Estimada</p>
                                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">{newMonthlyInstallment ? formatCurrency(newMonthlyInstallment) : '-'}</p>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
            {!showEmbeddedBidInput ? (
                <button
                    onClick={() => setIsEmbeddedBidInputVisible(true)}
                    className="w-full text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 py-2 px-4 rounded-md border-2 border-dashed border-cyan-500/50 dark:border-cyan-400/50 transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Adicionar Lance Embutido
                </button>
            ) : (
                <div>
                    <label htmlFor={`embedded-bid-${plan.planName.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lance Embutido (use % do crédito)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            id={`embedded-bid-${plan.planName.replace(/\s+/g, '-')}`}
                            value={embeddedBidPercent || ''}
                            onChange={(e) => {
                                const val = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
                                setEmbeddedBidPercent(val);
                            }}
                            placeholder="0"
                            max="10"
                            autoFocus
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        />
                         <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">%</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Valor do lance embutido: {formatCurrency(embeddedBidValue)} (máx. 10%)</p>
                        <button 
                            onClick={() => {
                                setEmbeddedBidPercent(0);
                                setIsEmbeddedBidInputVisible(false);
                            }} 
                            className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                        >
                            Remover
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
             <div className="flex justify-between items-center">
                <button
                    onClick={toggleDetails}
                    className="flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline focus:outline-none"
                    aria-expanded={isDetailsVisible}
                    aria-controls={`plan-details-${plan.planName.replace(/\s+/g, '-')}`}
                >
                    {isDetailsVisible ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform duration-300 ${isDetailsVisible ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                 <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Mais Informações
                </button>
            </div>
            <div
                id={`plan-details-${plan.planName.replace(/\s+/g, '-')}`}
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isDetailsVisible ? 'max-h-96 mt-4' : 'max-h-0'}`}
            >
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <h4 className="font-semibold text-md mb-3 text-gray-800 dark:text-gray-200">Informações Adicionais</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                        <li><strong>Formas de Contemplação:</strong> Sorteio mensal (Loteria Federal) e lances (livre ou fixo, dependendo do grupo).</li>
                        {getContemplationRates(plan.category)}
                        <li><strong>Custo Total Efetivo:</strong> O valor total pago ao final do plano será de <strong>{formatCurrency(totalEffectiveCost)}</strong> (Crédito + Taxa Adm.).</li>
                        <li><strong>Seguro Prestamista:</strong> Cobertura opcional para quitação do saldo devedor em caso de imprevistos.</li>
                        <li><strong>Lance Embutido:</strong> Use até 10% do valor do próprio crédito para compor seu lance (consulte regulamento do grupo).</li>
                        <li><strong>Reajuste Anual:</strong> Parcelas e crédito atualizados para manter o poder de compra (INCC para imóveis, IPCA para demais bens).</li>
                    </ul>
                </div>
            </div>
        </div>

        {plan.keyStat && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Estatística Chave:</p>
                <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{plan.keyStat}</p>
            </div>
        )}
        {isContactModalOpen && <ProviderContactModal provider={plan.provider} onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
};