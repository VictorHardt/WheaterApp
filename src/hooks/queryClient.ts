import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos: os dados são considerados frescos por 5min
      retry: 1, // Tentar 1 vez em caso de erro antes de falhar
      gcTime: 30 * 60 * 1000, // 30 minutos: tempo que os dados inativos ficam em cache (antigo cacheTime)
    },
  },
});
