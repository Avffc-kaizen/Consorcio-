
import React, { useState, useRef, useEffect } from 'react';
import type { Message, DiagnosticStep } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onUserResponse: (response: { text?: string; payload?: any }) => void;
  isLoading: boolean;
  diagnosticStep: DiagnosticStep;
}

const MessageBox: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    // Minimalist avatars for cleaner look
    const AiAvatar = () => (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
        </div>
    );

    return (
        <div className={`flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && <AiAvatar />}
            <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                    isUser
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600'
                }`}
            >
                {message.text}
            </div>
        </div>
    );
};

const ContactForm: React.FC<{ onUserResponse: (response: { payload: any }) => void, isLoading: boolean }> = ({ onUserResponse, isLoading }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [referralSource, setReferralSource] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && phone && referralSource && agreed) {
            onUserResponse({ payload: { name, email, phone, referralSource } });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4 w-full max-w-md mx-auto animate-in zoom-in-95 duration-300">
             <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dados do Arquiteto</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Para liberar o blueprint do seu projeto.</p>
             </div>
             
             <div className="space-y-3">
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Completo" required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp (DD) 99999-9999" required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <select id="referral" value={referralSource} onChange={(e) => setReferralSource(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                    <option value="" disabled>Como nos conheceu?</option>
                    <option value="Google">Google / Pesquisa</option>
                    <option value="Instagram">Instagram / Facebook</option>
                    <option value="Linkedin">LinkedIn</option>
                    <option value="Indication">Indicação</option>
                </select>
             </div>

             <div className="flex items-start space-x-3 pt-1">
                <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400">Concordo em receber o projeto personalizado.</label>
             </div>
             
             <button type="submit" disabled={isLoading || !agreed || !referralSource} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm uppercase tracking-wide">
                {isLoading ? 'Gerando Projeto...' : 'Ver Meu Blueprint'}
             </button>
        </form>
    );
};


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onUserResponse, isLoading, diagnosticStep }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onUserResponse({ text: inputText });
      setInputText('');
    }
  };

  const quickReplies: Partial<Record<DiagnosticStep, { text: string; payload: any }[]>> = {
    category: [
      { text: '🚗 Automóvel', payload: 'Automóvel' },
      { text: '🏠 Imóvel', payload: 'Imóvel' },
      { text: '🎓 Serviços', payload: 'Serviços' },
    ],
    priority: [
      { text: '⚡ Velocidade (Lance)', payload: 'Velocidade' },
      { text: '💰 Menor Custo (Taxa)', payload: 'Economia' },
      { text: '🏗️ Alavancagem', payload: 'Alavancagem' },
    ],
  };

  const currentReplies = quickReplies[diagnosticStep] || [];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[650px] bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
      
      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-2 custom-scrollbar">
        {messages.map((msg) => (
          <MessageBox key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center h-10">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
            </div>
        )}
        {diagnosticStep === 'contact' && !isLoading && (
             <ContactForm onUserResponse={onUserResponse} isLoading={isLoading} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Quick Replies */}
        {currentReplies.length > 0 && !isLoading && (
          <div className="flex flex-wrap justify-center gap-2 mb-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {currentReplies.map((option, index) => (
              <button
                key={index}
                onClick={() => !isLoading && onUserResponse({ text: option.text, payload: option.payload })}
                className="bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-800 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/50 font-semibold py-2.5 px-5 rounded-full text-sm transition-all transform hover:scale-105 shadow-sm"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* Text Input (Only show if needed, e.g., for investment amount) */}
        {diagnosticStep === 'investment' && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="number"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Valor Mensal (R$)"
              className="flex-grow bg-gray-100 dark:bg-gray-700 border-0 rounded-full py-3 px-5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
