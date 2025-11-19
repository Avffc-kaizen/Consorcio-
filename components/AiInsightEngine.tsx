import React, { useEffect } from 'react';
import type { PortfolioPlan, MarketplaceListing, AiPortfolioInsight } from '../types';
import { getAiPortfolioAnalysis } from '../services/geminiService';

interface AiInsightEngineProps {
    portfolio: PortfolioPlan[];
    marketplaceListings: MarketplaceListing[];
    onInsightsGenerated: (insights: AiPortfolioInsight[]) => void;
}

export const AiInsightEngine: React.FC<AiInsightEngineProps> = ({ portfolio, marketplaceListings, onInsightsGenerated }) => {
    
    useEffect(() => {
        const generateInsights = async () => {
            if (portfolio.length > 0) {
                const result = await getAiPortfolioAnalysis(portfolio, marketplaceListings);
                onInsightsGenerated(result.insights);
            } else {
                onInsightsGenerated([]);
            }
        };

        generateInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portfolio, marketplaceListings]); // Rerun if portfolio changes

    return null; // This is a headless component
};
