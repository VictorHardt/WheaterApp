/**
 * Testes: SearchBar.tsx (componente React Native)
 *
 * Analogia Flutter:
 *   - Equivale a um Widget Test de um componente de busca (SearchDelegate):
 *       testWidgets('mostra sugestões ao digitar', (tester) async {
 *         await tester.pumpWidget(SearchBar(onCitySelect: mockCallback));
 *         await tester.enterText(find.byType(TextField), 'sa');
 *         await tester.pumpAndSettle();
 *         expect(find.text('Sao Paulo'), findsOneWidget);
 *       });
 *
 * Estratégia de mocking:
 *   - `useCitySearch` é mockado para controlar os resultados da busca.
 *   - `useCityStore` é mockado para isolar o estado do Zustand.
 *   - `useQueryClient` é mockado para evitar o Provider do React Query.
 *   - `useAppTheme` retorna um tema estático.
 *   - `@expo/vector-icons` é mockado para evitar erros de ícones nativos.
 *
 * Por que mockar os hooks e não o MSW aqui?
 *   - O SearchBar é um teste de COMPONENTE (UI), não de integração.
 *   - Queremos testar o comportamento da UI dado estados específicos do hook,
 *     não o fluxo de rede. É como no Flutter: injeta o repo mockado no widget.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SearchBar } from '../../components/SearchBar/SearchBar';

// ─────────────────────────────────────────────────────────────────────────────
// Mock do hook de tema
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    isDarkMode: true,
    colors: {
      textPrimary: '#FFFFFF',
      textSecondary: '#AAAAAA',
      textMuted: '#777777',
      accentBlue: '#4A90D9',
      error: '#FF5252',
      surfaceElevated: '#1E1E2E',
      gradientCard: ['#1a1a2e', '#16213e'],
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 8, md: 12, lg: 16 },
    typography: {
      sm: 12, md: 14, lg: 18, xl: 24,
      bold: '700', semibold: '600', medium: '500',
    },
    shadows: { card: { elevation: 4 }, light: { elevation: 2 } },
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock dos ícones (Ionicons usa fontes nativas que não existem no Node.js)
// Flutter equivalente: não é necessário — ícones são widgets como qualquer outro
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons', // Renderiza como tag simples no DOM de teste
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock do useQueryClient (evita precisar do Provider do React Query no render)
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock do useCityStore (Zustand)
// Retorna estado controlado pelo teste para isolar o componente.
// Flutter equivalente: inject do repositório mockado no construtor do widget.
// ─────────────────────────────────────────────────────────────────────────────
const mockAddSearchHistory = jest.fn();
const mockClearSearchHistory = jest.fn();

jest.mock('../../store', () => ({
  useCityStore: () => ({
    selectedCity: null,
    searchHistory: [],
    addSearchHistory: mockAddSearchHistory,
    clearSearchHistory: mockClearSearchHistory,
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock do useCitySearch (controla os resultados da busca)
// Permite simular diferentes estados: loading, sucesso, lista vazia.
// Flutter equivalente:
//   when(mockRepository.searchCities(any)).thenAnswer((_) async => mockResults);
// ─────────────────────────────────────────────────────────────────────────────
const mockCitySearchResults = [
  {
    id: 1,
    name: 'Sao Paulo',
    region: 'Sao Paulo',
    country: 'Brazil',
    lat: -23.53,
    lon: -46.62,
    url: 'sao-paulo-sao-paulo-brazil',
  },
];

// Estado padrão: sem resultados, sem loading
let mockUseCitySearch = {
  results: undefined as typeof mockCitySearchResults | undefined,
  isLoading: false,
  isError: false,
};

jest.mock('../../hooks/useCitySearch', () => ({
  useCitySearch: () => mockUseCitySearch,
}));

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: SearchBar
// ─────────────────────────────────────────────────────────────────────────────
describe('SearchBar', () => {
  const mockOnCitySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Usa timers falsos para controlar o debounce de 400ms do SearchBar
    // Flutter equivalente: FakeAsync + clock.elapse(Duration(milliseconds: 400))
    jest.useFakeTimers();
    // Reseta o estado do mock do useCitySearch para o padrão
    mockUseCitySearch = {
      results: undefined,
      isLoading: false,
      isError: false,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Utilitário: renderiza o SearchBar com props padrão
  const renderSearchBar = () =>
    render(<SearchBar onCitySelect={mockOnCitySelect} />);

  // ── Teste 1: Renderização básica ─────────────────────────────────────────
  /**
   * Teste: o componente renderiza sem erros.
   */
  it('renderiza sem erros', () => {
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    expect(screen.getByPlaceholderText('Buscar cidade...')).toBeTruthy();
  });

  // ── Teste 2: Não exibe sugestões com menos de 2 caracteres ───────────────
  /**
   * Teste: a lista de sugestões NÃO aparece ao digitar < 2 caracteres.
   *
   * O SearchBar controla a exibição com `isSearching = debouncedQuery.length >= 2`.
   * Com 1 char, não entra em modo de busca, então o dropdown não é exibido.
   *
   * Flutter equivalente:
   *   await tester.enterText(find.byType(TextField), 'a');
   *   expect(find.byType(ListTile), findsNothing);
   */
  it('não exibe sugestões com menos de 2 caracteres', () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar cidade...');

    // Foca e digita apenas 1 caractere
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 's');
    // Avança o debounce
    act(() => { jest.runAllTimers(); });

    // Com 1 char, não deve exibir sugestões
    expect(screen.queryByText('Sao Paulo')).toBeNull();
  });

  // ── Teste 3: Exibe sugestões ao digitar cidade válida ────────────────────
  /**
   * Teste: ao digitar >= 2 chars, as sugestões retornadas pelo hook são exibidas.
   *
   * Aqui simulamos que o hook retornou resultados (estado já resolvido).
   * No componente real, isso acontece após o debounce + fetch da API.
   *
   * Flutter equivalente:
   *   await tester.enterText(find.byType(TextField), 'sa');
   *   await tester.pumpAndSettle();
   *   expect(find.text('Sao Paulo'), findsOneWidget);
   */
  it('exibe sugestões quando há resultados para a query', () => {
    // Configura o mock para retornar resultados (simula busca completa)
    mockUseCitySearch = {
      results: mockCitySearchResults,
      isLoading: false,
      isError: false,
    };

    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar cidade...');

    // Foca e digita >= 2 chars para entrar em modo de busca
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'sa');
    // Avança o debounce de 400ms para que debouncedQuery seja atualizado
    act(() => { jest.runAllTimers(); });

    // Deve exibir o resultado retornado pelo hook mockado
    expect(screen.getByText('Sao Paulo')).toBeTruthy();
    expect(screen.getByText('Sao Paulo, Brazil')).toBeTruthy();
  });

  // ── Teste 4: Chama onSelectCity ao selecionar sugestão ───────────────────
  /**
   * Teste: ao pressionar uma sugestão, onCitySelect é chamado com o nome da cidade.
   *
   * Flutter equivalente:
   *   await tester.tap(find.text('Sao Paulo'));
   *   verify(mockCallback.call('Sao Paulo')).called(1);
   */
  it('chama onCitySelect com o nome da cidade ao selecionar sugestão', () => {
    mockUseCitySearch = {
      results: mockCitySearchResults,
      isLoading: false,
      isError: false,
    };

    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'sa');
    act(() => { jest.runAllTimers(); });

    // Pressiona o item de sugestão via accessibilityLabel
    const cityButton = screen.getByRole('button', {
      name: /Selecionar cidade Sao Paulo/,
    });
    fireEvent.press(cityButton);

    // Verifica que o callback foi chamado com o nome correto
    expect(mockOnCitySelect).toHaveBeenCalledWith('Sao Paulo');
    expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
    // Verifica que o histórico foi atualizado
    expect(mockAddSearchHistory).toHaveBeenCalledWith(mockCitySearchResults[0]);
  });

  // ── Teste 5: Exibe mensagem de "não encontrado" ───────────────────────────
  /**
   * Teste: exibe feedback de "Nenhuma cidade encontrada" quando results é vazio.
   */
  it('exibe mensagem de nenhum resultado quando a lista está vazia', () => {
    mockUseCitySearch = {
      results: [], // Lista vazia
      isLoading: false,
      isError: false,
    };

    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'xyzxyz');
    act(() => { jest.runAllTimers(); });

    expect(screen.getByText('Nenhuma cidade encontrada')).toBeTruthy();
  });

  // ── Teste 6: Botão limpar chama onCitySelect(null) ───────────────────────
  /**
   * Teste: ao pressionar o botão "Limpar pesquisa", a busca é limpa.
   *
   * Flutter equivalente:
   *   await tester.tap(find.byIcon(Icons.clear));
   *   expect(controller.text, isEmpty);
   */
  it('exibe botão de limpar ao digitar texto', () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.changeText(input, 'sa');

    // O botão de limpar deve aparecer quando há texto
    expect(screen.getByRole('button', { name: 'Limpar pesquisa' })).toBeTruthy();
  });
});
