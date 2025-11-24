
import React, { useState, useEffect, useRef } from 'react';
import type { RecommendedPlan } from '../services/geminiService';
import type { UserProfile } from '../types';
import { trackMetaEvent } from '../services/metaService';
import { resolveObjectionWithAI } from '../services/geminiService';

interface FloatingAssistantProps {
    bestPlan?: RecommendedPlan;
    userProfile: UserProfile;
    isVisible: boolean;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ bestPlan, userProfile, isVisible }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [aiMessage, setAiMessage] = useState<string>('');
    const [userObjection, setUserObjection] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Stages: 'intro' (Buttons) -> 'conversation' (Input) -> 'closing' (WhatsApp)
    const [interactionStage, setInteractionStage] = useState<'intro' | 'conversation' | 'closing'>('intro');
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-start analysis when opened manually or initially
    useEffect(() => {
        if (isOpen && interactionStage === 'intro' && bestPlan && !aiMessage) {
            setIsTyping(true);
            // Simulate AI typing initial hook
            setTimeout(() => {
                const initialHook = `Analisei estrategicamente mais de 1.400 grupos. O ${bestPlan.planName} da ${bestPlan.provider} é uma anomalia estatística a seu favor. Como deseja prosseguir?`;
                setAiMessage(initialHook);
                setIsTyping(false);
            }, 1200);
        }
    }, [isOpen, interactionStage, bestPlan, aiMessage]);

    if (!isVisible || !bestPlan) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

    const handleWhatsAppClick = () => {
        const phoneNumber = '5561999949724';
        const message = `Olá! Sou ${userProfile.contact?.name || 'Investidor'}.
        
*Dossiê de Aquisição Aprovado via IA:*

🎯 *Ativo Alvo:* ${bestPlan.planName}
💰 *Crédito:* ${formatCurrency(bestPlan.assetValue)}
📉 *Parcela:* ${formatCurrency(bestPlan.monthlyInstallment)}

O Consultor IA removeu minhas dúvidas. Quero reservar a cota.`;

        trackMetaEvent('Contact', 
            { email: userProfile.contact?.email, phone: userProfile.contact?.phone, name: userProfile.contact?.name },
            { content_name: 'Strategic Consultant WhatsApp', value: bestPlan.assetValue, currency: 'BRL' }
        );

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const handleObjectionSubmit = async (e?: React.FormEvent, explicitText?: string) => {
        if (e) e.preventDefault();
        
        const textToSend = explicitText || userObjection;
        if (!textToSend.trim()) return;

        // Flow Logic
        if (interactionStage === 'intro') {
            // 1st Step: User clicked button. AI generates answer + closing question.
            setUserObjection('');
            setInteractionStage('conversation'); // Now allow input
            setIsTyping(true);

            const response = await resolveObjectionWithAI(bestPlan, textToSend, userProfile);
            setAiMessage(response);
            setIsTyping(false);
            
            // Auto-focus input for user reply
            setTimeout(() => inputRef.current?.focus(), 100);
            
        } else if (interactionStage === 'conversation') {
            // 2nd Step: User answered closing question. Transition to WhatsApp.
            setUserObjection('');
            setIsTyping(true);
            setTimeout(() => {
                setInteractionStage('closing');
                setAiMessage("Perfeito. Vou priorizar seu atendimento agora. Clique abaixo para formalizar.");
                setIsTyping(false);
            }, 800);
        }
    };

    // Suggested quick replies based on context
    const suggestedOptions = [
        "Como funciona o lance?",
        "Posso usar FGTS?",
        "Qual a garantia?",
        "Quero reservar"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-10 duration-500 font-sans">
            
            {/* Consultant Panel */}
            {isOpen && (
                <div className="mb-4 mr-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 md:w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/5 flex flex-col">
                    
                    {/* Header - Neutral Branding */}
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3 text-white">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border border-white/10">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full animate-pulse"></span>
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight">Consultor Estratégico</p>
                                <p className="text-[10px] text-cyan-400 opacity-90 uppercase tracking-wider font-bold">Inteligência Artificial</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 min-h-[280px] max-h-[400px] flex flex-col relative overflow-y-auto">
                        {/* Decorative background */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 2px 2px, gray 1px, transparent 0)", backgroundSize: "20px 20px"}}></div>
                        
                        <div className="space-y-4 relative z-10 flex-grow">
                             {/* System Context */}
                             <div className="flex justify-center">
                                 <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-[10px] text-center text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide shadow-sm">
                                    Oportunidade: {bestPlan.provider}
                                 </div>
                             </div>

                             {/* AI Message Bubble */}
                             <div className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-white text-xs shadow-md font-bold">IA</div>
                                <div className="bg-white dark:bg-gray-700 p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                    {isTyping ? (
                                        <div className="flex gap-1 h-5 items-center px-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span></div>
                                    ) : (
                                        aiMessage || "Carregando análise..."
                                    )}
                                </div>
                             </div>

                             {/* Suggested Options (ONLY on initial interaction) */}
                             {!isTyping && interactionStage === 'intro' && (
                                <div className="flex flex-wrap justify-end gap-2 animate-in slide-in-from-right-4 duration-500">
                                    {suggestedOptions.map((opt, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => handleObjectionSubmit(undefined, opt)}
                                            className="bg-white hover:bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold py-2 px-3 rounded-full transition-colors shadow-sm"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                             )}

                             {/* Closing Action (WhatsApp) */}
                             {interactionStage === 'closing' && !isTyping && (
                                 <div className="flex gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white text-xs shadow-md font-bold">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl rounded-tl-none shadow-md border border-green-100 dark:border-green-800/50 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                        Esta oportunidade é única. Garanta sua posição agora para não perder as condições atuais.
                                    </div>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Input Area / Closing Button */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        {interactionStage === 'conversation' ? (
                             <form onSubmit={(e) => handleObjectionSubmit(e)} className="relative animate-in fade-in slide-in-from-bottom-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Digite sua resposta..."
                                    value={userObjection}
                                    onChange={(e) => setUserObjection(e.target.value)}
                                    disabled={isTyping}
                                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner"
                                />
                                <button 
                                    type="submit"
                                    disabled={!userObjection.trim() || isTyping}
                                    className="absolute right-1.5 top-1.5 p-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </form>
                        ) : interactionStage === 'closing' ? (
                            <div className="animate-in zoom-in duration-300">
                                <button 
                                    onClick={handleWhatsAppClick}
                                    className="group w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                    GARANTIR MINHA COTA
                                </button>
                            </div>
                        ) : (
                            // Intro stage - no input, just text
                            <p className="text-xs text-center text-gray-400 italic">Selecione uma opção acima para iniciar.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Main Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl shadow-black/30 transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
                >
                    {/* Notification Dot */}
                    <span className="absolute top-0 right-0 flex h-5 w-5 -mt-1 -mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold text-white items-center justify-center shadow-sm">1</span>
                    </span>

                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    
                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Consultor Online
                    </span>
                </button>
            )}
        </div>
    );
};
