
import React, { useState } from 'react';
import type { PortfolioPlan, AiPortfolioInsight } from '../types';
import { PlanAnalysisModal } from './PlanAnalysisModal';
import { PlanManagementModal } from './PlanManagementModal';

interface DashboardPlanCardProps {
    plan: PortfolioPlan;
    onListPlan: (plan: PortfolioPlan) => void;
    aiInsight?: AiPortfolioInsight;
    onUpdatePlan: (plan: PortfolioPlan) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number) => {
    const normalizedValue = value > 1 ? value / 100 : value;
    return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(normalizedValue);
};

const StatusBadge: React.FC<{ status: PortfolioPlan['status'] }> = ({ status }) => {
    const statusConfig = {
        'Ativa': { color: 'blue', label: 'Ativa' },
        'Contemplada': { color: 'green', label: 'Contemplada' },
        'Quitada': { color: 'purple', label: 'Quitada' },
        'À Venda': { color: 'yellow', label: 'À Venda' },
        'Em Análise (Anuência)': { color: 'orange', label: 'Em Análise' },
    };
    const config = statusConfig[status];
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    };

    return (
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${colorClasses[config.color]}`}>
            <span className={`h-2 w-2 rounded-full bg-current`}></span>
            <span className="text-xs font-bold uppercase tracking-wide">{config.label}</span>
        </div>
    );
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</h4>
        <div className="flow-root">
            <ul role="list" className="-mb-4">
                {children}
            </ul>
        </div>
    </div>
);

const HistoryItem: React.FC<{ item: { date: string; type?: string; amount: number; status?: string; } }> = ({ item }) => {
    const isPayment = 'type' in item;
    const statusClasses = {
        'Aceito': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
        'Recusado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
        'Pendente': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    };

    return (
        <li>
            <div className="relative pb-4">
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                        {!isPayment && (
                            <div className={`w-2 h-2 rounded-full ${
                                item.status === 'Aceito' ? 'bg-green-500' : 
                                item.status === 'Recusado' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                        )}
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{isPayment ? item.type : 'Oferta de Lance'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.amount)}</p>
                         {!isPayment && item.status && (
                             <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${statusClasses[item.status as keyof typeof statusClasses] || ''}`}>
                                {item.status}
                             </span>
                         )}
                    </div>
                 </div>
            </div>
        </li>
    );
};

export const DashboardPlanCard: React.FC<DashboardPlanCardProps> = ({ plan, onListPlan, aiInsight, onUpdatePlan }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    
    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 relative group overflow-hidden">
                
                {/* Management Button - Always visible on mobile for accessibility */}
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsManagementModalOpen(true);
                        }}
                        className="p-2.5 bg-gray-100 dark:bg-gray-700/80 rounded-full text-gray-600 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 transition-colors backdrop-blur-sm active:scale-95"
                        title="Gerenciar Plano"
                        aria-label="Configurações do Plano"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <div 
                    className="p-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-controls={`plan-details-${plan.planName.replace(/\s+/g, '-')}`}
                >
                    <div className="flex flex-col gap-4">
                        <div className="pr-12">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{plan.provider}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{plan.category}</span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{plan.planName}</h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Valor Pago</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(plan.paidAmount)} <span className="text-gray-400 font-normal">({formatPercent(plan.paidPercentage)})</span></p>
                            </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Crédito</p>
                                <p className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">{formatCurrency(plan.assetValue)}</p>
                            </div>
                        </div>

                        <div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${Math.max(5, plan.paidPercentage * 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-700/50">
                            <StatusBadge status={plan.status} />
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block">Próx. Vencimento</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{plan.nextDueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id={`plan-details-${plan.planName.replace(/\s+/g, '-')}`}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1200px]' : 'max-h-0'}`}
                >
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-6">
                        {aiInsight && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/40 dark:to-gray-800 border border-cyan-100 dark:border-cyan-800/50 shadow-sm">
                                <h4 className="font-bold text-cyan-800 dark:text-cyan-200 flex items-center gap-2 mb-2">
                                    <span className="p-1 bg-cyan-100 dark:bg-cyan-800 rounded-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </span>
                                    Arquiteto Financeiro
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiInsight.description}</p>
                                <button className="mt-3 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:underline uppercase tracking-wide">
                                    {aiInsight.action.label} &rarr;
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <DetailSection title="Histórico de Pagamentos">
                                {plan.paymentHistory.length > 0 ? (
                                    plan.paymentHistory.map((item, index) => <HistoryItem key={index} item={item} />)
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum pagamento registrado.</p>
                                )}
                            </DetailSection>
                            
                            {/* Enhanced Bid History Section */}
                            <DetailSection title="Histórico de Lances">
                                {plan.bidHistory.length > 0 ? (
                                    plan.bidHistory.map((item, index) => <HistoryItem key={index} item={item} />)
                                ) : (
                                    <div className="bg-gray-100 dark:bg-gray-700/30 rounded-lg p-4 text-center border border-dashed border-gray-300 dark:border-gray-600">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum lance registrado.</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use o painel de gerenciamento para simular.</p>
                                    </div>
                                )}
                            </DetailSection>
                        </div>
                        <div className="mt-2 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsAnalysisModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Analisar
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-cyan-600/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <PlanAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                plan={plan}
            />
             <PlanManagementModal 
                isOpen={isManagementModalOpen}
                onClose={() => setIsManagementModalOpen(false)}
                plan={plan}
                onUpdatePlan={onUpdatePlan}
            />
        </>
    );
};
