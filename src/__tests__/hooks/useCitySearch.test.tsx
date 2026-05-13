/**
 * Testes: useCitySearch.ts (TanStack Query hook)
 *
 * Analogia Flutter:
 *   - Equivale a testes de um SearchDelegate ou AutocompleteField no Flutter.
 *   - O controle `enabled: query.length >= 2` é como um validator no formulário:
 *       if (query.length < 2) return; // não busca
 *   - Os handlers MSW fazem o papel do mockHttp no Mockito.
 *
 * Estratégia:
 *   - query com < 2 chars → `enabled: false` → a query não roda.
 *   - query com >= 2 chars → `enabled: true` → retorna resultados do MSW.
 *   - query sem resultados → MSW retorna lista vazia.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import { rest } from 'msw';
import { useCitySearch } from '../../hooks/useCitySearch';

// ─────────────────────────────────────────────────────────────────────────────
// Factories: queryClient e wrapper sem retry para testes rápidos
// ─────────────────────────────────────────────────────────────────────────────
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: useCitySearch
// ─────────────────────────────────────────────────────────────────────────────
describe('useCitySearch', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ── Teste 1: Não busca com menos de 2 caracteres ──────────────────────────
  /**
   * Teste: o hook não dispara a query quando query.length < 2.
   *
   * `enabled: query.length >= 2` → com 0 ou 1 char, a busca não ocorre.
   * Isso é a lógica de "debounce mínimo por tamanho", análoga a:
   *   if (query.length < 2) { suggestions.clear(); return; }
   *
   * Flutter equivalente:
   *   await tester.enterText(find.byType(TextField), 'a');
   *   verify(mockRepository.searchCities(any)).called(0);
   */
  it('não busca quando query tem 0 caracteres', () => {
    const { result } = renderHook(() => useCitySearch(''), {
      wrapper: createWrapper(queryClient),
    });

    // Disabled query: não carrega, sem dados, sem erro
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('não busca quando query tem apenas 1 caractere', () => {
    const { result } = renderHook(() => useCitySearch('s'), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toBeUndefined();
  });

  // ── Teste 2: Retorna sugestões com query válida ───────────────────────────
  /**
   * Teste: retorna lista de cidades quando a query tem >= 2 caracteres.
   *
   * O handler MSW padrão retorna um array com "Sao Paulo".
   *
   * Flutter equivalente:
   *   await tester.enterText(find.byType(TextField), 'sa');
   *   await tester.pumpAndSettle();
   *   expect(find.text('Sao Paulo'), findsOneWidget);
   */
  it('retorna sugestões ao digitar uma cidade válida (>= 2 chars)', async () => {
    const { result } = renderHook(() => useCitySearch('sa'), {
      wrapper: createWrapper(queryClient),
    });

    // Durante o fetch, isLoading pode ser true
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.results).toBeDefined();
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results?.[0].name).toBe('Sao Paulo');
    expect(result.current.results?.[0].country).toBe('Brazil');
  });

  // ── Teste 3: Lista vazia para cidade inexistente ──────────────────────────
  /**
   * Teste: retorna lista vazia quando a API não encontra resultados.
   *
   * Flutter equivalente:
   *   when(mockRepository.searchCities('xyz')).thenAnswer((_) async => []);
   *   expect(viewModel.suggestions, isEmpty);
   */
  it('retorna lista vazia para cidade inexistente', async () => {
    server.use(
      rest.get('https://api.weatherapi.com/v1/search.json', (_req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    const { result } = renderHook(() => useCitySearch('xyzxyz'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toEqual([]);
  });

  // ── Teste 4: Estado de erro ───────────────────────────────────────────────
  /**
   * Teste: isError é true quando a API retorna erro.
   */
  it('seta isError quando a API retorna erro', async () => {
    server.use(
      rest.get('https://api.weatherapi.com/v1/search.json', (_req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: { code: 1006, message: 'Error' } })
        );
      })
    );

    const { result } = renderHook(() => useCitySearch('sao'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.results).toBeUndefined();
  });

  // ── Teste 5: Transição de query inválida → válida ─────────────────────────
  /**
   * Teste: quando query passa de 1 para 2+ chars, a busca é disparada.
   */
  it('dispara a busca ao transitar de 1 para 2 caracteres', async () => {
    // Começa com 1 char (disabled)
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useCitySearch(query),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { query: 's' },
      }
    );

    expect(result.current.results).toBeUndefined();

    // Atualiza para 2 chars (enabled)
    rerender({ query: 'sa' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toHaveLength(1);
  });
});
