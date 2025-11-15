import React, { useState, useRef, useEffect } from 'react';
import type { Message, DiagnosticStep } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onUserResponse: (response: { text?: string; payload?: any }) => void;
  isLoading: boolean;
  diagnosticStep: DiagnosticStep;
}

const MessageBox: React.FC<{ message: Message, onOptionClick: (option: any) => void, isLoading: boolean }> = ({ message, onOptionClick, isLoading }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
      <div
        className={`max-w-md md:max-w-lg p-3 rounded-2xl ${
          isUser
            ? 'bg-cyan-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      {message.options && (
        <div className="flex flex-wrap gap-2 pt-2">
          {message.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionClick(option)}
              disabled={isLoading}
              className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold py-2 px-4 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ContactForm: React.FC<{ onUserResponse: (response: { payload: any }) => void, isLoading: boolean }> = ({ onUserResponse, isLoading }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && phone && agreed) {
            onUserResponse({ payload: { name, email, phone } });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg space-y-3">
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu Nome" required autoComplete="name" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-sm" />
             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu Melhor E-mail" required autoComplete="email" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-sm" />
             <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Seu WhatsApp" required autoComplete="tel" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-sm" />
             <div className="flex items-start space-x-2">
                <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                    Eu concordo em compartilhar meus dados com a Conseg Seguro e seus parceiros (Porto Seguro, Mapfre) para receber uma proposta de consórcio, conforme a nossa Política de Privacidade.
                </label>
             </div>
             <button type="submit" disabled={isLoading || !agreed} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                Desbloquear meu Plano
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

  const handleOptionClick = (option: { text: string; payload: any }) => {
    if (!isLoading) {
      onUserResponse({ text: option.text, payload: option.payload });
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl flex flex-col h-[75vh] border border-gray-200 dark:border-gray-700">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBox key={msg.id} message={msg} onOptionClick={handleOptionClick} isLoading={isLoading} />
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {diagnosticStep === 'investment' && (
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="number"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite o valor mensal (ex: 1500)"
              className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
        {diagnosticStep === 'contact' && !isLoading && (
            <ContactForm onUserResponse={onUserResponse} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};