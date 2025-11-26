
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioPlan } from '../types';

interface EfficiencyRadarChartProps {
  plan: PortfolioPlan;
}

export const EfficiencyRadarChart: React.FC<EfficiencyRadarChartProps> = ({ plan }) => {
  
  // Normalize metrics to 0-100 scale for the radar
  const data = [
    {
      subject: 'Economia',
      A: Math.max(0, 100 - (plan.adminFee * 100 * 2)), // Lower fee = higher score
      fullMark: 100,
    },
    {
      subject: 'Probabilidade',
      A: plan.stats ? Math.min(100, (plan.stats.averageBid / plan.stats.maxBid) * 100 + 20) : 50,
      fullMark: 100,
    },
    {
      subject: 'Liquidez',
      A: plan.stats?.fundHealth === 'Alta Liquidez' ? 95 : plan.stats?.fundHealth === 'Estável' ? 70 : 40,
      fullMark: 100,
    },
    {
      subject: 'Estabilidade',
      A: plan.stats?.bidTrend === 'Estável' ? 85 : plan.stats?.bidTrend === 'Queda' ? 95 : 60, // Falling bid trend is good for buyer
      fullMark: 100,
    },
    {
      subject: 'Flexibilidade',
      A: plan.termInMonths > 100 ? 90 : 60, // Longer term = more flexibility in installments
      fullMark: 100,
    },
  ];

  return (
    <div className="h-64 w-full relative">
       <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={plan.planName}
            dataKey="A"
            stroke="#0891b2"
            strokeWidth={2}
            fill="#06b6d4"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0e7490', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 right-0 text-[10px] text-slate-400 italic bg-white/80 p-1 rounded">
        Score de Eficiência
      </div>
    </div>
  );
};
