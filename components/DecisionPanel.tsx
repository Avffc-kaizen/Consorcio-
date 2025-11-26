
import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import type { UserProfile } from '../types';
import { RecommendedPlan } from '../services/geminiService';
import { submitConsorcioApplication } from '../services/portoSeguroApi';
import { trackMetaEvent } from '../services/metaService';
import { ConsortiumProcessTimeline } from './ConsortiumProcessTimeline';
import { SensitivityMatrix } from './SensitivityMatrix'; // Import Matrix

// Lazy Load Components for Code Splitting & Performance
const FinancialComparisonChart = React.lazy(() => import('./FinancialComparisonChart'));
const EquityEvolutionChart = React.lazy(() => import('./EquityEvolutionChart'));
const PlansComparisonTable = React.lazy(() => import('./PlansComparisonTable'));
const PlanCard = React.lazy(() => import('./PlanCard'));
const ContractingModal = React.lazy(() => import('./ContractingModal').then(module => ({ default: module.ContractingModal })));
import { BudgetAnalysisChart } from './BudgetAnalysisChart';


const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ChartSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 h-[400px] animate-pulse flex flex-col">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-6"></div>
        <div className="flex-grow bg-slate-50 rounded-lg"></div>
    </div>
);

const CardSkeleton = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[500px] animate-pulse min-w-[300px]">
        <div className="flex justify-between mb-6">
            <div className="h-5 w-24 bg-slate-200 rounded"></div>
            <div className="h-5 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-3/4 bg-slate-200 rounded mb-8 mx-auto"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-slate-100 rounded-xl"></div>
            <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-24 w-full bg-slate-50 rounded-xl mb-4"></div>
        <div className="h-12 w-full bg-slate-200 rounded-xl mt-auto"></div>
    </div>
);

const TableSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-[400px] animate-pulse">
        <div className="h-14 bg-slate-100 border-b border-slate-200 mb-2"></div>
        <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-50 rounded w-full"></div>
            ))}
        </div>
    </div>
);

interface DecisionPanelProps {
  userProfile: UserProfile;
  aiResponseText: string;
  recommendedPlans: RecommendedPlan[];
  customerProfileName: string;
  onRestart: () => void;
  onContractingSuccess: (plan: RecommendedPlan, contactInfo: { name: string; email: string; phone: string }) => void;
}

