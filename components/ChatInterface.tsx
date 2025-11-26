
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
    
    const AiAvatar = () => (
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-sm border border-slate-800">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
        </div>
    );

    return (
        <div className={`flex gap-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
            {!isUser && <AiAvatar />}
            <div
                className={`max-w-[85%] px-6 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed border ${
                    isUser
                        ? 'bg-slate-800 text-white rounded-br-none font-medium border-slate-800'
                        : 'bg-white text-slate-700 rounded-tl-none border-slate-100'
                }`}
            >
                <div className="whitespace-pre-wrap">{message.text}</div>
            </div>
        </div>
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

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const messageOptions = (lastMessage?.sender === 'ai' && lastMessage.options) ? lastMessage.options : [];
  
  const currentReplies = messageOptions.length > 0 ? messageOptions : [];

  const getPlaceholder = () => {
      switch(diagnosticStep) {
          case 'target_asset': return "Ex: 200.000 (Apenas números)";
          default: return "Digite sua resposta...";
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[650px] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
      
      {/* Chat Header - Professional Navy */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
               <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
          </div>
          <div>
              <p className="text-sm font-bold text-slate-900">Consultor Estratégico</p>
              <p className="text-xs text-slate-500">Mesa de Operações</p>
          </div>
      </div>

      <div className="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar bg-slate-50">
        {messages.map((msg) => (
          <MessageBox key={msg.id} message={msg} />
        ))}
        
        {/* Lead Capture Form removed as per request to make simulation free/direct */}

        {isLoading && (
            <div className="flex gap-3 mb-4">
                 <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse"></div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-12 border border-slate-100">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {diagnosticStep !== 'done' && (
          <div className="p-4 bg-white border-t border-slate-100">
            {currentReplies.length > 0 && !isLoading && (
              <div className="flex flex-wrap justify-center gap-3 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                {currentReplies.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !isLoading && onUserResponse({ text: option.text, payload: option.payload })}
                    className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-400 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-grow md:flex-grow-0 active:scale-95"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {currentReplies.length === 0 && (
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="flex-grow bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 rounded-xl py-3.5 px-5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all border"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-slate-900 hover:bg-blue-950 text-white rounded-xl p-3.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
      )}
    </div>
  );
};
