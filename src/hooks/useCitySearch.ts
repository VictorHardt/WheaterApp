import { useQuery } from '@tanstack/react-query';
import * as weatherService from '../services';

export const useCitySearch = (query: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['city-search', query],
    queryFn: async () => {
      return weatherService.searchCities(query);
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 60 segundos
  });

  return {
    results: data,
    isLoading,
    isError,
  };
};
