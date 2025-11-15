
import React, { useState, useEffect, useMemo } from 'react';
import type { ConsorcioPlan, UserProfile } from '../types';
import { PlanCard } from './PlanCard';
import { RecommendedPlan } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { submitConsorcioApplication } from '../services/portoSeguroApi';
import { ContractingModal } from './ContractingModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

// A simple debounce hook to delay updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const FinancialSummary: React.FC<{ plan: RecommendedPlan }> = ({ plan }) => {
    if (!plan) return null;

    const totalAdminCost = plan.assetValue * plan.adminFee;
    const totalPaid = plan.assetValue + totalAdminCost;
    
    // Simulação de financiamento (simplificada)
    // Assumindo uma taxa de juros anual de 24% (aprox. 1.81% ao mês)
    const annualInterestRate = 0.24;
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1/12) - 1;
    const n = plan.termInMonths;
    const L = plan.assetValue;
    
    // Formula da parcela de financiamento (Tabela Price)
    const financingMonthlyPayment = L * ( (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) / (Math.pow(1 + monthlyInterestRate, n) - 1) );
    const totalFinancingPaid = financingMonthlyPayment * n;
    const totalInterestPaid = totalFinancingPaid - L;
    const savings = totalFinancingPaid - totalPaid;

    return (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm mb-8">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Resumo Financeiro da Estratégia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Crédito Adquirido</p>
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(plan.assetValue)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Custo Total (Taxa Adm.)</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalAdminCost)}</p>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total Pago</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalPaid)}</p>
                </div>
                 <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-700 dark:text-green-300">Economia vs. Financiamento*</p>
                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{formatCurrency(savings)}</p>
                </div>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">*Cálculo de economia baseado em simulação de financiamento com taxa de juros anual de 24% para o mesmo prazo e valor. Valor aproximado.</p>
        </div>
    );
};

