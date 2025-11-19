

import React, { useState, useMemo, useEffect } from 'react';
import type { PortfolioPlan, AiPricingAnalysisResponse } from '../types';
import { getAiPricingAnalysis } from '../services/geminiService';

interface CreateListingModalProps {
    plan: PortfolioPlan;
    onClose: () => void;
    onCreateListing: (planName: string, provider: string, askingPrice: number) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
        <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Analisando o Mercado...</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Nossa IA está calculando o valor justo (ágio) para sua cota.</p>
    </div>
);

export const CreateListingModal: React.FC<CreateListingModalProps> = ({ plan, onClose, onCreateListing }) => {
    const [askingPrice, setAskingPrice] = useState<number>(0);
    const [analysis, setAnalysis] = useState<AiPricingAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoading(true);
            const result = await getAiPricingAnalysis(plan);
            setAnalysis(result);
            setAskingPrice(result.suggestedPrice);
            setIsLoading(false);
        };
        fetchAnalysis();
    }, [plan]);

    const { profit, profitPercentage } = useMemo(() => {
        const profitValue = askingPrice - plan.paidAmount;
        const profitPercentageValue = plan.paidAmount > 0 ? profitValue / plan.paidAmount : 0;
        return { profit: profitValue, profitPercentage: profitPercentageValue };
    }, [askingPrice, plan.paidAmount]);

    const handleSubmit = () => {
        if (askingPrice > plan.paidAmount) {
            onCreateListing(plan.planName, plan.provider, askingPrice);
        }
    };
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAskingPrice(Number(e.target.value));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Painel de Venda Estratégica</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="p-6 space-y-6 overflow-y-auto">
                    {isLoading ? <LoadingState /> : analysis && (
                        <>
                             <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Análise de Precificação (IA)</h3>
                                 <blockquote className="mt-2 text-gray-700 dark:text-gray-300 italic bg-cyan-50 dark:bg-cyan-900/50 p-4 rounded-md border-l-4 border-cyan-500">
                                    "{analysis.justification}"
                                </blockquote>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Defina seu Preço</h3>
                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajuste o valor com base na sua estratégia: venda rápida ou lucro máximo.</p>
                                     <div className="mt-4">
                                         <input
                                            type="range"
                                            min={analysis.priceRangeMin}
                                            max={analysis.priceRangeMax}
                                            value={askingPrice}
                                            onChange={handleSliderChange}
                                            step="50"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{formatCurrency(analysis.priceRangeMin)}</span>
                                            <span>{formatCurrency(analysis.priceRangeMax)}</span>
                                        </div>
                                     </div>
                                      <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Preço Escolhido</p>
                                        <p className="text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">{formatCurrency(askingPrice)}</p>
                                      </div>
                                </div>
                                
                                <div>
                                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Análise de Lucro</h3>
                                     <div className="mt-4 space-y-3">
                                         <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <span className="text-sm font-medium">Valor Pago na Cota</span>
                                            <span className="font-semibold">{formatCurrency(plan.paidAmount)}</span>
                                         </div>
                                         <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/50 rounded-md">
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Lucro (Ágio)</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(profit)}</span>
                                         </div>
                                         <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/50 rounded-md">
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Rentabilidade sobre o Valor Pago</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">{formatPercent(profitPercentage)}</span>
                                         </div>
                                     </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Orquestração da Confiança</h3>
                                <div className="mt-2 flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex-shrink-0 text-cyan-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M10 2a5 5 0 00-5 5v1h10V7a5 5 0 00-5-5zM9 13a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm6 1a1 1 0 100-2 1 1 0 000 2zM4 13a1 1 0 100-2 1 1 0 000 2z" />
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-1 1v1a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                         <h4 className="font-semibold text-gray-800 dark:text-gray-200">Processo de Venda 100% Gerenciado</h4>
                                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ao anunciar, nossa plataforma gerencia todo o processo de transferência para você: validamos o comprador (KYC), preparamos o contrato de cessão e orquestramos a anuência junto à administradora. Você vende com segurança e sem burocracia.</p>
                                    </div>
                                </div>
                            </div>

                        </>
                    )}
                </main>
                
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || askingPrice <= plan.paidAmount}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analisando...' : 'Anunciar no Marketplace'}
                    </button>
                </footer>
            </div>
        </div>
    );
};