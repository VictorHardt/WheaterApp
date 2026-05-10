import AsyncStorage from '@react-native-async-storage/async-storage';
import { CachedWeatherData, WeatherForecast } from '../types';

/**
 * Salva os dados de previsão do tempo no AsyncStorage.
 * @param cityName Nome da cidade usada como chave no cache.
 * @param data Os dados completos da previsão do tempo.
 */
export async function saveForecastCache(cityName: string, data: WeatherForecast): Promise<void> {
  try {
    const cacheData: CachedWeatherData = {
      data,
      cachedAt: Date.now(),
      cityName,
    };
    const key = `forecast_cache_${cityName.toLowerCase()}`;
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Erro ao salvar cache para a cidade ${cityName}:`, error);
  }
}

/**
 * Lê os dados de previsão do tempo do AsyncStorage.
 * @param cityName Nome da cidade usada como chave no cache.
 * @returns Os dados do cache ou null se não existir.
 */
export async function loadForecastCache(cityName: string): Promise<CachedWeatherData | null> {
  try {
    const key = `forecast_cache_${cityName.toLowerCase()}`;
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as CachedWeatherData;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao ler cache para a cidade ${cityName}:`, error);
    return null;
  }
}

/**
 * Calcula há quantos minutos os dados foram armazenados no cache.
 * @param cachedAt O timestamp em ms de quando os dados foram salvos.
 * @returns A idade do cache em minutos.
 */
export function getCacheAgeMinutes(cachedAt: number): number {
  const now = Date.now();
  const diffMs = now - cachedAt;
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Verifica se os dados do cache estão obsoletos (stale).
 * @param cachedAt O timestamp em ms de quando os dados foram salvos.
 * @param maxAgeMinutes O tempo máximo permitido em minutos (padrão: 30).
 * @returns true se o cache for mais antigo que maxAgeMinutes, false caso contrário.
 */
export function isCacheStale(cachedAt: number, maxAgeMinutes = 30): boolean {
  const ageMinutes = getCacheAgeMinutes(cachedAt);
  return ageMinutes > maxAgeMinutes;
}
