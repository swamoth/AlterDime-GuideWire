// OpenWeatherMap API integration
// Free tier: 60 calls/min, current weather + air pollution

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// City coordinates for API calls
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  mumbai: { lat: 19.076, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.209 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  pune: { lat: 18.5204, lon: 73.8567 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
};

export interface WeatherData {
  city: string;
  temp: number; // °C
  feelsLike: number;
  humidity: number;
  rain1h: number; // mm
  windSpeed: number; // km/h
  description: string;
  icon: string;
}

export interface AQIData {
  aqi: number; // 1-5 scale
  aqiValue: number; // actual PM2.5 value
  status: string;
}

export async function fetchWeather(cityKey: string): Promise<WeatherData> {
  const coords = CITY_COORDS[cityKey];
  if (!coords) throw new Error(`Unknown city: ${cityKey}`);

  try {
    const res = await fetch(
      `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    return {
      city: cityKey,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      rain1h: data.rain?.['1h'] || 0,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch {
    // Fallback mock data for demo
    return getMockWeather(cityKey);
  }
}

export async function fetchAQI(cityKey: string): Promise<AQIData> {
  const coords = CITY_COORDS[cityKey];
  if (!coords) throw new Error(`Unknown city: ${cityKey}`);

  try {
    const res = await fetch(
      `${BASE_URL}/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`
    );
    const data = await res.json();
    const pm25 = data.list[0].components.pm2_5;
    const aqi = data.list[0].main.aqi;

    const statusMap: Record<number, string> = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor',
    };

    return {
      aqi,
      aqiValue: Math.round(pm25),
      status: statusMap[aqi] || 'Unknown',
    };
  } catch (err) {
    return getMockAQI(cityKey);
  }
}

// Mock data fallback when API key is not set or API fails
function getMockWeather(cityKey: string): WeatherData {
  const mocks: Record<string, WeatherData> = {
    mumbai: { city: 'mumbai', temp: 31, feelsLike: 35, humidity: 78, rain1h: 58, windSpeed: 22, description: 'heavy rain', icon: '10d' },
    delhi: { city: 'delhi', temp: 44, feelsLike: 47, humidity: 25, rain1h: 0, windSpeed: 12, description: 'extreme heat', icon: '01d' },
    bangalore: { city: 'bangalore', temp: 28, feelsLike: 30, humidity: 65, rain1h: 0, windSpeed: 18, description: 'partly cloudy', icon: '02d' },
    chennai: { city: 'chennai', temp: 35, feelsLike: 39, humidity: 70, rain1h: 12, windSpeed: 25, description: 'light rain', icon: '10d' },
    pune: { city: 'pune', temp: 30, feelsLike: 32, humidity: 55, rain1h: 0, windSpeed: 14, description: 'clear sky', icon: '01d' },
    kolkata: { city: 'kolkata', temp: 33, feelsLike: 37, humidity: 72, rain1h: 5, windSpeed: 16, description: 'scattered clouds', icon: '03d' },
  };
  return mocks[cityKey] || mocks.bangalore;
}

// Mock AQI data fallback
function getMockAQI(cityKey: string): AQIData {
  const mocks: Record<string, AQIData> = {
    delhi: { aqi: 5, aqiValue: 450, status: 'Very Poor' },
    mumbai: { aqi: 4, aqiValue: 310, status: 'Poor' },
    bangalore: { aqi: 2, aqiValue: 85, status: 'Fair' },
    chennai: { aqi: 3, aqiValue: 120, status: 'Moderate' },
    pune: { aqi: 2, aqiValue: 90, status: 'Fair' },
    kolkata: { aqi: 4, aqiValue: 280, status: 'Poor' },
  };
  return mocks[cityKey] || { aqi: 2, aqiValue: 78, status: 'Fair' };
}
