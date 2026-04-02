// Unified Trigger Evaluation Service — checks all 5 parametric triggers
// Real APIs: Weather (OpenWeatherMap), AQI (OpenWeatherMap Air Pollution)
// Mock APIs: Flooding (IMD/NDMA sim), Curfew/Bandh (Govt API + NLP sim)

import { fetchWeather, fetchAQI, WeatherData, AQIData } from './weatherApi';

export interface TriggerResult {
  triggerId: string;
  triggerName: string;
  icon: string;
  isActive: boolean;
  severity: 'none' | 'warning' | 'critical';
  currentValue: string;
  threshold: string;
  sources: string[];
  confidence: number; // 0-100%
  lastChecked: string;
  payoutRange: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
}

export interface AllTriggersResult {
  city: string;
  triggers: TriggerResult[];
  activeCount: number;
  lastUpdated: string;
  weather: WeatherData | null;
  aqi: AQIData | null;
  news: NewsArticle[];
}

// ─── Trigger 1: Heavy Rain (Real API) ───────────────────────────
function evaluateHeavyRain(weather: WeatherData): TriggerResult {
  const rain = weather.rain1h;
  const isActive = rain > 64.5;
  const isWarning = rain > 40 && rain <= 64.5;

  return {
    triggerId: 'heavy_rain',
    triggerName: 'Heavy Rainfall',
    icon: 'cloud-rain',
    isActive,
    severity: isActive ? 'critical' : isWarning ? 'warning' : 'none',
    currentValue: `${rain}mm/hr`,
    threshold: '>64.5mm/day',
    sources: ['OpenWeatherMap', 'IMD'],
    confidence: isActive ? 92 + Math.round(Math.random() * 6) : 0,
    lastChecked: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    payoutRange: '₹500–650/day',
  };
}

// ─── Trigger 2: Extreme Heat (Real API) ─────────────────────────
function evaluateExtremeHeat(weather: WeatherData): TriggerResult {
  const temp = weather.temp;
  const isActive = temp > 45;
  const isWarning = temp > 40 && temp <= 45;

  return {
    triggerId: 'extreme_heat',
    triggerName: 'Extreme Heat',
    icon: 'flame',
    isActive,
    severity: isActive ? 'critical' : isWarning ? 'warning' : 'none',
    currentValue: `${temp}°C`,
    threshold: '>45°C',
    sources: ['OpenWeatherMap', 'IMD'],
    confidence: isActive ? 94 + Math.round(Math.random() * 5) : 0,
    lastChecked: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    payoutRange: '₹250–400/day',
  };
}

// ─── Trigger 3: AQI Spike (Real API) ────────────────────────────
function evaluateAQISpike(aqi: AQIData): TriggerResult {
  const aqiVal = aqi.aqiValue;
  const isActive = aqiVal > 400;
  const isWarning = aqiVal > 300 && aqiVal <= 400;

  return {
    triggerId: 'aqi_spike',
    triggerName: 'AQI Spike',
    icon: 'wind',
    isActive,
    severity: isActive ? 'critical' : isWarning ? 'warning' : 'none',
    currentValue: `AQI ${aqiVal}`,
    threshold: '>400 AQI (6+ hrs)',
    sources: ['CPCB AQI API', 'OpenWeatherMap'],
    confidence: isActive ? 91 + Math.round(Math.random() * 7) : 0,
    lastChecked: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    payoutRange: '₹250–300/day',
  };
}

// ─── Trigger 4: Flooding (Mock API — IMD/NDMA simulation) ───────
// Simulates checking IMD flood warnings and NDMA disaster alerts
const FLOOD_RISK_CITIES: Record<string, { active: boolean; level: string; advisory: string }> = {
  mumbai: { active: true, level: 'Orange', advisory: 'IMD Orange Alert: Heavy rainfall expected. Waterlogging likely in low-lying areas.' },
  chennai: { active: true, level: 'Red', advisory: 'NDMA Alert: Severe flooding in coastal areas. Avoid unnecessary travel.' },
  kolkata: { active: false, level: 'Yellow', advisory: 'IMD Yellow Alert: Moderate rainfall. Monitor local conditions.' },
  delhi: { active: false, level: 'None', advisory: 'No flood warnings active.' },
  bangalore: { active: false, level: 'None', advisory: 'No flood warnings active.' },
  pune: { active: false, level: 'None', advisory: 'No flood warnings active.' },
};

