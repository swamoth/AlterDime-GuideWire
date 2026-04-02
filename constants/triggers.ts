// Parametric trigger thresholds — from README
export const TRIGGERS = {
  heavyRain: {
    id: 'heavy_rain',
    name: 'Heavy Rainfall',
    icon: 'cloud-showers-heavy',
    threshold: 64.5, // mm/day
    unit: 'mm',
    source: 'OpenWeatherMap, IMD',
    payoutRange: '₹500–650/day',
    payoutMin: 500,
    payoutMax: 650,
  },
  extremeHeat: {
    id: 'extreme_heat',
    name: 'Extreme Heat',
    icon: 'temperature-arrow-up',
    threshold: 45, // °C
    unit: '°C',
    source: 'OpenWeatherMap, IMD',
    payoutRange: '₹250–400/day',
    payoutMin: 250,
    payoutMax: 400,
  },
  flooding: {
    id: 'flooding',
    name: 'Flooding',
    icon: 'water',
    threshold: null, // official warning
    unit: '',
    source: 'IMD, NDMA',
    payoutRange: '₹650/day',
    payoutMin: 650,
    payoutMax: 650,
  },
  aqiSpike: {
    id: 'aqi_spike',
    name: 'AQI Spike',
    icon: 'smog',
    threshold: 400, // AQI index
    unit: 'AQI',
    source: 'CPCB AQI API',
    payoutRange: '₹250–300/day',
    payoutMin: 250,
    payoutMax: 300,
  },
  curfew: {
    id: 'curfew',
    name: 'Curfew / Bandh',
    icon: 'ban',
    threshold: null, // official shutdown
    unit: '',
    source: 'Govt API + NLP',
    payoutRange: '₹650/day',
    payoutMin: 650,
    payoutMax: 650,
  },
};

// City zone data — from README
export const ZONES = {
  mumbai: { name: 'Mumbai', riskScore: 82, factor: 1.3, level: 'High' },
  delhi: { name: 'Delhi', riskScore: 75, factor: 1.2, level: 'High' },
  bangalore: { name: 'Bangalore', riskScore: 48, factor: 1.0, level: 'Medium' },
  chennai: { name: 'Chennai', riskScore: 80, factor: 1.3, level: 'High' },
  pune: { name: 'Pune', riskScore: 28, factor: 0.8, level: 'Low' },
  kolkata: { name: 'Kolkata', riskScore: 72, factor: 1.2, level: 'High' },
};

// Season multipliers — from README
export const SEASONS = {
  monsoon: { name: 'Monsoon (Jun–Sep)', factor: 1.4 },
  summer: { name: 'Summer (Mar–May)', factor: 1.1 },
  winter: { name: 'Winter (Oct–Feb)', factor: 0.9 },
};

// Claims history multipliers — from README
export const CLAIMS_HISTORY = {
  '0': { factor: 0.85, label: '15% No-Claim Bonus' },
  '1-2': { factor: 1.0, label: 'Standard' },
  '3+': { factor: 1.2, label: 'Higher Risk' },
};

// Plan tiers — from README
export const PLANS = [
  {
    id: 'basic',
    name: 'Basic Shield',
    icon: 'shield',
    price: 29,
    color: '#007AFF',
    coverage: ['Weather only'],
    maxPayout: 1500,
    features: ['Weather disruptions only', 'Max payout: ₹1,500/week', 'Auto-triggered claims', 'UPI instant payout'],
  },
  {
    id: 'smart',
    name: 'Smart Shield',
    icon: 'bolt',
    price: 49,
    color: '#CBFF00',
    popular: true,
    coverage: ['Weather', 'Pollution', 'Curfew'],
    maxPayout: 2500,
    features: ['Weather + Pollution + Curfew', 'Max payout: ₹2,500/week', 'AI predictive alerts', 'WhatsApp notifications', 'No-claim bonus (15%)'],
  },
  {
    id: 'total',
    name: 'Total Shield',
    icon: 'fire',
    price: 79,
    color: '#FF9500',
    coverage: ['All disruptions', 'Priority'],
    maxPayout: 4000,
    features: ['All disruption types', 'Max payout: ₹4,000/week', 'Priority payout queue', 'Pre-coverage AI alerts', 'Dedicated support'],
  },
];
