
import React, { useMemo, useState, Suspense, useEffect } from 'react';
import type { UserProfile, PortfolioPlan, AiPortfolioInsight, GamificationProfile } from '../types';
import { AiInsightEngine } from './AiInsightEngine';
import { GamificationHud } from './GamificationHud';
import { JourneyPath } from './JourneyPath';
import { checkWeeklyUnlock } from '../services/gamificationService';

// Lazy Load Components
const DashboardPlanCard = React.lazy(() => import('./DashboardPlanCard'));
const WealthProjectionChart = React.lazy(() => import('./WealthProjectionChart'));

interface DashboardProps {
  userProfile: UserProfile;
  portfolio: PortfolioPlan[];
  onStartNewAnalysis: () => void;
  onUpdatePlan: (plan: PortfolioPlan) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const KeyMetrics: React.FC<{ portfolio: PortfolioPlan[] }> = ({ portfolio }) => {
    const metrics = useMemo(() => {
        const totalPatrimonio = portfolio.reduce((sum, p) => sum + p.assetValue, 0);
        const totalCapitalInvestido = portfolio.reduce((sum, p) => sum + p.paidAmount, 0);
        const totalDivida = portfolio.reduce((sum, p) => {
            const totalCost = p.assetValue * (1 + p.adminFee);
            const remainingDebt = totalCost - p.paidAmount;
            return sum + (remainingDebt > 0 ? remainingDebt : 0);
        }, 0);
        const capitalAlavancado = totalPatrimonio - totalCapitalInvestido;

        return { totalPatrimonio, capitalAlavancado, totalDivida };
    }, [portfolio]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden group transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider z-10">Patrimônio Projetado</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 z-10">{formatCurrency(metrics.totalPatrimonio)}</p>
                <div className="mt-auto pt-2 z-10">
                     <span className="text-[10px] text-cyan-700 bg-cyan-100 dark:bg-cyan-900/40 dark:text-cyan-300 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Ativos Totais</span>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 rounded-2xl shadow-lg shadow-cyan-500/30 text-white flex flex-col transform transition-transform relative overflow-hidden hover:scale-[1.02]">
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <p className="text-xs font-bold text-cyan-100 uppercase tracking-wider">Lucro da Operação (Ágio)</p>
                <p className="text-4xl font-extrabold mt-2 tracking-tight">{formatCurrency(metrics.capitalAlavancado)}</p>
                <div className="mt-auto pt-2">
                    <span className="text-[10px] text-white/90 bg-white/20 px-2 py-1 rounded-full font-bold backdrop-blur-sm uppercase tracking-wide">Alavancagem</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-all hover:shadow-md">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo Devedor</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{formatCurrency(metrics.totalDivida)}</p>
                 <div className="mt-auto pt-2">
                     <span className="text-[10px] text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Sem Juros</span>
                </div>
            </div>
        </div>
    );
};

const ChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm mb-10 h-[300px] animate-pulse">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-48 bg-gray-100 dark:bg-gray-700/50 rounded mt-8"></div>
    </div>
);

const CardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm h-40 animate-pulse p-5">
         <div className="flex justify-between">
             <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
         </div>
         <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ userProfile, portfolio, onStartNewAnalysis, onUpdatePlan }) => {
  const [insights, setInsights] = useState<AiPortfolioInsight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Gamification State (Local for now, could be lifted to App.tsx)
  const [gameProfile, setGameProfile] = useState<GamificationProfile>(() => {
      const saved = localStorage.getItem('gamification_profile');
      if (saved) return JSON.parse(saved);
      return {
          level: 1,
          levelTitle: "Aprendiz Financeiro",
          currentPoints: 50, // Bonus for starting
          nextLevelThreshold: 100,
          streakDays: 1,
          lastActivityDate: new Date().toISOString(),
          unlockedQuotes: [],
          nextQuoteUnlockDate: new Date().toISOString() // Ready immediately for demo
      };
  });

  useEffect(() => {
      localStorage.setItem('gamification_profile', JSON.stringify(gameProfile));
  }, [gameProfile]);

  const handleClaimQuote = () => {
      const updatedProfile = checkWeeklyUnlock(gameProfile);
      if (updatedProfile !== gameProfile) {
          setGameProfile(updatedProfile);
      }
  };

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(plan => {
        const matchesSearch = plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todos' || plan.category === filterCategory;
        const matchesStatus = filterStatus === 'Todos' || plan.status === filterStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [portfolio, searchTerm, filterCategory, filterStatus]);

  const clearFilters = () => {
      setSearchTerm('');
      setFilterCategory('Todos');
      setFilterStatus('Todos');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-28 md:pb-12 animate-in fade-in duration-700">
      
      {/* Gamification HUD (Sticky Top) */}
      <GamificationHud profile={gameProfile} />
      
      <div className="container mx-auto px-4 py-6">
        <AiInsightEngine 
            portfolio={portfolio} 
            marketplaceListings={[]} 
            onInsightsGenerated={setInsights} 
        />
        
        <div className="max-w-6xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4">
                <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Painel Estratégico
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400">
                        Arquiteto: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{userProfile.contact?.name || 'Cliente'}</span>
                    </p>
                </div>
                </div>
                
                {/* Desktop Button */}
                <div className="hidden md:block">
                    {portfolio.length > 0 && (
                        <button 
                        onClick={onStartNewAnalysis}
                        className="group flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-600/30 transition-all duration-300 hover:-translate-y-1"
                        >
                        <span className="bg-white/20 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Nova Carta de Crédito
                        </button>
                    )}
                </div>
            </div>
            
            {portfolio.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Main Metrics & Assets */}
                <div className="lg:col-span-2 space-y-8">
                    <KeyMetrics portfolio={portfolio} />
                    
                    {/* Filters & Search */}
                    <div>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus Ativos</h2>
                            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                                <div className="relative group w-full md:w-48">
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-3 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="block w-full md:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="Todos">Status</option>
                                    <option value="Ativa">Ativa</option>
                                    <option value="Contemplada">Contemplada</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredPortfolio.length > 0 ? (
                                filteredPortfolio.map((plan, index) => {
                                    const planInsight = insights.find(insight => insight.action.targetId === plan.planName);
                                    return (
                                        <Suspense key={index} fallback={<CardSkeleton />}>
                                            <DashboardPlanCard 
                                                plan={plan} 
                                                onListPlan={() => {}} 
                                                aiInsight={planInsight} 
                                                onUpdatePlan={onUpdatePlan} 
                                            />
                                        </Suspense>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-gray-500">Nenhum ativo encontrado.</p>
                                    <button onClick={clearFilters} className="text-cyan-600 text-sm font-bold mt-2">Limpar Filtros</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Suspense fallback={<ChartSkeleton />}>
                        <WealthProjectionChart portfolio={portfolio} />
                    </Suspense>
                </div>

                {/* Right Column: Gamification Journey (Duolingo Style) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-40">
                         <JourneyPath profile={gameProfile} onClaimQuote={handleClaimQuote} />
                    </div>
                </div>

            </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-center shadow-sm mt-10">
                    <div className="w-24 h-24 bg-cyan-50 dark:bg-cyan-900/20 rounded-full flex items-center justify-center mb-8 animate-pulse ring-4 ring-cyan-50 dark:ring-cyan-900/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Seu Projeto Começa Aqui</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-10 leading-relaxed">
                        Vamos arquitetar seu futuro. Adquira seu primeiro ativo sem juros e inicie o ciclo de alavancagem patrimonial.
                    </p>
                    <button 
                        onClick={onStartNewAnalysis} 
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-cyan-600/30 hover:-translate-y-1"
                    >
                        Iniciar com IA
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
        </div>

        {/* Mobile Sticky Action Button */}
        <div className="md:hidden fixed bottom-6 right-4 left-4 z-50">
            <button 
                onClick={onStartNewAnalysis}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-cyan-600/40 flex items-center justify-center gap-3 transition-transform active:scale-95 backdrop-blur-xl border border-white/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Novo Ativo
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