function evaluateFlooding(cityKey: string): TriggerResult {
  const floodData = FLOOD_RISK_CITIES[cityKey] || FLOOD_RISK_CITIES.bangalore;

  return {
    triggerId: 'flooding',
    triggerName: 'Flooding',
    icon: 'waves',
    isActive: floodData.active,
    severity: floodData.active ? 'critical' : floodData.level === 'Yellow' ? 'warning' : 'none',
    currentValue: floodData.advisory,
    threshold: 'Official flood warning',
    sources: ['IMD', 'NDMA'],
    confidence: floodData.active ? 93 + Math.round(Math.random() * 5) : 0,
    lastChecked: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    payoutRange: '₹650/day',
  };
}


// ─── Trigger 5: Civil Unrest/Curfew (News API Integration) ───────
export async function fetchCurfewNews(city: string): Promise<NewsArticle[]> {
  const API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY || '';
  if (!API_KEY) {
    // Return mock data if no key is provided yet
    return [
      {
        title: `Protests expected in ${city} downtown area`,
        description: 'Local authorities have issued an advisory due to planned demonstrations. Partial curfews might be enforced if the situation escalates.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1555189212-3f1d51a94367?w=400&q=80',
        publishedAt: new Date().toISOString(),
        source: { name: 'GigShield AI Mock Network' }
      }
    ];
  }

  try {
    const query = encodeURIComponent(`${city} AND (curfew OR strike OR protest OR bandh)`);
    const resp = await fetch(`https://gnews.io/api/v4/search?q=${query}&lang=en&max=5&apikey=${API_KEY}`);
    const data = await resp.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch Curfew News:', error);
    return [];
  }
}

function evaluateCurfew(city: string, news: NewsArticle[]): TriggerResult {
  // If we have very recent breaking news matching our strict query, the severity rises.
  const hasBreakingNews = news.length > 0 && news.some(n => 
    n.title.toLowerCase().includes('curfew') || n.title.toLowerCase().includes('section 144')
  );

  return {
    triggerId: 'curfew',
    triggerName: 'Civil Curfew / Bandh',
    icon: 'ban',
    isActive: hasBreakingNews,
    severity: hasBreakingNews ? 'critical' : (news.length > 0 ? 'warning' : 'none'),
    currentValue: hasBreakingNews ? 'Active' : (news.length > 0 ? 'Risk Alert' : 'Normal'),
    threshold: 'Govt Order / Breaking News',
    sources: ['GNews API Context'],
    confidence: hasBreakingNews ? 95 : 0,
    lastChecked: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    payoutRange: '₹300–500/day',
  };
}

// ─── Main Aggregator Function ─────────────────────────────────────
export async function evaluateAllTriggers(city: string): Promise<AllTriggersResult> {
  let weather: WeatherData | null = null;
  let aqi: AQIData | null = null;
  let news: NewsArticle[] = [];

  try {
    const [weatherData, aqiData, newsData] = await Promise.all([
      fetchWeather(city),
      fetchAQI(city),
      fetchCurfewNews(city)
    ]);
    weather = weatherData;
    aqi = aqiData;
    news = newsData;
  } catch (err) {
    console.error('Error fetching APIs sequentially or parallel:', err);
  }

  // Build trigger results from all 5 evaluators
  const results: TriggerResult[] = [];

  if (weather) {
    results.push(evaluateHeavyRain(weather));
    results.push(evaluateExtremeHeat(weather));
  }
  if (aqi) {
    results.push(evaluateAQISpike(aqi));
  }
  results.push(evaluateFlooding(city));
  results.push(evaluateCurfew(city, news));

  return {
    city: city,
    triggers: results,
    activeCount: results.filter((t) => t.isActive).length,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    weather,
    aqi,
    news,
  };
}

// ─── Get trigger result for a specific trigger ──────────────────
export async function evaluateSingleTrigger(
  triggerId: string,
  cityKey: string
): Promise<TriggerResult | null> {
  const all = await evaluateAllTriggers(cityKey);
  return all.triggers.find(t => t.triggerId === triggerId) || null;
}
