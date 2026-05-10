import { apiClient } from './api.client';
import { WeatherForecast, CitySearchResult } from '../types/weather.types';

/**
 * Busca previsão para os próximos 3 dias (hoje + 2)
 * Endpoint: GET /forecast.json?q={location}&days=3&aqi=no&alerts=no
 * 
 * @param location A string representando o local buscado (ex: "São Paulo")
 */
export async function getForecast(location: string): Promise<WeatherForecast> {
  const response = await apiClient.get<WeatherForecast>('/forecast.json', {
    params: {
      q: location,
      days: 3,
      aqi: 'no',
      alerts: 'no',
    },
  });
  return response.data;
}

/**
 * Autocomplete de cidades
 * Endpoint: GET /search.json?q={query}
 * 
 * @param query O termo de busca
 */
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  const response = await apiClient.get<CitySearchResult[]>('/search.json', {
    params: {
      q: query,
    },
  });
  return response.data;
}

/**
 * Busca por coordenadas (para localização GPS)
 * Usa o mesmo endpoint /forecast.json mas com q="lat,lon"
 * 
 * @param lat Latitude
 * @param lon Longitude
 */
export async function getForecastByCoords(lat: number, lon: number): Promise<WeatherForecast> {
  return getForecast(`${lat},${lon}`);
}
