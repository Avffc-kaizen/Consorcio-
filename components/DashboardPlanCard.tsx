
import React, { useState } from 'react';
import type { PortfolioPlan, AiPortfolioInsight } from '../types';

// Lazy load modals
const PlanAnalysisModal = React.lazy(() => import('./PlanAnalysisModal').then(module => ({ default: module.PlanAnalysisModal })));
const PlanManagementModal = React.lazy(() => import('./PlanManagementModal').then(module => ({ default: module.PlanManagementModal })));

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
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    return (
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${colorClasses[config.color]}`}>
            <span className={`h-2 w-2 rounded-full bg-current`}></span>
            <span className="text-xs font-bold uppercase tracking-wide">{config.label}</span>
        </div>
    );
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">{title}</h4>
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
        'Aceito': 'bg-green-100 text-green-700 border border-green-200',
        'Recusado': 'bg-red-100 text-red-700 border border-red-200',
        'Pendente': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
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
                            <p className="font-medium text-gray-900">{isPayment ? item.type : 'Oferta de Lance'}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
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

const DashboardPlanCard: React.FC<DashboardPlanCardProps> = ({ plan, onListPlan, aiInsight, onUpdatePlan }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    
    const getInsightStyles = (type: string) => {
        switch(type) {
            case 'CONTEMPLAR': return 'bg-purple-600 text-white shadow-purple-500/30';
            case 'VENDER': return 'bg-green-600 text-white shadow-green-500/30';
            case 'COMPRAR': return 'bg-blue-600 text-white shadow-blue-500/30';
            default: return 'bg-gray-600 text-white';
        }
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
                
                {/* Management Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsManagementModalOpen(true);
                        }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-cyan-600 transition-colors"
                        title="Gerenciar Plano"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <div 
                    className="p-6 cursor-pointer" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex flex-col gap-4">
                        <div className="pr-12">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">{plan.provider}</span>
                                <span className="text-xs font-medium text-gray-400">{plan.category}</span>
                                
                                {/* AI Action Badge - Prominent in Header */}
                                {aiInsight && (
                                    <div className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse ${getInsightStyles(aiInsight.action.type)}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        IA: {aiInsight.action.label}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-extrabold text-2xl text-gray-900 leading-tight">{plan.planName}</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 mt-4 sm:mt-2">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Valor Pago</p>
                                <div className="flex items-baseline gap-2">
                                     <p className="text-xl font-bold text-gray-900">{formatCurrency(plan.paidAmount)}</p>
                                     <span className="text-sm font-medium text-gray-500 bg-gray-100 px-1.5 rounded">
                                        {formatPercent(plan.paidPercentage)}
                                     </span>
                                </div>
                            </div>
                             <div className="text-left sm:text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Crédito</p>
                                <p className="text-2xl font-extrabold text-cyan-600 tracking-tight">{formatCurrency(plan.assetValue)}</p>
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full" style={{ width: `${Math.max(5, plan.paidPercentage * 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 mt-2 gap-2">
                            <StatusBadge status={plan.status} />
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block font-medium">Próx. Vencimento</span>
                                <span className="text-sm font-bold text-gray-700">{plan.nextDueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden bg-gray-50 border-t border-gray-100 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
                >
                    <div className="p-6 space-y-8">
                        {aiInsight && (
                            <div className="p-5 rounded-xl bg-white border border-cyan-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                                <h4 className="font-bold text-cyan-800 flex items-center gap-2 mb-3">
                                    <span className="p-1.5 bg-cyan-100 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-700" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </span>
                                    Insight do Consultor
                                </h4>
                                <div className="mb-4 pl-2">
                                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide mb-1">{aiInsight.title}</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{aiInsight.description}</p>
                                </div>
                                <button className={`w-full text-xs font-bold py-3 rounded-lg transition-transform active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2 ${getInsightStyles(aiInsight.action.type)}`}>
                                    {aiInsight.action.label}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <DetailSection title="Histórico de Pagamentos">
                                {plan.paymentHistory.length > 0 ? (
                                    plan.paymentHistory.map((item, index) => <HistoryItem key={index} item={item} />)
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Nenhum pagamento registrado.</p>
                                )}
                            </DetailSection>
                            
                            <DetailSection title="Histórico de Lances">
                                {plan.bidHistory.length > 0 ? (
                                    plan.bidHistory.map((item, index) => <HistoryItem key={index} item={item} />)
                                ) : (
                                    <div className="bg-white rounded-xl p-6 text-center border border-dashed border-gray-300">
                                        <p className="text-sm text-gray-500">Nenhum lance registrado.</p>
                                        <p className="text-xs text-gray-400 mt-1">Simule um lance agora para ver suas chances.</p>
                                    </div>
                                )}
                            </DetailSection>
                        </div>
                        
                        <div className="mt-4 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsAnalysisModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Analisar Chances
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20 hover:-translate-y-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Pagar Parcela
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <React.Suspense fallback={null}>
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
            </React.Suspense>
        </>
    );
};

export default DashboardPlanCard;
