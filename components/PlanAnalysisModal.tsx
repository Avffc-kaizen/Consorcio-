
import React, { useState } from 'react';
import type { PortfolioPlan } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ContemplationSimulator: React.FC<{ plan: PortfolioPlan }> = ({ plan }) => {
    const [bidAmount, setBidAmount] = useState<number | ''>('');
    const [simulationResult, setSimulationResult] = useState<{ chance: 'Baixa' | 'Média' | 'Alta'; justification: string } | null>(null);

    const handleSimulateBid = () => {
        if (!bidAmount || bidAmount <= 0) {
            setSimulationResult(null);
            return;
        }
        const bidPercentage = Number(bidAmount) / plan.assetValue;
        let chance: 'Baixa' | 'Média' | 'Alta';
        let justification: string;

        if (bidPercentage < 0.25) {
            chance = 'Baixa';
            justification = 'Lances abaixo de 25% raramente são contemplados neste tipo de grupo.';
        } else if (bidPercentage < 0.40) {
            chance = 'Média';
            justification = 'Este lance está na faixa histórica e tem boas chances em assembleias com menor concorrência.';
        } else {
            chance = 'Alta';
            justification = 'Um lance robusto como este tem uma probabilidade muito alta de contemplação na próxima assembleia.';
        }
        setSimulationResult({ chance, justification });
    };
    
    const chanceColorClasses = {
        'Alta': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50 border-green-500',
        'Média': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 border-yellow-500',
        'Baixa': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 border-red-500',
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Simulador de Contemplação</h4>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 text-sm">R$</span>
                    <input
                        type="number"
                        placeholder="Valor do Lance"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-8 pr-4 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <button
                    onClick={handleSimulateBid}
                    className="bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex-shrink-0"
                >
                    Analisar Chance
                </button>
            </div>
            {simulationResult && (
                <div className={`mt-3 p-3 rounded-lg border-l-4 ${chanceColorClasses[simulationResult.chance]}`}>
                    <p className="font-bold text-lg">Chance {simulationResult.chance}</p>
                    <p className="text-sm mt-1">{simulationResult.justification}</p>
                </div>
            )}
        </div>
    );
};


interface PlanAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: PortfolioPlan;
}

export const PlanAnalysisModal: React.FC<PlanAnalysisModalProps> = ({ isOpen, onClose, plan }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Análise Estratégica da Cota</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <p className="text-lg font-bold">{plan.planName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Crédito de {formatCurrency(plan.assetValue)}</p>
                    </div>
                    <ContemplationSimulator plan={plan} />
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};
