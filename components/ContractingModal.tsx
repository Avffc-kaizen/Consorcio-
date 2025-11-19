
import React from 'react';
import type { RecommendedPlan } from '../services/geminiService';
import type { UserProfile } from '../types';

interface ContractingModalProps {
    plan: RecommendedPlan;
    userProfile: UserProfile;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmit: (userProfile: UserProfile, plan: any) => Promise<any>; // Kept for signature compatibility but unused in new flow
    onSuccess: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const ContractingModal: React.FC<ContractingModalProps> = ({ plan, userProfile, onClose, onSuccess }) => {

    const handleWhatsAppRedirect = () => {
        const phoneNumber = '5561999949724'; // Updated requested number
        const message = `Olá! Realizei uma simulação na plataforma EAP e gostaria de contratar o consórcio:
        
*Plano:* ${plan.planName} (${plan.provider})
*Crédito:* ${formatCurrency(plan.assetValue)}
*Parcela:* ${formatCurrency(plan.monthlyInstallment)}
*Prazo:* ${plan.termInMonths} meses

*Meus Dados:*
Nome: ${userProfile.contact?.name}
Email: ${userProfile.contact?.email}

Gostaria de saber os próximos passos para adesão e confirmar a disponibilidade deste grupo.`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        
        // Close modal after redirect
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contracting-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Plano Reservado!</h3>
                    <p className="text-green-50 opacity-90 text-sm mt-1">Próximo passo: Validação de disponibilidade</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            Para garantir as condições especiais do plano <strong>{plan.planName}</strong> e a taxa de administração de <strong>{plan.adminFee > 1 ? plan.adminFee : plan.adminFee * 100}%</strong>, finalize sua adesão diretamente com nossa mesa de negócios.
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Crédito</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(plan.assetValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Parcela Mensal</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(plan.monthlyInstallment)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Provedor</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{plan.provider}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleWhatsAppRedirect}
                        className="w-full group relative flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-green-600/30 hover:-translate-y-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        Finalizar no WhatsApp
                    </button>

                    <div className="text-center">
                        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">
                            Voltar e escolher outro plano
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
