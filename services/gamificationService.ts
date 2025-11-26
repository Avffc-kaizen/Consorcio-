
import type { GamificationProfile, WeeklyQuote } from '../types';

const QUOTES_DB: Omit<WeeklyQuote, 'unlockedAt'>[] = [
    { id: 'q1', text: "A riqueza é a capacidade de experimentar plenamente a vida.", author: "Henry David Thoreau", type: "Motivacional" },
    { id: 'q2', text: "Os planos bem elaborados levam à fartura; a pressa, à penúria.", author: "Provérbios 21:5", type: "Divina" },
    { id: 'q3', text: "O juro composto é a oitava maravilha do mundo. Aquele que entende, ganha; aquele que não entende, paga.", author: "Albert Einstein", type: "Financeira" },
    { id: 'q4', text: "Não espere para comprar imóveis. Compre imóveis e espere.", author: "Will Rogers", type: "Estratégica" },
    { id: 'q5', text: "Lança o teu pão sobre as águas, porque depois de muitos dias o acharás.", author: "Eclesiastes 11:1", type: "Divina" },
    { id: 'q6', text: "Preço é o que você paga. Valor é o que você leva.", author: "Warren Buffett", type: "Financeira" },
    { id: 'q7', text: "A paciência é amarga, mas seu fruto é doce.", author: "Aristóteles", type: "Motivacional" }
];

const LEVEL_TITLES = [
    { threshold: 0, title: "Aprendiz Financeiro" },
    { threshold: 100, title: "Poupador Consciente" },
    { threshold: 300, title: "Estrategista de Lances" },
    { threshold: 600, title: "Construtor de Patrimônio" },
    { threshold: 1000, title: "Magnata da Alavancagem" },
    { threshold: 2000, title: "Lenda do Mercado" }
];

export const INITIAL_GAMIFICATION_STATE: GamificationProfile = {
    level: 1,
    levelTitle: "Aprendiz Financeiro",
    currentPoints: 0,
    nextLevelThreshold: 100,
    streakDays: 1,
    lastActivityDate: new Date().toISOString(),
    unlockedQuotes: [],
    nextQuoteUnlockDate: new Date().toISOString() // Ready to unlock first one immediately
};

export const calculateLevel = (points: number) => {
    let currentLevel = 1;
    let currentTitle = LEVEL_TITLES[0].title;
    let nextThreshold = LEVEL_TITLES[1].threshold;

    for (let i = 0; i < LEVEL_TITLES.length; i++) {
        if (points >= LEVEL_TITLES[i].threshold) {
            currentLevel = i + 1;
            currentTitle = LEVEL_TITLES[i].title;
            nextThreshold = LEVEL_TITLES[i + 1]?.threshold || 100000;
        }
    }

    return { level: currentLevel, title: currentTitle, nextThreshold };
};

export const checkWeeklyUnlock = (profile: GamificationProfile): GamificationProfile => {
    const now = new Date();
    const unlockDate = new Date(profile.nextQuoteUnlockDate);
    
    // If it's time to unlock a new quote
    if (now >= unlockDate) {
        // Find a quote not yet unlocked
        const availableQuotes = QUOTES_DB.filter(q => !profile.unlockedQuotes.some(uq => uq.id === q.id));
        
        if (availableQuotes.length > 0) {
            const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
            const newUnlockedQuote: WeeklyQuote = { ...randomQuote, unlockedAt: now.toISOString() };
            
            // Set next unlock for 7 days from now
            const nextUnlock = new Date();
            nextUnlock.setDate(nextUnlock.getDate() + 7);

            return {
                ...profile,
                unlockedQuotes: [newUnlockedQuote, ...profile.unlockedQuotes],
                nextQuoteUnlockDate: nextUnlock.toISOString(),
                // Bonus points for unlocking wisdom
                currentPoints: profile.currentPoints + 50 
            };
        }
    }
    return profile;
};

export const addPoints = (profile: GamificationProfile, points: number): GamificationProfile => {
    const newPoints = profile.currentPoints + points;
    const { level, title, nextThreshold } = calculateLevel(newPoints);
    
    return {
        ...profile,
        currentPoints: newPoints,
        level,
        levelTitle: title,
        nextLevelThreshold: nextThreshold,
        lastActivityDate: new Date().toISOString()
    };
};