interface ComparisonModalProps {
  plans: RecommendedPlan[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ plans, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (plans.length === 0) return null;

    // Aprimoramento: Calcular os melhores valores para destaque visual
    const bestValues = {
        assetValue: Math.max(...plans.map(p => p.assetValue)),
        termInMonths: Math.min(...plans.map(p => p.termInMonths)),
        monthlyInstallment: Math.min(...plans.map(p => p.monthlyInstallment)),
        adminFee: Math.min(...plans.map(p => p.adminFee)),
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="comparison-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="comparison-title" className="text-xl font-bold text-gray-900 dark:text-white">Comparativo de Planos</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Fechar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="overflow-y-auto p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-gray-800 z-10">Característica</th>
                                    {plans.map(plan => (
                                        <th key={plan.planName} className="p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">
                                            {plan.planName}
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{plan.provider}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">Valor do Crédito</td>
                                    {plans.map(plan => (
                                        <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${plan.assetValue === bestValues.assetValue ? 'bg-green-50 dark:bg-green-900/30' : ''}`}>
                                            <span className={`font-bold text-lg ${plan.assetValue === bestValues.assetValue ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                                {formatCurrency(plan.assetValue)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">Prazo</td>
                                    {plans.map(plan => (
                                        <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${plan.termInMonths === bestValues.termInMonths ? 'bg-green-50 dark:bg-green-900/30' : ''}`}>
                                             <span className={plan.termInMonths === bestValues.termInMonths ? 'font-semibold text-green-700 dark:text-green-300' : ''}>
                                                {plan.termInMonths} meses
                                             </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">Parcela Mensal</td>
                                    {plans.map(plan => (
                                        <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${plan.monthlyInstallment === bestValues.monthlyInstallment ? 'bg-green-50 dark:bg-green-900/30' : ''}`}>
                                            <span className={plan.monthlyInstallment === bestValues.monthlyInstallment ? 'font-semibold text-green-700 dark:text-green-300' : ''}>
                                                {formatCurrency(plan.monthlyInstallment)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">Taxa Adm.</td>
                                    {plans.map(plan => (
                                        <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${plan.adminFee === bestValues.adminFee ? 'bg-green-50 dark:bg-green-900/30' : ''}`}>
                                             <span className={plan.adminFee === bestValues.adminFee ? 'font-semibold text-green-700 dark:text-green-300' : ''}>
                                                {formatPercent(plan.adminFee)}
                                             </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">Estatística Chave</td>
                                    {plans.map(plan => <td key={plan.planName} className="p-3 text-center italic text-cyan-700 dark:text-cyan-300">{plan.keyStat}</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const AdminFeeChart: React.FC<{ plans: RecommendedPlan[] }> = ({ plans }) => {
    const chartData = plans.map(p => ({
        name: p.planName.split(' ')[0], // Use a shorter name for the axis
        "Taxa Adm. (%)": parseFloat((p.adminFee * 100).toFixed(2)),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{`${label}`}</p>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400">{`Taxa: ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 250 }} className="mt-4">
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5, right: 20, left: -10, bottom: 5,
                    }}
                    barGap={10}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }}/>
                    <Bar dataKey="Taxa Adm. (%)" fill="#06b6d4" name="Taxa de Administração (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface DecisionPanelProps {
  userProfile: UserProfile;
  aiResponseText: string;
  recommendedPlans: RecommendedPlan[];
  customerProfileName: string;
  onRestart: () => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ userProfile, aiResponseText, recommendedPlans, customerProfileName, onRestart }) => {
  const [maxAssetValue, setMaxAssetValue] = useState('');
  const debouncedMaxAssetValue = useDebounce(maxAssetValue, 500);
  const [bidValue, setBidValue] = useState('');
  const [appliedBid, setAppliedBid] = useState<number | null>(null);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contractingPlan, setContractingPlan] = useState<RecommendedPlan | null>(null);

  const handleToggleCompare = (planName: string) => {
    setComparisonList(current => {
        const isSelected = current.includes(planName);
        if (isSelected) {
            return current.filter(name => name !== planName);
        } else {
            if (current.length < 3) {
                return [...current, planName];
            } else {
                alert("Você pode comparar no máximo 3 planos por vez.");
                return current;
            }
        }
    });
  };

  const handleInitiateContracting = (plan: RecommendedPlan) => {
     setContractingPlan(plan);
  };

  const handleApplyBid = (e: React.FormEvent) => {
    e.preventDefault();
    const numericBid = parseFloat(bidValue);
    if (!isNaN(numericBid) && numericBid > 0) {
      setAppliedBid(numericBid);
    } else {
      setAppliedBid(null);
      setBidValue('');
    }
  };
  
  const handlePredefinedBid = (percentage: number) => {
    if (recommendedPlans.length > 0) {
        const baseAssetValue = recommendedPlans[0].assetValue;
        const calculatedBid = baseAssetValue * percentage;
        const roundedBid = Math.round(calculatedBid);
        setBidValue(String(roundedBid));
        setAppliedBid(roundedBid);
    }
  };

  const handleClearBid = () => {
    setBidValue('');
    setAppliedBid(null);
  };

  const planCategories = useMemo(() => {
    return [...new Set(recommendedPlans.map(p => p.category))];
  }, [recommendedPlans]);

  const filteredPlans = useMemo(() => {
    const numericMaxAssetValue = parseFloat(debouncedMaxAssetValue);
    return recommendedPlans
        .filter(plan => !selectedCategory || plan.category === selectedCategory)
        .filter(plan => !numericMaxAssetValue || plan.assetValue <= numericMaxAssetValue);
  }, [recommendedPlans, selectedCategory, debouncedMaxAssetValue]);

  const plansForComparison = recommendedPlans.filter(p => comparisonList.includes(p.planName));

  const primaryPlan = filteredPlans.length > 0 ? filteredPlans[0] : null;

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Seu Painel de Decisão Estratégica</h2>
            <button 
              onClick={onRestart}
              className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
              aria-label="Montar nova estratégia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 2a9 9 0 11-2.926-6.621" />
              </svg>
              Montar Nova Estratégia
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Diagnóstico do Perfil</h3>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{customerProfileName}</p>
            </div>
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Análise do Consultor</h3>
                <p className="text-gray-700 dark:text-gray-300 italic">"{aiResponseText}"</p>
            </div>
        </div>

        {primaryPlan && <FinancialSummary plan={primaryPlan} />}

        {recommendedPlans.length > 1 && (
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm mb-8">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Comparativo Visual de Taxas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    A taxa de administração é o custo total do seu consórcio. Uma taxa menor significa mais economia no final do plano.
                </p>
                <AdminFeeChart plans={recommendedPlans} />
            </div>
        )}

        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm mb-8">
          <form onSubmit={handleApplyBid} className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 md:mb-0 md:mr-4">Simulador de Lance</h4>
            <div className="w-full md:w-auto">
                <label htmlFor="bid-simulator" className="sr-only">Valor do lance para simulação</label>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">R$</span>
                        <input
                            type="number"
                            id="bid-simulator"
                            value={bidValue}
                            onChange={(e) => setBidValue(e.target.value)}
                            placeholder="30000"
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            aria-label="Valor do lance para simulação"
                        />
                    </div>
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                        Aplicar
                    </button>
                    {appliedBid !== null && (
                        <button type="button" onClick={handleClearBid} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors" aria-label="Limpar simulação de lance">
                            Limpar
                        </button>
                    )}
                </div>
            </div>
          </form>
          {recommendedPlans.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Lances em Aberto (Sugestão Rápida)</h5>
                <div className="flex flex-wrap gap-2">
                    {[0.10, 0.20, 0.30].map(perc => (
                        <button 
                            key={perc}
                            type="button" 
                            onClick={() => handlePredefinedBid(perc)} 
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold py-1 px-3 rounded-full text-xs transition-colors"
                            aria-label={`Aplicar lance de ${perc * 100}%`}
                        >
                            {perc * 100}%
                        </button>
                    ))}
                </div>
             </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm mb-8">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtros da Estratégia</h4>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Categoria</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`font-semibold py-2 px-4 rounded-full text-sm transition-colors ${!selectedCategory ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            Todos
                        </button>
                        {planCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`font-semibold py-2 px-4 rounded-full text-sm transition-colors ${selectedCategory === cat ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex-1">
                     <label htmlFor="max-asset-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valor Máximo do Bem
                    </label>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">R$</span>
                        <input
                            type="number"
                            id="max-asset-value"
                            value={maxAssetValue}
                            onChange={(e) => setMaxAssetValue(e.target.value)}
                            placeholder="Ex: 150000"
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>

        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sua Estratégia Recomendada:</h3>

        {recommendedPlans.length > 1 && (
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setIsComparisonModalOpen(true)}
                    disabled={comparisonList.length < 2}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-md shadow-green-500/20 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                    Comparar Planos ({comparisonList.length})
                </button>
            </div>
        )}

        {filteredPlans.length > 0 ? (
          <div className="space-y-6">
            {filteredPlans.map((plan, index) => (
               <div key={index}>
                    <PlanCard 
                        plan={plan} 
                        appliedBid={appliedBid}
                        onToggleCompare={handleToggleCompare}
                        isSelectedForCompare={comparisonList.includes(plan.planName)}
                        showCompareToggle={recommendedPlans.length > 1}
                    />
                    <div className="mt-4 flex justify-end">
                        {plan.provider === 'Porto Seguro' ? (
                            <button 
                                onClick={() => handleInitiateContracting(plan)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Contratar com Porto Seguro
                            </button>
                        ) : (
                            <a 
                                href="https://www.mapfre.com.br/consorcios/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/20 flex items-center gap-2"
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                Ver no site Mapfre
                            </a>
                        )}
                    </div>
               </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p>Não foi possível encontrar um plano que se encaixe perfeitamente em sua estratégia com o filtro aplicado. Tente um valor maior ou limpe o filtro.</p>
          </div>
        )}
      </div>

       {isComparisonModalOpen && (
            <ComparisonModal
                plans={plansForComparison}
                onClose={() => setIsComparisonModalOpen(false)}
            />
        )}
        {contractingPlan && (
            <ContractingModal
                plan={contractingPlan}
                userProfile={userProfile}
                onClose={() => setContractingPlan(null)}
                onSubmit={submitConsorcioApplication}
            />
        )}
    </div>
  );
};