const BRIEFING_STEP_DELAY = 800;

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ userProfile, aiResponseText, recommendedPlans, customerProfileName, onRestart, onContractingSuccess }) => {
    const [bidAmount, setBidAmount] = useState<number | null>(null);
    const [useFgts, setUseFgts] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const fgtsBalance = userProfile.fgtsBalance || 0;

    const totalBid = useMemo(() => {
        const cashBid = bidAmount || 0;
        return useFgts ? cashBid + fgtsBalance : cashBid;
    }, [bidAmount, useFgts, fgtsBalance]);

    const debouncedTotalBid = useDebounce(totalBid, 500);
    const [contractingPlan, setContractingPlan] = useState<RecommendedPlan | null>(null);
    
    // Cards: Only Top 3 Best matches
    const top3Plans = useMemo(() => recommendedPlans.slice(0, 3), [recommendedPlans]);
    
    // Table: All plans found (Expanded list)
    const tablePlans = recommendedPlans;

    const briefingSteps = useMemo(() => [
        `Analisando perfil: ${customerProfileName || 'Investidor'}`,
        'Carregando tabelas oficiais (Mapfre / Porto / Bancorbrás)...',
        'Filtrando por valor solicitado e renda...',
        'Calculando viabilidade financeira (ROI)...',
        'Oportunidades localizadas!',
    ], [customerProfileName]);
    
    const [currentBriefingStep, setCurrentBriefingStep] = useState(0);

    useEffect(() => {
        if (currentBriefingStep < briefingSteps.length) {
            const timer = setTimeout(() => {
                setCurrentBriefingStep(prev => prev + 1);
            }, BRIEFING_STEP_DELAY);
            return () => clearTimeout(timer);
        } else {
             if (recommendedPlans.length > 0) {
                trackMetaEvent('ViewContent', 
                    { email: userProfile.contact?.email, phone: userProfile.contact?.phone, name: userProfile.contact?.name },
                    { 
                        content_ids: recommendedPlans.map(p => p.planName),
                        content_type: 'product',
                        currency: 'BRL',
                        value: recommendedPlans[0].assetValue 
                    }
                );
             }
        }
    }, [currentBriefingStep, briefingSteps.length, recommendedPlans, userProfile]);

    const isBriefingComplete = currentBriefingStep >= briefingSteps.length;

    const handleContractingSubmit = async (profile: UserProfile, plan: any) => {
        return await submitConsorcioApplication(profile, plan);
    };

    const handleSelectPlan = (plan: RecommendedPlan) => {
        setContractingPlan(plan);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 340; // Width of card + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleShare = async () => {
        if (!top3Plans[0]) return;
        const plan = top3Plans[0];
        
        const text = `*Estratégia de Aquisição - ${customerProfileName}*
        
🎯 *Objetivo:* ${userProfile.category}
🏆 *Melhor Cenário:* ${plan.planName} (${plan.provider})
💰 *Crédito:* ${formatCurrency(plan.assetValue)}
📉 *Parcela:* ${formatCurrency(plan.monthlyInstallment)}
📊 *Taxa Adm:* ${(plan.adminFee * 100).toFixed(2)}%

Gerado pela IA de Inteligência de Mercado.`;

        try {
            await navigator.clipboard.writeText(text);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2500);
        } catch (err) {
            console.error(err);
        }
    };

    if (!isBriefingComplete) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-[calc(100vh-120px)]">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Sincronizando Dados...</h2>
                <div className="w-full max-w-md space-y-3">
                    {briefingSteps.map((step, index) =>
                        currentBriefingStep > index ? (
                            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm animate-in fade-in-50 slide-in-from-bottom-3 duration-500 border border-slate-100">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <span className="font-medium text-slate-700 text-left">{step}</span>
                            </div>
                        ) : null
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-1000 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header Area */}
                <div className="mb-10 text-center md:text-left">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                         <div className="max-w-4xl">
                             <div className="inline-block px-3 py-1 bg-cyan-50 border border-cyan-100 rounded-full text-cyan-800 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest">Blueprint Estratégico: {customerProfileName || 'Investidor'}</span>
                             </div>
                             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Análise da Mesa de Negócios</h2>
                             <p className="text-slate-700 mt-4 text-lg leading-relaxed font-medium">
                                {aiResponseText}
                             </p>
                         </div>
                         
                         {/* Share Action */}
                         <button 
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm whitespace-nowrap active:scale-95"
                         >
                             {isShared ? (
                                 <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    <span>Copiado!</span>
                                 </>
                             ) : (
                                 <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    <span>Compartilhar Dossiê</span>
                                 </>
                             )}
                         </button>
                     </div>

                     <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <div className="text-sm text-amber-900 text-left">
                             <strong>Aviso Importante:</strong> Esta é uma simulação gratuita baseada em inteligência de dados. Os valores e disponibilidade de vagas em grupos são dinâmicos e precisam ser travados com um especialista.
                         </div>
                     </div>
                </div>

                {/* CAROUSEL OF PLAN CARDS (TOP 3 ONLY) */}
                <div className="mb-12 relative group">
                     <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">1</span>
                            Top 3 - Melhores Opções
                        </h3>
                        
                        <div className="flex gap-2 md:hidden">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Deslize →</span>
                        </div>

                        {/* Desktop Navigation Buttons */}
                        <div className="hidden md:flex gap-2">
                             <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                             <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                        </div>
                     </div>
                     
                     {/* Horizontal Scroll Container */}
                     <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory scroll-smooth px-2 -mx-2 scrollbar-hide items-stretch"
                     >
                        {top3Plans.map((plan, index) => {
                            return (
                                 <div key={plan.planName} className="snap-center shrink-0 w-[90vw] md:w-[360px] lg:w-[380px] h-full">
                                     <Suspense fallback={<CardSkeleton />}>
                                        <PlanCard
                                            plan={plan}
                                            isBestChoice={index === 0}
                                            appliedBid={debouncedTotalBid}
                                            onContract={() => handleSelectPlan(plan)}
                                        />
                                     </Suspense>
                                 </div>
                            );
                        })}
                         <div className="shrink-0 w-4 md:w-0"></div>
                     </div>
                </div>

                {/* Simulator Section & Sensitivity Matrix (NEW LAYOUT) */}
                {recommendedPlans.length > 1 && (
                    <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Input / Simulator */}
                        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-center">
                            
                                <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                     <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                     Simulador de Aceleração
                                </h4>
                                <p className="text-slate-600 mb-6 font-medium">
                                    Insira seu potencial de lance para recalcular todos os cenários da página.
                                </p>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-bold">R$</span>
                                        <input
                                            type="number"
                                            placeholder="Valor do Lance em Dinheiro"
                                            value={bidAmount || ''}
                                            onChange={(e) => setBidAmount(e.target.value ? parseFloat(e.target.value) : null)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 font-bold text-xl text-slate-900 shadow-inner placeholder-slate-400"
                                        />
                                    </div>
                                    
                                    {fgtsBalance > 0 && (
                                        <div className="flex items-center px-5 py-3 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setUseFgts(!useFgts)}>
                                            <input 
                                                type="checkbox" 
                                                checked={useFgts}
                                                onChange={(e) => setUseFgts(e.target.checked)}
                                                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-slate-300 cursor-pointer"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-bold text-blue-800">
                                                    Usar FGTS (+ {formatCurrency(fgtsBalance)})
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                        </div>

                        {/* NEW COMPONENT: Sensitivity Matrix */}
                        <div>
                             <SensitivityMatrix plan={top3Plans[0]} currentBid={debouncedTotalBid} />
                        </div>
                    </div>
                )}
                
                {/* Advanced Financial Analytics */}
                {recommendedPlans.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <div className="lg:col-span-2 h-full">
                             <Suspense fallback={<ChartSkeleton />}>
                                <FinancialComparisonChart plan={top3Plans[0]} />
                            </Suspense>
                        </div>

                        <div className="lg:col-span-1 h-full">
                            {userProfile.monthlyIncome ? (
                                <BudgetAnalysisChart plan={top3Plans[0]} monthlyIncome={userProfile.monthlyIncome} />
                            ) : (
                                <Suspense fallback={<ChartSkeleton />}>
                                    <EquityEvolutionChart plan={top3Plans[0]} />
                                </Suspense>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Consortium Process Timeline - Visual Roadmap */}
                <ConsortiumProcessTimeline />

                 {/* LISTA DE OPORTUNIDADES (Table Replacement) */}
                 {recommendedPlans.length > 0 && (
                    <Suspense fallback={<TableSkeleton />}>
                        <PlansComparisonTable 
                            plans={tablePlans} 
                            appliedBid={debouncedTotalBid} 
                            useFgts={useFgts}
                        />
                    </Suspense>
                 )}

                 {/* FINAL CTA SECTION - SPECIALIST HANDOFF */}
                <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Gostou da estratégia?</h3>
                        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                            Estes grupos possuem vagas limitadas. Para garantir a condição simulada, um Especialista precisa validar sua documentação e travar a cota junto à administradora.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                             <button
                                onClick={onRestart}
                                className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 font-bold transition-all"
                            >
                                Refazer Simulação
                            </button>
                            <button
                                onClick={() => handleSelectPlan(top3Plans[0])} // Opens modal for top plan
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-900/50 transition-all hover:scale-105"
                            >
                                Solicitar Validação com Especialista
                            </button>
                        </div>
                    </div>
                </div>

                {contractingPlan && (
                    <Suspense fallback={<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 text-white rounded-full border-2 border-t-transparent border-white"></div></div>}>
                        <ContractingModal 
                            plan={contractingPlan}
                            userProfile={userProfile}
                            onClose={() => setContractingPlan(null)}
                            onSubmit={handleContractingSubmit}
                            onSuccess={(contactInfo) => onContractingSuccess(contractingPlan, contactInfo)}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
};
