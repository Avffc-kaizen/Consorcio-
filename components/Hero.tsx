import React from 'react';

interface HeroProps {
  onStart: () => void;
  plansLoaded: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onStart, plansLoaded }) => {
  return (
    <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center h-[calc(100vh-80px)]">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
        O tamanho do seu patrimônio é uma <span className="text-cyan-600 dark:text-cyan-400">decisão</span>.
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
        Use o capital de forma inteligente. Adquira seus maiores ativos sem pagar juros de financiamento.
      </p>

      <button
        onClick={onStart}
        disabled={!plansLoaded}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
      >
        {!plansLoaded ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            CARREGANDO ESTRATÉGIAS...
          </>
        ) : (
          'MONTAR MINHA ESTRATÉGIA AGORA'
        )}
      </button>
    </div>
  );
};
