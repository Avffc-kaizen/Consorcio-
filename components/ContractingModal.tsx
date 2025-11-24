
import React, { useState } from 'react';
import type { RecommendedPlan } from '../services/geminiService';
import type { UserProfile } from '../types';
import { trackMetaEvent } from '../services/metaService';

interface ContractingModalProps {
    plan: RecommendedPlan;
    userProfile: UserProfile;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmit: (userProfile: UserProfile, plan: any) => Promise<any>; // Kept for signature compatibility but unused in new flow
    onSuccess: (contactInfo: { name: string; email: string; phone: string }) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const ContractingModal: React.FC<ContractingModalProps> = ({ plan, userProfile, onClose, onSuccess }) => {
    const [name, setName] = useState(userProfile.contact?.name || '');
    const [email, setEmail] = useState(userProfile.contact?.email || '');
    const [phone, setPhone] = useState(userProfile.contact?.phone || '');

    const handleWhatsAppRedirect = () => {
        if (!name || !phone || !email) {
            alert("Por favor, preencha todos os dados de contato.");
            return;
        }

        const phoneNumber = '5561999949724'; 
        const message = `Olá! Realizei uma simulação na plataforma EAP e gostaria de contratar o consórcio:
        
*Plano:* ${plan.planName} (${plan.provider})
*Crédito:* ${formatCurrency(plan.assetValue)}
*Parcela:* ${formatCurrency(plan.monthlyInstallment)}
*Prazo:* ${plan.termInMonths} meses

*Meus Dados:*
Nome: ${name}
Email: ${email}
WhatsApp: ${phone}

Gostaria de saber os próximos passos para adesão e confirmar a disponibilidade deste grupo.`;

        // Meta Event: Purchase or Lead
        trackMetaEvent('Contact', 
            { email: email, phone: phone, name: name },
            { content_name: 'Contracting WhatsApp Redirect', value: plan.assetValue, currency: 'BRL', status: 'initiated' }
        );

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        
        // Capture data and close modal after redirect
        onSuccess({ name, email, phone });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contracting-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white text-center relative">
                     <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Reserva de Cota</h3>
                    <p className="text-green-50 opacity-90 text-sm mt-1">Garanta as condições exclusivas deste grupo.</p>
                </div>

                <div className="p-6 space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Plano Selecionado</span>
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">{plan.provider}</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">{plan.planName}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                             <div>
                                <span className="text-gray-500 block text-xs">Crédito</span>
                                <span className="font-bold">{formatCurrency(plan.assetValue)}</span>
                             </div>
                             <div>
                                <span className="text-gray-500 block text-xs">Parcela</span>
                                <span className="font-bold">{formatCurrency(plan.monthlyInstallment)}</span>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Nome Completo</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Seu Nome" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none pl-10 transition-all"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">E-mail</label>
                             <div className="relative">
                                 <input 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none pl-10 transition-all"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">WhatsApp</label>
                             <div className="relative">
                                <input 
                                    type="tel" 
                                    placeholder="(DD) 9..." 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none pl-10 transition-all"
                                />
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleWhatsAppRedirect}
                        disabled={!name || !phone || !email}
                        className="w-full group relative flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-green-600/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finalizar no WhatsApp
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
