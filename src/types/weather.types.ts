/**
 * Representa os dados de localização retornados pela API.
 */
export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localtime: string;
}

/**
 * Representa a condição climática em um dado momento.
 */
export interface Condition {
  text: string;
  icon: string;
  code: number;
}

/**
 * Representa o clima atual em um determinado local.
 */
export interface CurrentWeather {
  temp_c: number;
  humidity: number;
  condition: Condition;
  feelslike_c: number;
  wind_kph: number;
  last_updated: string;
}

/**
 * Representa a previsão do tempo detalhada de hora em hora.
 */
export interface HourData {
  time: string;           // "2024-01-15 14:00"
  temp_c: number;
  humidity: number;
  condition: Condition;
  chance_of_rain: number;
  feelslike_c: number;
}

/**
 * Representa o resumo da previsão do tempo para um dia inteiro.
 */
export interface DayData {
  maxtemp_c: number;
  mintemp_c: number;
  avgtemp_c: number;
  avghumidity: number;
  condition: Condition;
  daily_chance_of_rain: number;
}

/**
 * Representa a previsão de um único dia, agrupando o resumo diário e os dados por hora.
 */
export interface ForecastDay {
  date: string;           // "2024-01-15"
  date_epoch: number;
  day: DayData;
  hour: HourData[];
}

/**
 * Representa a resposta completa do endpoint /forecast.json.
 */
export interface WeatherForecast {
  location: Location;
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}

/**
 * Representa um item de resultado de busca de cidades retornado pelo endpoint /search.json.
 */
export interface CitySearchResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

/**
 * Representa o estado do cache para armazenamento offline dos dados climáticos.
 */
export interface CachedWeatherData {
  data: WeatherForecast;
  cachedAt: number;       // timestamp em ms
  cityName: string;
}
