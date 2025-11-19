import React, { useState, useEffect } from 'react';
import type { MarketplaceListing, Proposal, OpenFinanceStatus, OrchestrationStatus } from '../types';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: MarketplaceListing;
    onSubmitProposal: (proposal: Proposal) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// New type for the multi-step flow
type OpenFinanceStep = 'initial' | 'select_bank' | 'analyzing' | 'complete';


const BankLogo: React.FC<{ name: string, color: string }> = ({ name, color }) => (
    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md ${color}`}>
        {name.substring(0, 2)}
    </div>
);

const banks = [
    { name: 'Itaú', color: 'bg-orange-500' },
    { name: 'Bradesco', color: 'bg-red-600' },
    { name: 'Nubank', color: 'bg-purple-600' },
    { name: 'Banco do Brasil', color: 'bg-blue-700' },
    { name: 'Santander', color: 'bg-red-500' },
    { name: 'Caixa', color: 'bg-blue-500' },
];

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, listing, onSubmitProposal }) => {
    // State to manage the new multi-step flow
    const [openFinanceStep, setOpenFinanceStep] = useState<OpenFinanceStep>('initial');
    const [selectedBank, setSelectedBank] = useState<{ name: string, color: string } | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed/reopened
            setOpenFinanceStep('initial');
            setSelectedBank(null);
        }
    }, [isOpen]);

    const handleBankSelect = (bank: { name: string, color: string }) => {
        setSelectedBank(bank);
        setOpenFinanceStep('analyzing'); // Go directly to analyzing after bank selection
        
        // Simulate analysis and completion
        setTimeout(() => {
            setOpenFinanceStep('complete');
            const newProposal: Proposal = {
                orchestrationStatus: 'dossie_concluido',
                openFinanceStatus: 'concluido',
                timestamp: new Date().toISOString(),
            };
            setTimeout(() => {
                onSubmitProposal(newProposal);
            }, 1800); // show success message before closing
        }, 2500);
    };

    const renderContent = () => {
        switch (openFinanceStep) {
            case 'select_bank':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">Conecte sua conta bancária</h3>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-1">Selecione seu banco para iniciar a conexão segura via Open Finance.</p>
                        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {banks.map(bank => (
                                <button key={bank.name} onClick={() => handleBankSelect(bank)} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                    <BankLogo name={bank.name} color={bank.color} />
                                    <span className="text-sm font-medium">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
                
            case 'analyzing':
            case 'complete':
                const isComplete = openFinanceStep === 'complete';

                const analyzingText = selectedBank 
                    ? `Conectando com ${selectedBank.name} e analisando seus dados...`
                    : 'Analisando seus dados...';
                
                const completeText = selectedBank
                    ? `Conexão com ${selectedBank.name} bem-sucedida! Dossiê Concluído!`
                    : 'Dossiê Concluído!';

                return (
                    <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
                        {isComplete ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg className="animate-spin h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        <h3 className="mt-4 text-xl font-semibold">{isComplete ? completeText : analyzingText}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                           {isComplete ? 'Seu dossiê está completo e pronto para ser enviado.' : 'Aguarde, estamos estabelecendo uma conexão segura e gerando seu dossiê de crédito.'}
                        </p>
                    </div>
                );

            case 'initial':
            default:
                return (
                    <main className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Resumo da Oferta</h3>
                            <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Plano</p>
                                    <p className="font-semibold">{listing.plan.planName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Crédito Total</p>
                                    <p className="font-semibold">{formatCurrency(listing.plan.assetValue)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor da Proposta</p>
                                    <p className="font-bold text-cyan-600 dark:text-cyan-400 text-2xl">{formatCurrency(listing.askingPrice)}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Escolha como enviar sua proposta:</h3>
                            <div className="mt-4 space-y-4">
                                <button
                                    onClick={() => setOpenFinanceStep('select_bank')}
                                    className="w-full text-left p-4 rounded-lg border-2 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
                                >
                                    <h4 className="font-bold text-cyan-700 dark:text-cyan-300">Criar Dossiê via Open Finance (Recomendado)</h4>
                                    <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">Acelere a aprovação da sua proposta. Conecte seus dados bancários com segurança e reduza o tempo de análise da administradora de semanas para dias.</p>
                                </button>
                                <button
                                    onClick={() => alert("Função de proposta padrão em desenvolvimento.")}
                                    className="w-full text-left p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Proposta Padrão</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sua proposta será enviada e passará pela análise de crédito tradicional da administradora, o que pode levar mais tempo.</p>
                                </button>
                            </div>
                        </div>
                    </main>
                );
        }
    };
    
    const renderFooter = () => {
        switch (openFinanceStep) {
            case 'initial':
                return (
                    <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-md transition-colors">
                            Cancelar
                        </button>
                    </footer>
                );
            case 'select_bank':
            case 'analyzing':
            case 'complete':
            default:
                return null; // No footer for these steps
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Painel de Proposta</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {renderContent()}
                {renderFooter()}
            </div>
        </div>
    );
};