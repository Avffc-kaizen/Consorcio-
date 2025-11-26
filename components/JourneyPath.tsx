
import React, { useState, useEffect, useRef } from 'react';
import type { GamificationProfile, WeeklyQuote } from '../types';

interface JourneyPathProps {
    profile: GamificationProfile;
    onClaimQuote: () => void;
}

const QuoteModal: React.FC<{ quote: WeeklyQuote | null, onClose: () => void }> = ({ quote, onClose }) => {
    if (!quote) return null;
    const [isClaimed, setIsClaimed] = useState(false);
    const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string, angle: number}[]>([]);

    const getTypeStyle = (type: string) => {
        switch(type) {
            case 'Divina': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Financeira': return 'bg-green-100 text-green-800 border-green-300';
            case 'Estratégica': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-amber-100 text-amber-800 border-amber-300';
        }
    };

    const handleClaim = () => {
        setIsClaimed(true);
        
        // Generate Particles for explosion effect
        const colors = ['#fcd34d', '#34d399', '#60a5fa', '#f87171'];
        const newParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: 50, // center %
            y: 50, // center %
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            speed: 5 + Math.random() * 10
        }));
        setParticles(newParticles);

        // Delay close to show "Claimed" state
        setTimeout(() => {
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                
                {/* Visual Rays Effect */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-200/20 to-amber-300/20 rounded-full -z-10 ${isClaimed ? 'animate-ping duration-1000' : 'animate-[spin_10s_linear_infinite]'}`}></div>

                {/* Particles */}
                {isClaimed && particles.map(p => (
                    <div 
                        key={p.id}
                        className="absolute w-2 h-2 rounded-full animate-out fade-out duration-1000"
                        style={{
                            backgroundColor: p.color,
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            transform: `translate(${Math.cos(p.angle) * 150}px, ${Math.sin(p.angle) * 150}px)`
                        }}
                    ></div>
                ))}
                
                <div className="mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/40 mb-4 ${isClaimed ? 'scale-125 transition-transform duration-300' : 'animate-bounce'}`}>
                        {isClaimed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{isClaimed ? 'Recompensa Coletada!' : 'Sabedoria Desbloqueada!'}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getTypeStyle(quote.type)}`}>
                        {quote.type}
                    </div>
                </div>

                <blockquote className="text-xl font-medium text-gray-700 dark:text-gray-200 italic mb-6 leading-relaxed">
                    "{quote.text}"
                </blockquote>

                <cite className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 not-italic">
                    — {quote.author}
                </cite>

                <button 
                    onClick={handleClaim}
                    disabled={isClaimed}
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 ${isClaimed ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30 hover:scale-105 active:scale-95'}`}
                >
                    {isClaimed ? 'Pontos Adicionados!' : 'Coletar Recompensa (+50 pts)'}
                </button>
            </div>
        </div>
    );
};

export const JourneyPath: React.FC<JourneyPathProps> = ({ profile, onClaimQuote }) => {
    const [viewedQuote, setViewedQuote] = useState<WeeklyQuote | null>(null);
    const prevQuotesLengthRef = useRef(profile.unlockedQuotes.length);

    // Auto-open modal when a new quote is unlocked
    useEffect(() => {
        if (profile.unlockedQuotes.length > prevQuotesLengthRef.current) {
            // New quote added! Show the latest one.
            setViewedQuote(profile.unlockedQuotes[0]);
        }
        prevQuotesLengthRef.current = profile.unlockedQuotes.length;
    }, [profile.unlockedQuotes]);

    const steps = [
        { id: 'start', label: 'Planejamento', icon: '🗺️', threshold: 0 },
        { id: 'bid', label: 'Estratégia de Lance', icon: '🎯', threshold: 100 },
        { id: 'assembly', label: 'Assembleia', icon: '⚖️', threshold: 300 },
        { id: 'contemplation', label: 'Contemplação', icon: '🏆', threshold: 600 },
        { id: 'acquisition', label: 'Aquisição do Bem', icon: '🔑', threshold: 1000 },
    ];

    const currentPoints = profile.currentPoints;
    
    // Check if a new quote is ready to be claimed
    const isQuoteAvailable = new Date() >= new Date(profile.nextQuoteUnlockDate);
    const latestQuote = profile.unlockedQuotes.length > 0 ? profile.unlockedQuotes[0] : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sua Jornada</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">O caminho até a chave na mão.</p>
                </div>
                
                {/* Weekly Wisdom Chest */}
                <div 
                    onClick={() => {
                        if (isQuoteAvailable) {
                            onClaimQuote();
                        } else if (latestQuote) {
                            setViewedQuote(latestQuote);
                        }
                    }}
                    className={`relative cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isQuoteAvailable ? 'animate-bounce' : ''}`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 ${isQuoteAvailable ? 'bg-amber-100 border-amber-400 shadow-amber-500/30' : 'bg-gray-100 border-gray-200 grayscale'}`}>
                        🎁
                    </div>
                    {isQuoteAvailable && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                    )}
                    <p className="text-[10px] text-center font-bold mt-1 text-gray-500 uppercase">
                        {isQuoteAvailable ? 'Coletar' : 'Semanal'}
                    </p>
                </div>
             </div>

             {/* Path Visualization */}
             <div className="relative flex flex-col items-center gap-6 py-4">
                 {/* Central Line */}
                 <div className="absolute top-0 bottom-0 w-2 bg-gray-100 dark:bg-gray-700 rounded-full -z-10">
                     <div 
                        className="w-full bg-cyan-500 rounded-full transition-all duration-1000"
                        style={{ height: `${Math.min(100, (currentPoints / 1000) * 100)}%` }}
                     ></div>
                 </div>

                 {steps.map((step, index) => {
                     const isUnlocked = currentPoints >= step.threshold;
                     const isCurrent = isUnlocked && (index === steps.length - 1 || currentPoints < steps[index + 1].threshold);
                     
                     // Zigzag positioning
                     const offsetClass = index % 2 === 0 ? '-translate-x-8' : 'translate-x-8';

                     return (
                         <div key={step.id} className={`relative group ${offsetClass}`}>
                             {/* Node Circle */}
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 shadow-xl transition-all duration-300 z-10 ${
                                 isCurrent 
                                    ? 'bg-cyan-500 border-white ring-4 ring-cyan-200 dark:ring-cyan-900 scale-110' 
                                    : isUnlocked 
                                        ? 'bg-cyan-100 border-cyan-500 text-cyan-700' 
                                        : 'bg-gray-200 border-gray-300 text-gray-400 grayscale'
                             }`}>
                                 {step.icon}
                             </div>

                             {/* Label */}
                             <div className={`absolute top-1/2 -translate-y-1/2 ${index % 2 === 0 ? 'left-full ml-4 text-left' : 'right-full mr-4 text-right'} w-32`}>
                                 <p className={`text-sm font-bold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                     {step.label}
                                 </p>
                                 {isCurrent && (
                                     <span className="inline-block bg-cyan-100 text-cyan-800 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">
                                         Em Progresso
                                     </span>
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>
             
             {viewedQuote && (
                 <QuoteModal quote={viewedQuote} onClose={() => setViewedQuote(null)} />
             )}
        </div>
    );
};
