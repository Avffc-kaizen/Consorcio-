
import React from 'react';
import type { GamificationProfile } from '../types';

interface GamificationHudProps {
    profile: GamificationProfile;
}

export const GamificationHud: React.FC<GamificationHudProps> = ({ profile }) => {
    const progressPercent = Math.min(100, (profile.currentPoints / profile.nextLevelThreshold) * 100);

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 w-full shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
                
                {/* Level Badge */}
                <div className="flex items-center gap-3 min-w-max">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center border-2 border-cyan-500">
                             <span className="font-bold text-cyan-700 dark:text-cyan-300">{profile.level}</span>
                        </div>
                         <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            LVL
                         </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Ranking</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.levelTitle}</p>
                    </div>
                </div>

                {/* Points Bar (Alavancagem) */}
                <div className="flex-grow max-w-md hidden md:block">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-yellow-600 dark:text-yellow-400">Pontos de Alavancagem</span>
                        <span className="text-gray-500">{profile.currentPoints} / {profile.nextLevelThreshold}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Streak (Dias de Foco) */}
                <div className="flex items-center gap-2 min-w-max">
                     <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 3.258 2 3.258a1 1 0 01-1.38 2.862z" clipRule="evenodd" />
                        </svg>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-xl font-black text-gray-800 dark:text-white leading-none">{profile.streakDays}</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase">Dias Foco</span>
                     </div>
                </div>

                 {/* Points (Mobile only) */}
                <div className="md:hidden flex items-center gap-1">
                     <span className="text-yellow-500 font-bold">{profile.currentPoints}</span>
                     <span className="text-[10px] text-gray-400">PTS</span>
                </div>

            </div>
        </div>
    );
};
