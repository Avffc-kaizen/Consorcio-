
import React, { useState, useEffect } from 'react';
import { findAvailablePlans } from '../services/consorcioService'; // Import to access DB stats
import dbData from '../data/consorcio_db.json'; // Direct access for quick stats

interface HeroProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 group w-full">
    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center mb-5 group-hover:bg-blue-950 group-hover:text-amber-400 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-sm text-slate-700 leading-relaxed font-medium">{description}</p>
  </div>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-center px-4 md:px-6 py-2 border-r last:border-r-0 border-slate-200">
        <p className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{label}</p>
    </div>
);

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ plans: 0, volume: 0, savings: 42 });

  useEffect(() => {
      // Calculate real stats from the integrated DB
      const totalPlans = dbData.length;
      const totalVolume = dbData.reduce((acc: number, item: any) => acc + (Number(item.credit) || 0), 0);
      
      // Animation effect for numbers
      let start = 0;
      const duration = 2000;
      const stepTime = 50;
      const steps = duration / stepTime;
      const incrementPlans = totalPlans / steps;
      
      const timer = setInterval(() => {
          start += 1;
          setStats(prev => ({
              ...prev,
              plans: Math.min(totalPlans, Math.floor(prev.plans + incrementPlans)),
              volume: totalVolume // Keep volume static for now or animate similarly
          }));
          if (start >= steps) clearInterval(timer);
      }, stepTime);

      // Set final exact values
      setStats({ plans: totalPlans, volume: totalVolume, savings: 42 });

      return () => clearInterval(timer);
  }, []);

  const formatVolume = (val: number) => {
      if (val > 1000000000) return `${(val / 1000000000).toFixed(1)}Bi`;
      if (val > 1000000) return `${(val / 1000000).toFixed(0)}Mi`;
      return `${(val / 1000).toFixed(0)}k`;
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Planejador Inteligente de Consórcio',
      text: 'Encontrei essa ferramenta incrível para planejar a compra de bens sem juros. Simule seu plano aqui:',
      url: window.location.href,
    };

    // 1. Tentar Compartilhamento Nativo (Mobile/Apps)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            return; // Sucesso! Encerra a função.
        } catch (err: any) {
            // Se o erro for 'AbortError', o usuário cancelou o modal intencionalmente.
            // Não devemos copiar para o clipboard nesse caso.
            if (err.name === 'AbortError') {
                return;
            }
            console.debug('Compartilhamento nativo falhou, tentando fallback...', err);
        }
    }

    // 2. Fallback: Área de Transferência (Desktop)
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar link', err);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-50">
       {/* Background Elements - Clean & Light */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
       
      <div className="container mx-auto px-4 pt-16 md:pt-28 pb-20 flex flex-col items-center min-h-[calc(100vh-80px)] justify-center relative">
        
        <div className="text-center max-w-5xl mx-auto mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2">
          
          {/* Badge - Friendly & Clear */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 mb-8 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            INTELIGÊNCIA DE MERCADO ATIVA
          </div>
          
          {/* Title - Simple & Direct */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight">
            Chega de pagar<br className="hidden md:block" /> 
            <span className="relative whitespace-nowrap ml-2 md:ml-4">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900">
                    juros ao banco.
                </span>
                <span className="absolute inset-x-0 bottom-3 h-3 bg-amber-300/50 -z-10 transform -skew-x-6 rounded-sm"></span>
            </span>
          </h1>
          
          {/* Subtitle - Explanatory */}
          <p className="text-lg md:text-2xl text-slate-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Ajudamos você a planejar a compra do seu carro, casa ou caminhão pelo <strong className="text-slate-900 font-bold">preço justo</strong>. Sem entrada abusiva, sem surpresas.
          </p>

          {/* CTA Buttons - Clear Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto px-4">
            <button
              onClick={onStart}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-950 hover:bg-blue-900 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-1 overflow-hidden active:scale-95"
            >
              SIMULAR MEU PLANO
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
                onClick={handleShare}
                className="w-full sm:w-auto text-slate-700 font-bold hover:text-slate-900 transition-all duration-300 py-4 px-8 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-white flex items-center justify-center gap-2 group active:scale-95 bg-white/80"
            >
                {copied ? (
                    <>
                        <span className="text-green-700">Link Copiado</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </>
                ) : (
                    <>
                        Compartilhar
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </>
                )}
            </button>
          </div>

           <div className="mt-14 pt-10 border-t border-slate-200 flex flex-wrap justify-center gap-8 sm:gap-16 opacity-90">
                <div className="flex items-center gap-2.5 group cursor-default">
                     <div className="p-2 bg-blue-50 rounded-lg text-blue-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417V21h18v-.583c0-3.46-2.29-6.417-5.382-7.433z"/></svg>
                     </div>
                     <span className="font-bold text-slate-700 text-sm md:text-base">
                        Segurança Total (Porto/Mapfre)
                     </span>
                </div>
                <div className="flex items-center gap-2.5 group cursor-default">
                     <div className="p-2 bg-green-50 rounded-lg text-green-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                     </div>
                     <span className="font-bold text-slate-700 text-sm md:text-base">
                        Matemática a seu favor
                     </span>
                </div>
           </div>
        </div>

        {/* VSL Section */}
        <div className="w-full max-w-4xl mx-auto mb-20 px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-200 p-2 md:p-4 relative">
                {/* Glow effect behind video */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-10 blur-2xl rounded-[3rem] -z-10"></div>
                
                <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                     <iframe 
                        className="absolute top-0 left-0 w-full h-full" 
                        src="https://www.youtube.com/embed/j_DookQ_X6w?rel=0&modestbranding=1" 
                        title="Estratégia de Alavancagem" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            <p className="text-center text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest">
                <span className="text-red-500">▶</span> Assista: Como multiplicar patrimônio sem juros
            </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 px-4">
          <FeatureCard 
            title="Lances Inteligentes" 
            description="Nossa tecnologia varre grupos da Porto Seguro e Bancorbrás para encontrar onde sua oferta de lance tem probabilidade máxima de contemplação."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <FeatureCard 
            title="Poder de Compra" 
            description="Com a carta de crédito na mão, você compra seu bem à vista, negociando descontos incríveis na hora de fechar negócio."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <FeatureCard 
            title="Processo Digital" 
            description="Da simulação à assinatura do contrato, orquestramos tudo digitalmente. Sem papelada, sem filas, apenas estratégia."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
        
        {/* Dynamic Stats Bar */}
        <div className="mt-20 w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-1000 delay-300 mx-4">
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Base de Inteligência<br/>Atualizada</h3>
                <p className="text-sm md:text-base text-slate-500 font-medium">Dados oficiais processados em tempo real.</p>
            </div>
            <div className="flex gap-6 md:gap-12">
                <StatItem label="Grupos Analisados" value={`${stats.plans > 0 ? stats.plans : '...'}`} />
                <StatItem label="Volume de Crédito" value={`R$ ${formatVolume(stats.volume)}`} />
                <StatItem label="Economia Média" value={`${stats.savings}%`} />
            </div>
        </div>

      </div>
    </div>
  );
};
