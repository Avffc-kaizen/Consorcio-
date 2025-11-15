import React, { useState, useEffect } from 'react';
import type { RecommendedPlan } from '../services/geminiService';
import type { UserProfile, ConsorcioPlan } from '../types';

interface ContractingModalProps {
    plan: RecommendedPlan;
    userProfile: UserProfile;
    onClose: () => void;
    onSubmit: (userProfile: UserProfile, plan: ConsorcioPlan) => Promise<{ success: boolean; proposalId: string }>;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const ContractingModal: React.FC<ContractingModalProps> = ({ plan, userProfile, onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{ success: boolean; proposalId: string } | null>(null);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [dataConfirmed, setDataConfirmed] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async () => {
        if (!termsAgreed || !dataConfirmed) {
            alert('Por favor, confirme seus dados e aceite os termos para continuar.');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await onSubmit(userProfile, plan);
            setSubmissionResult(result);
        } catch (error) {
            console.error("Submission failed", error);
            setSubmissionResult({ success: false, proposalId: 'ERROR' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const canSubmit = termsAgreed && dataConfirmed && !isSubmitting;

    const renderContent = () => {
        if (isSubmitting) {
            return (
                <div className="text-center p-10">
                    <svg className="animate-spin mx-auto h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold">Enviando sua Proposta</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Aguarde um momento, estamos conectando com os sistemas da Porto Seguro...</p>
                </div>
            );
        }

        if (submissionResult?.success) {
            return (
                <div className="text-center p-10">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="mt-4 text-2xl font-bold text-green-600 dark:text-green-400">Proposta Enviada com Sucesso!</h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">Sua proposta para o plano <strong>{plan.planName}</strong> foi registrada.</p>
                    <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Número da Proposta:</p>
                        <p className="text-lg font-mono font-semibold text-gray-800 dark:text-gray-200">{submissionResult.proposalId}</p>
                    </div>
                     <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Um consultor da Porto Seguro entrará em contato em breve para os próximos passos. A proposta formal será enviada para o seu e-mail: <strong>{userProfile.contact?.email}</strong>.</p>
                </div>
            );
        }

        if (submissionResult && !submissionResult.success) {
             return (
                <div className="text-center p-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <h3 className="mt-4 text-2xl font-bold text-red-600 dark:text-red-400">Ocorreu um Erro</h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">Não foi possível processar sua proposta no momento. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte.</p>
                </div>
             );
        }
        
        // Initial form view
        return (
            <>
            <main className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. Resumo do Plano Estratégico</h3>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Plano</p>
                            <p className="font-semibold">{plan.planName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Provedor</p>
                            <p className="font-semibold">{plan.provider}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Crédito</p>
                            <p className="font-bold text-cyan-600 dark:text-cyan-400 text-lg">{formatCurrency(plan.assetValue)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Parcela Mensal</p>
                            <p className="font-semibold">{formatCurrency(plan.monthlyInstallment)}</p>
                        </div>
                    </div>
                </div>

                <div>
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">2. Confirmação dos Dados</h3>
                     <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                         <p><strong>Nome:</strong> {userProfile.contact?.name}</p>
                         <p><strong>E-mail:</strong> {userProfile.contact?.email}</p>
                         <p><strong>Telefone:</strong> {userProfile.contact?.phone}</p>
                         <div className="pt-2">
                             <label htmlFor="data-confirm" className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" id="data-confirm" checked={dataConfirmed} onChange={(e) => setDataConfirmed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Confirmo que os dados acima estão corretos.</span>
                             </label>
                         </div>
                     </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">3. Termos e Condições</h3>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="max-h-24 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 pr-2 space-y-2">
                            <p>Ao clicar em "Finalizar Contratação", você concorda em enviar seus dados para a Porto Seguro Consórcio para a formalização de uma proposta de adesão ao grupo de consórcio referente ao plano selecionado.</p>
                            <p>Esta ação não garante a contemplação imediata. A Porto Seguro analisará sua proposta e, se aprovada, você será incluído no próximo grupo a ser formado. Todas as regras de contemplação, lance e reajustes estão descritas no contrato de adesão que será enviado para seu e-mail.</p>
                        </div>
                        <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-600">
                             <label htmlFor="terms-agree" className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" id="terms-agree" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Li e concordo com os termos da proposta.</span>
                             </label>
                        </div>
                    </div>
                </div>

            </main>
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contracting-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="contracting-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                        {submissionResult?.success ? 'Contratação Finalizada' : 'Painel de Contratação Porto Seguro'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Fechar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                {renderContent()}
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-md transition-colors">
                        {submissionResult ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!submissionResult && (
                        <button onClick={handleSubmit} disabled={!canSubmit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Finalizar Contratação
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};