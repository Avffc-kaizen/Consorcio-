
import React, { useState, useEffect, useMemo } from 'react';
import type { ConsorcioPlan, UserProfile } from '../types';
import { PlanCard } from './PlanCard';
import { RecommendedPlan } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { submitConsorcioApplication } from '../services/portoSeguroApi';
import { ContractingModal } from './ContractingModal';
import { ScenarioSimulator } from './ScenarioSimulator';

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

interface FinancialSummaryProps {
  plan: RecommendedPlan;
  financingInterestRate: number;
  onInterestRateChange: (rate: number) => void;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ plan, financingInterestRate, onInterestRateChange }) => {
    if (!plan) return null;

    const totalAdminCost = plan.assetValue * plan.adminFee;
    const totalPaid = plan.assetValue + totalAdminCost;
    
    // Simulação de financiamento (simplificada)
    const annualInterestRate = financingInterestRate / 100;
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1/12) - 1;
    const n = plan.termInMonths;
    const L = plan.assetValue;
    
    // Fórmula da parcela de financiamento (Tabela Price)
    const financingMonthlyPayment = isFinite(monthlyInterestRate) && monthlyInterestRate > 0 
        ? L * ( (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) / (Math.pow(1 + monthlyInterestRate, n) - 1) )
        : L / n;
    const totalFinancingPaid = financingMonthlyPayment * n;
    const savings = totalFinancingPaid - totalPaid;

    return (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 md:p-6 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col gap-1 mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    Eficiência do Projeto
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Comparativo vs. Financiamento Tradicional</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2 bg-green-50 dark:bg-green-900/40 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">Economia Projetada</p>
                       <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-green-100 dark:border-green-800">
                            <label htmlFor="interest-rate" className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">Juros Mercado:</label>
                            <div className="relative">
                                <input
                                    id="interest-rate"
                                    type="number"
                                    value={financingInterestRate}
                                     onChange={(e) => {
                                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        if (!isNaN(value)) {
                                            onInterestRateChange(value);
                                        }
                                    }}
                                    className="w-8 bg-transparent border-none p-0 text-xs text-right font-bold text-gray-800 dark:text-gray-200 focus:ring-0"
                                />
                                 <span className="absolute -right-2 top-0 text-[10px] text-gray-500 pointer-events-none">%</span>
                            </div>
                       </div>
                    </div>
                    <p className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400 tracking-tighter">{formatCurrency(savings)}</p>
                    <p className="text-[10px] text-green-800/70 dark:text-green-300/70 mt-1">Capital preservado para novos investimentos.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custo Total (Taxa)</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalAdminCost)}</p>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Pago</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalPaid)}</p>
                </div>
            </div>
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

    const bestValues = {
        assetValue: Math.max(...plans.map(p => p.assetValue)),
        termInMonths: Math.min(...plans.map(p => p.termInMonths)),
        monthlyInstallment: Math.min(...plans.map(p => p.monthlyInstallment)),
        adminFee: Math.min(...plans.map(p => p.adminFee)),
    };

    const StarIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="comparison-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="comparison-title" className="text-xl font-bold text-gray-900 dark:text-white">Comparativo de Planos</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Fechar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="overflow-y-auto p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Característica</th>
                                    {plans.map(plan => (
                                        <th key={plan.planName} className="p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 text-center align-top">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg">{plan.planName}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded mt-1 ${plan.provider === 'Porto Seguro' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{plan.provider}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Valor do Crédito</td>
                                    {plans.map(plan => {
                                        const isBest = plan.assetValue === bestValues.assetValue;
                                        return (
                                            <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${isBest ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-300 dark:ring-green-600' : ''}`}>
                                                <span className={`font-bold text-lg inline-flex items-center justify-center gap-1.5 ${isBest ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                                    {formatCurrency(plan.assetValue)}
                                                    {isBest && <StarIcon />}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Prazo</td>
                                     {plans.map(plan => {
                                        const isBest = plan.termInMonths === bestValues.termInMonths;
                                        return (
                                            <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${isBest ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-300 dark:ring-green-600' : ''}`}>
                                                <span className={`font-bold inline-flex items-center justify-center gap-1.5 ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {plan.termInMonths} meses
                                                    {isBest && <StarIcon />}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Parcela Mensal</td>
                                    {plans.map(plan => {
                                        const isBest = plan.monthlyInstallment === bestValues.monthlyInstallment;
                                        return (
                                            <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${isBest ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-300 dark:ring-green-600' : ''}`}>
                                                <span className={`font-bold inline-flex items-center justify-center gap-1.5 ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {formatCurrency(plan.monthlyInstallment)}
                                                    {isBest && <StarIcon />}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Taxa Adm.</td>
                                    {plans.map(plan => {
                                        const isBest = plan.adminFee === bestValues.adminFee;
                                        return (
                                            <td key={plan.planName} className={`p-3 text-center transition-colors duration-300 ${isBest ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-300 dark:ring-green-600' : ''}`}>
                                                <span className={`font-bold inline-flex items-center justify-center gap-1.5 ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {formatPercent(plan.adminFee)}
                                                    {isBest && <StarIcon />}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Estatística Chave</td>
                                    {plans.map(plan => <td key={plan.planName} className="p-3 text-center italic text-cyan-700 dark:text-cyan-300 text-sm">{plan.keyStat}</td>)}
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
  onContractingSuccess: (plan: RecommendedPlan) => void;
}


const BRIEFING_STEP_DELAY = 800;

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ userProfile, aiResponseText, recommendedPlans, customerProfileName, onRestart, onContractingSuccess }) => {
    const [bidAmount, setBidAmount] = useState<number | null>(null);
    const debouncedBidAmount = useDebounce(bidAmount, 500);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [contractingPlan, setContractingPlan] = useState<RecommendedPlan | null>(null);
    const [financingInterestRate, setFinancingInterestRate] = useState<number>(18);
    
    // State for the briefing animation
    const briefingSteps = useMemo(() => [
        `Analisando perfil: ${customerProfileName}`,
        'Arquitetando estratégia financeira...',
        'Selecionando melhores materiais (Grupos)...',
        'Projetando cenários de alavancagem...',
        'Blueprint do projeto concluído!',
    ], [customerProfileName]);
    
    const [currentBriefingStep, setCurrentBriefingStep] = useState(0);

    useEffect(() => {
        if (currentBriefingStep < briefingSteps.length) {
            const timer = setTimeout(() => {
                setCurrentBriefingStep(prev => prev + 1);
            }, BRIEFING_STEP_DELAY);
            return () => clearTimeout(timer);
        }
    }, [currentBriefingStep, briefingSteps.length]);

    const isBriefingComplete = currentBriefingStep >= briefingSteps.length;


    const handleToggleCompare = (planName: string) => {
        setSelectedForCompare(prev => {
            if (prev.includes(planName)) {
                return prev.filter(p => p !== planName);
            } else {
                if (prev.length < 3) {
                    return [...prev, planName];
                }
                return prev;
            }
        });
    };

    const isCompareLimitReached = selectedForCompare.length >= 3;

    const plansForComparison = useMemo(() => {
        return recommendedPlans.filter(p => selectedForCompare.includes(p.planName));
    }, [selectedForCompare, recommendedPlans]);

    const handleContractingSubmit = async (profile: UserProfile, plan: ConsorcioPlan) => {
        return await submitConsorcioApplication(profile, plan);
    };

    if (!isBriefingComplete) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-[calc(100vh-120px)]">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Arquitetando seu Projeto...</h2>
                <div className="w-full max-w-md space-y-3">
                    {briefingSteps.map((step, index) =>
                        currentBriefingStep > index ? (
                            <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-left">{step}</span>
                            </div>
                        ) : null
                    )}
                    {currentBriefingStep < briefingSteps.length && (
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm animate-pulse">
                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                               <svg className="animate-spin h-4 w-4 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <span className="font-medium text-gray-500 dark:text-gray-400 text-left">{briefingSteps[currentBriefingStep]}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-1000 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Architect Blueprint Header */}
                <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg text-cyan-700 dark:text-cyan-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">{customerProfileName}</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blueprint do Projeto</h2>
                        </div>
                    </div>
                    <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic border-l-4 border-cyan-500 pl-4">
                        "{aiResponseText}"
                    </blockquote>
                </div>

                {recommendedPlans.length > 0 && 
                    <FinancialSummary 
                        plan={recommendedPlans[0]} 
                        financingInterestRate={financingInterestRate}
                        onInterestRateChange={setFinancingInterestRate}
                    />
                }

                {recommendedPlans.length > 0 && (
                     <ScenarioSimulator 
                        initialCategory={recommendedPlans[0].category}
                        initialValue={recommendedPlans[0].assetValue}
                        initialInstallment={recommendedPlans[0].monthlyInstallment}
                     />
                )}

                {recommendedPlans.length > 1 && (
                    <div className="mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                             Acelerador de Contemplação
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            Simule um lance (entrada) para ver o impacto na parcela de todas as opções abaixo.
                        </p>
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 font-bold">R$</span>
                             <input
                                type="number"
                                placeholder="Valor do Lance (Ex: 20.000)"
                                value={bidAmount || ''}
                                onChange={(e) => setBidAmount(e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:ring-cyan-500 focus:border-cyan-500 transition-colors font-semibold text-lg"
                            />
                        </div>
                    </div>
                )}

                <div className="mb-4 md:hidden text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        Deslize para comparar
                    </p>
                </div>

                {/* Grid Layout: Horizontal scroll on mobile, Grid on desktop */}
                <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
                    {recommendedPlans.map((plan, index) => {
                        // Highlight the first plan as "Recommended"
                        const isBestChoice = index === 0; 
                        return (
                             <div key={plan.planName} className="min-w-[90%] md:min-w-0 snap-center">
                                 <PlanCard
                                    plan={plan}
                                    isBestChoice={isBestChoice}
                                    appliedBid={debouncedBidAmount}
                                    onToggleCompare={handleToggleCompare}
                                    isSelectedForCompare={selectedForCompare.includes(plan.planName)}
                                    showCompareToggle={recommendedPlans.length > 1}
                                    compareDisabled={isCompareLimitReached && !selectedForCompare.includes(plan.planName)}
                                    onContract={() => setContractingPlan(plan)}
                                />
                             </div>
                        );
                    })}
                </div>
                
                {recommendedPlans.length > 1 && (
                     <div className="mt-8 hidden md:block">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Análise Técnica: Taxas</h4>
                        <AdminFeeChart plans={recommendedPlans} />
                    </div>
                )}

                <div className="text-center mt-12 pb-10">
                    <button
                        onClick={onRestart}
                        className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border-b border-transparent hover:border-cyan-600"
                    >
                        Descartar e Iniciar Novo Projeto
                    </button>
                </div>

                {selectedForCompare.length > 1 && (
                    <div className="fixed bottom-5 right-5 z-20 animate-in slide-in-from-bottom duration-300 hidden md:block">
                        <button
                            onClick={() => setIsComparisonModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                            Comparar ({selectedForCompare.length})
                        </button>
                    </div>
                )}

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
                        onSubmit={handleContractingSubmit}
                        onSuccess={() => onContractingSuccess(contractingPlan)}
                    />
                )}
            </div>
        </div>
    );
};
