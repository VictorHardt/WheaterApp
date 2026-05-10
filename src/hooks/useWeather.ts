import { useQuery } from '@tanstack/react-query';
import * as weatherService from '../services';
import * as cacheManager from '../utils';

export const useWeather = (location: string | null) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['weather', location],
    queryFn: async () => {
      if (!location) throw new Error('Location is required');
      try {
        const response = await weatherService.getForecast(location);
        await cacheManager.saveForecastCache(location, response);
        return { forecast: response, isFromCache: false };
      } catch (error) {
        // Se erro E cache existe: retorna os dados do cache com isFromCache: true
        const cached = await cacheManager.loadForecastCache(location);
        if (cached) {
          return { forecast: cached.data, isFromCache: true };
        }
        throw error;
      }
    },
    enabled: !!location,
  });

  const forecast = data?.forecast;
  const isFromCache = data?.isFromCache ?? false;
  // Extrai o last_updated_epoch e converte de segundos para milissegundos
  const lastUpdated = forecast?.current?.last_updated_epoch 
    ? forecast.current.last_updated_epoch * 1000 
    : null;

  return {
    forecast,
    isLoading,
    isError,
    isFromCache,
    lastUpdated,
    refetch,
  };
};
