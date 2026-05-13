/**
 * Testes: useWeather.ts (TanStack Query hook)
 *
 * Analogia Flutter:
 *   - Equivale a testes de ViewModel/Provider no Flutter.
 *   - O `renderHook` é como instanciar um ViewModel e observar seus estados:
 *       final viewModel = WeatherViewModel(mockRepository);
 *       expect(viewModel.state, isA<LoadingState>());
 *       await viewModel.fetchForecast();
 *       expect(viewModel.state, isA<SuccessState>());
 *   - O `QueryClientProvider` é um wrapper obrigatório (igual ao ChangeNotifierProvider
 *     no Flutter), pois o hook depende do contexto do React Query.
 *   - `waitFor` é equivalente ao `await pumpAndSettle()` nos widget tests do Flutter.
 *
 * Estratégia:
 *   - Sucesso → o handler MSW padrão retorna o forecastFixture.
 *   - Erro + cache → sobrescrevemos o handler para simular falha de rede E
 *     configuramos o AsyncStorage mock para retornar dados em cache.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import { rest } from 'msw';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWeather } from '../../hooks/useWeather';
import { forecastFixture } from '../fixtures/forecast.fixture';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ─────────────────────────────────────────────────────────────────────────────
// Factory: cria um QueryClient configurado para testes.
// Desativamos retries para que os erros sejam propagados imediatamente.
// Flutter equivalente: setUp(() { mockRepository = MockWeatherRepository(); });
// ─────────────────────────────────────────────────────────────────────────────
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Sem retentativas para testes falharem rápido
        gcTime: 0,    // Sem garbage collection delay (era cacheTime no v4)
      },
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
// Factory: wrapper que envolve o hook com o Provider necessário.
// É o equivalente ao tester.pumpWidget(ChangeNotifierProvider(...)) no Flutter.
// ─────────────────────────────────────────────────────────────────────────────
const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: useWeather
// ─────────────────────────────────────────────────────────────────────────────
describe('useWeather', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ── Teste 1: Estado de loading ────────────────────────────────────────────
  /**
   * Teste: o hook inicia em estado de loading quando location é fornecida.
   *
   * Flutter equivalente:
   *   expect(find.byType(CircularProgressIndicator), findsOneWidget);
   *   // ou
   *   expect(viewModel.state, isA<LoadingState>());
   */
  it('inicia com isLoading = true ao receber uma location válida', () => {
    const { result } = renderHook(() => useWeather('Sao Paulo'), {
      wrapper: createWrapper(queryClient),
    });

    // No primeiro render, antes da query completar, deve estar carregando
    expect(result.current.isLoading).toBe(true);
    expect(result.current.forecast).toBeUndefined();
  });

  // ── Teste 2: Não busca quando location é null ─────────────────────────────
  /**
   * Teste: o hook não inicia busca quando location é null.
   *
   * A query tem `enabled: !!location`, então com null não deve carregar.
   */
  it('não carrega quando location é null', () => {
    const { result } = renderHook(() => useWeather(null), {
      wrapper: createWrapper(queryClient),
    });

    // enabled = false → não está carregando
    expect(result.current.isLoading).toBe(false);
    expect(result.current.forecast).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  // ── Teste 3: Sucesso com dados da API ─────────────────────────────────────
  /**
   * Teste: o hook retorna os dados de previsão após sucesso da API.
   *
   * O handler MSW padrão retorna o forecastFixture, então apenas aguardamos
   * o estado mudar de loading para success.
   *
   * Flutter equivalente:
   *   when(mockRepository.getForecast(any)).thenAnswer((_) async => forecastModel);
   *   await tester.pumpAndSettle();
   *   expect(viewModel.forecast, isNotNull);
   *   expect(viewModel.forecast!.location.name, equals('Sao Paulo'));
   */
  it('retorna os dados de previsão após sucesso da API', async () => {
    // Garante que saveForecastCache não quebre o teste
    mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useWeather('Sao Paulo'), {
      wrapper: createWrapper(queryClient),
    });

    // Aguarda o hook sair do estado de loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.forecast).toBeDefined();
    expect(result.current.forecast?.location.name).toBe('Sao Paulo');
    expect(result.current.forecast?.current.temp_c).toBe(25.0);
    expect(result.current.isFromCache).toBe(false);
    expect(result.current.lastUpdated).toBe(1715562000 * 1000);
  });

  // ── Teste 4: Erro da API ──────────────────────────────────────────────────
  /**
   * Teste: o hook exibe isError quando a API falha e não há cache.
   *
   * Sobrescrevemos o handler para retornar erro 500.
   * O AsyncStorage retorna null (sem cache disponível).
   *
   * Flutter equivalente:
   *   when(mockRepository.getForecast(any)).thenThrow(NetworkException());
   *   expect(viewModel.state, isA<ErrorState>());
   */
  it('seta isError quando a API falha e não há cache', async () => {
    // Simula falha de rede
    server.use(
      rest.get('https://api.weatherapi.com/v1/forecast.json', (_req, res) => {
        return res.networkError('Network error');
      })
    );
    // Sem cache disponível
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useWeather('Sao Paulo'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.forecast).toBeUndefined();
  });

  // ── Teste 5: Fallback para cache quando offline ───────────────────────────
  /**
   * Teste: retorna dados do cache (isFromCache: true) quando a API falha.
   *
   * Simula o cenário "usuário offline com cache disponível".
   * A lógica no hook: catch(error) → loadForecastCache → retorna se existir.
   *
   * Flutter equivalente (estratégia offline-first):
   *   when(mockRepository.getForecast(any)).thenThrow(SocketException(''));
   *   when(mockCacheRepo.load('sao paulo')).thenAnswer((_) async => cachedModel);
   *   expect(viewModel.forecast, isNotNull);
   *   expect(viewModel.isFromCache, isTrue);
   */
  it('usa dados do cache quando offline (API falha + cache existe)', async () => {
    // Simula falha de rede
    server.use(
      rest.get('https://api.weatherapi.com/v1/forecast.json', (_req, res) => {
        return res.networkError('Network error');
      })
    );

    // Simula cache disponível no AsyncStorage
    const cachedData = {
      data: forecastFixture,
      cachedAt: Date.now() - 10 * 60 * 1000, // 10 minutos atrás
      cityName: 'Sao Paulo',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useWeather('Sao Paulo'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Com cache disponível, não deve ser erro
    expect(result.current.isError).toBe(false);
    expect(result.current.forecast).toBeDefined();
    expect(result.current.forecast?.location.name).toBe('Sao Paulo');
    // Indicador de cache deve estar ativo
    expect(result.current.isFromCache).toBe(true);
  });
});
