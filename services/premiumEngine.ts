// Premium Calculation Engine — from README formula:
// Weekly Premium = Base Rate × Zone Risk × Season Multiplier × Claims History ± AI Adjustment

import { ZONES, SEASONS, CLAIMS_HISTORY } from '../constants/triggers';

export interface PremiumBreakdown {
  base: number;
  planName: string;
  zoneRisk: { factor: number; score: number; city: string };
  season: { factor: number; name: string };
  claimsHistory: { factor: number; label: string };
  aiAdjustment: number; // percentage like 0.10 or -0.10
  finalPremium: number;
  steps: PremiumStep[];
}

export interface PremiumStep {
  label: string;
  model: string;
  value: string;
  runningTotal: number;
}

export function calculatePremium(
  basePremium: number,
  planName: string,
  cityKey: string,
  seasonKey: string,
  claimsKey: string
): PremiumBreakdown {
  const zone = ZONES[cityKey as keyof typeof ZONES];
  const season = SEASONS[seasonKey as keyof typeof SEASONS];
  const claims = CLAIMS_HISTORY[claimsKey as keyof typeof CLAIMS_HISTORY];

  // AI adjustment based on season forecast
  const aiAdjustment = seasonKey === 'monsoon' ? 0.10 : seasonKey === 'summer' ? 0.05 : -0.10;

  // Step-by-step calculation
  const afterZone = basePremium * zone.factor;
  const afterSeason = afterZone * season.factor;
  const afterClaims = afterSeason * claims.factor;
  const finalPremium = Math.round(afterClaims * (1 + aiAdjustment));

  const steps: PremiumStep[] = [
    {
      label: `Base Premium (${planName})`,
      model: '',
      value: `₹${basePremium}`,
      runningTotal: basePremium,
    },
    {
      label: `Zone Risk (${zone.name}, Score: ${zone.riskScore})`,
      model: 'XGBoost',
      value: `×${zone.factor}`,
      runningTotal: Math.round(afterZone * 100) / 100,
    },
    {
      label: `Season (${season.name})`,
      model: 'Prophet',
      value: `×${season.factor}`,
      runningTotal: Math.round(afterSeason * 100) / 100,
    },
    {
      label: `Claims History (${claims.label})`,
      model: '',
      value: `×${claims.factor}`,
      runningTotal: Math.round(afterClaims * 100) / 100,
    },
    {
      label: 'AI Forecast Adjustment',
      model: 'LSTM',
      value: `${aiAdjustment > 0 ? '+' : ''}${aiAdjustment * 100}%`,
      runningTotal: finalPremium,
    },
  ];

  return {
    base: basePremium,
    planName,
    zoneRisk: { factor: zone.factor, score: zone.riskScore, city: zone.name },
    season: { factor: season.factor, name: season.name },
    claimsHistory: { factor: claims.factor, label: claims.label },
    aiAdjustment,
    finalPremium,
    steps,
  };
}
