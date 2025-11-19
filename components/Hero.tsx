
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group w-full">
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-center px-4 md:px-6 py-2 border-r last:border-r-0 border-gray-200 dark:border-gray-700">
        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative w-full overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
       <div className="absolute bottom-0 right-0 w-[400px] md:w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 pt-12 md:pt-24 pb-16 flex flex-col items-center min-h-[calc(100vh-80px)] justify-center">
        
        <div className="text-center max-w-5xl mx-auto mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-cyan-200 dark:border-cyan-700/30 backdrop-blur-sm text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            IA Arquiteto Financeiro
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 md:mb-8 tracking-tight">
            Construa patrimônio com a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">inteligência dos grandes.</span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium">
            A plataforma que projeta seu ciclo de alavancagem. Sua IA arquiteta a compra de ativos sem juros para multiplicar seu capital.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4">
            <button
              onClick={onStart}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-cyan-600/30 hover:shadow-cyan-500/40 hover:-translate-y-1 overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              INICIAR PROJETO
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                className="w-full sm:w-auto text-gray-600 dark:text-gray-400 font-semibold hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-4 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                Como funciona?
            </button>
          </div>

           <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap justify-center gap-6 sm:gap-12 opacity-80">
                <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="font-bold text-gray-500 dark:text-gray-500 text-xs md:text-sm flex items-center gap-1">
                        <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417V21h18v-.583c0-3.46-2.29-6.417-5.382-7.433z"/></svg>
                        Segurança Bancária
                     </span>
                </div>
                <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="font-bold text-gray-500 dark:text-gray-500 text-xs md:text-sm flex items-center gap-1">
                        <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        Análise IA Imparcial
                     </span>
                </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 px-4">
          <FeatureCard 
            title="Arquiteto de Lances" 
            description="Nossa IA projeta o lance matematicamente perfeito, analisando o histórico de milhares de grupos para garantir a contemplação mais rápida."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M17.636 17.636l-.707-.707M12 21v-1M4.364 17.636l.707-.707M3 12h1M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <FeatureCard 
            title="Ciclo de Alavancagem" 
            description="Um sistema perpétuo. Utilize o crédito contemplado para adquirir ativos que geram renda, pagando a própria parcela e expandindo seu império."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
          />
          <FeatureCard 
            title="Orquestração Digital" 
            description="Zero burocracia. Gerenciamos toda a documentação e aprovação junto às seguradoras através de nossa integração direta."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
        
        <div className="mt-16 md:mt-20 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 animate-in fade-in duration-1000 delay-300 mx-4">
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Junte-se a 12.000+ construtores de riqueza</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Volume transacionado na plataforma ultrapassa R$ 45 Milhões.</p>
            </div>
            <div className="flex gap-4 md:gap-8">
                <StatItem label="Cotas Ativas" value="3.4k" />
                <StatItem label="Contemplações" value="850+" />
                <StatItem label="Economia Média" value="42%" />
            </div>
        </div>

      </div>
    </div>
  );
};
