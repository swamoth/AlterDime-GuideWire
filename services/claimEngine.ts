// Claim Trigger Engine — simulates the parametric claim pipeline
import { TRIGGERS } from '../constants/triggers';

export type ClaimStatus = 'detected' | 'validating' | 'location_check' | 'fraud_check' | 'approved' | 'paid' | 'rejected';

export interface ClaimEvent {
  id: string;
  triggerId: string;
  triggerName: string;
  icon: string;
  city: string;
  date: string;
  daysAffected: number;
  payoutAmount: number;
  status: ClaimStatus;
  confidenceScore: number;
  fraudScore: number;
  dataSources: string[];
  verificationSteps: VerificationStep[];
}

export interface VerificationStep {
  label: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  detail: string;
  duration: number; // ms to complete
}

// Generate a simulated claim event
export function createClaimEvent(
  triggerKey: keyof typeof TRIGGERS,
  city: string,
  daysAffected: number
): ClaimEvent {
  const trigger = TRIGGERS[triggerKey];
  const payout = (trigger.payoutMin + Math.round(Math.random() * (trigger.payoutMax - trigger.payoutMin))) * daysAffected;

  return {
    id: `CLM-${Date.now().toString(36).toUpperCase()}`,
    triggerId: trigger.id,
    triggerName: trigger.name,
    icon: trigger.icon,
    city,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    daysAffected,
    payoutAmount: payout,
    status: 'detected',
    confidenceScore: 85 + Math.round(Math.random() * 12), // 85-97%
    fraudScore: Math.round(Math.random() * 5) / 100, // 0.00 - 0.05
    dataSources: trigger.source.split(', '),
    verificationSteps: [
      {
        label: 'Disruption Detected',
        status: 'pending',
        detail: `${trigger.name} detected in ${city} via ${trigger.source}`,
        duration: 1500,
      },
      {
        label: 'Parametric Validation',
        status: 'pending',
        detail: `Confirmed by 2+ independent data sources`,
        duration: 2000,
      },
      {
        label: 'Location Verified',
        status: 'pending',
        detail: 'GPS trajectory + platform order logs confirmed',
        duration: 1800,
      },
      {
        label: 'Fraud Check Passed',
        status: 'pending',
        detail: 'Isolation Forest anomaly score: 0.02 (normal)',
        duration: 1500,
      },
      {
        label: 'Payout Sent',
        status: 'pending',
        detail: `₹${payout} sent via UPI`,
        duration: 1200,
      },
    ],
  };
}

// Mock claim history data
export function getMockClaimHistory(): ClaimEvent[] {
  return [
    {
      id: 'CLM-001',
      triggerId: 'heavy_rain',
      triggerName: 'Heavy Rainfall',
      icon: 'cloud-showers-heavy',
      city: 'Mumbai',
      date: '12 Mar 2026',
      daysAffected: 2,
      payoutAmount: 1300,
      status: 'paid',
      confidenceScore: 97,
      fraudScore: 0.02,
      dataSources: ['OpenWeatherMap', 'IMD'],
      verificationSteps: [],
    },
    {
      id: 'CLM-002',
      triggerId: 'extreme_heat',
      triggerName: 'Heat Wave',
      icon: 'temperature-arrow-up',
      city: 'Delhi',
      date: '5 Mar 2026',
      daysAffected: 4,
      payoutAmount: 1040,
      status: 'paid',
      confidenceScore: 94,
      fraudScore: 0.01,
      dataSources: ['OpenWeatherMap', 'IMD'],
      verificationSteps: [],
    },
    {
      id: 'CLM-003',
      triggerId: 'aqi_spike',
      triggerName: 'AQI Spike',
      icon: 'smog',
      city: 'Delhi NCR',
      date: '18 Feb 2026',
      daysAffected: 1,
      payoutAmount: 300,
      status: 'paid',
      confidenceScore: 91,
      fraudScore: 0.03,
      dataSources: ['CPCB AQI'],
      verificationSteps: [],
    },
    {
      id: 'CLM-004',
      triggerId: 'curfew',
      triggerName: 'Curfew',
      icon: 'ban',
      city: 'Hyderabad',
      date: '2 Feb 2026',
      daysAffected: 2,
      payoutAmount: 1300,
      status: 'paid',
      confidenceScore: 89,
      fraudScore: 0.04,
      dataSources: ['Govt API', 'NLP (BERT)'],
      verificationSteps: [],
    },
    {
      id: 'CLM-005',
      triggerId: 'flooding',
      triggerName: 'Flooding',
      icon: 'water',
      city: 'Chennai',
      date: '22 Jan 2026',
      daysAffected: 1,
      payoutAmount: 710,
      status: 'paid',
      confidenceScore: 93,
      fraudScore: 0.02,
      dataSources: ['IMD', 'NDMA'],
      verificationSteps: [],
    },
  ];
}
