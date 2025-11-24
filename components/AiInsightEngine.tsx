
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
                // Delay slightly to let UI render first
                await new Promise(r => setTimeout(r, 1000));
                const result = await getAiPortfolioAnalysis(portfolio, marketplaceListings);
                onInsightsGenerated(result.insights);
            } else {
                onInsightsGenerated([]);
            }
        };

        generateInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portfolio.length]); // Only rerun if number of plans change to avoid loops

    return null; // This is a headless component
};
