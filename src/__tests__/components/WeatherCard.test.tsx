/**
 * Testes: WeatherCard.tsx (componente React Native)
 *
 * Analogia Flutter:
 *   - Este arquivo equivale a um Widget Test no Flutter:
 *       testWidgets('WeatherCard renderiza temperatura', (tester) async {
 *         await tester.pumpWidget(WeatherCard(forecastDay: mockDay));
 *         expect(find.text('28°'), findsOneWidget);
 *         expect(find.text('Umidade: 60%'), findsOneWidget);
 *       });
 *   - `render` do RNTL ≈ `tester.pumpWidget()` no Flutter.
 *   - `screen.getByText(...)` ≈ `find.text(...)` no Flutter.
 *   - `fireEvent.press(...)` ≈ `tester.tap(find.byType(...))` no Flutter.
 *
 * Mocking:
 *   - WeatherCard usa `useAppTheme()`, que por sua vez usa `useColorScheme()`
 *     do React Native. Mockamos o hook inteiro para isolar o componente.
 *   - `expo-linear-gradient` precisa de mock para não quebrar no ambiente Node.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { WeatherCard } from '../../components/WeatherCard/WeatherCard';
import { forecastFixture } from '../fixtures/forecast.fixture';
import { ForecastDay } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock do hook de tema para evitar dependência do sistema operacional.
// Retorna um tema "dark" estático para garantir consistência nos testes.
// Flutter equivalente: final theme = ThemeData.dark(); // tema fixo nos testes
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    isDarkMode: true,
    colors: {
      textPrimary: '#FFFFFF',
      textSecondary: '#AAAAAA',
      textMuted: '#777777',
      gradientCard: ['#1a1a2e', '#16213e'],
      accentBlue: '#4A90D9',
      error: '#FF5252',
      surfaceElevated: '#1E1E2E',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 8, md: 12, lg: 16 },
    typography: {
      sm: 12, md: 14, lg: 18, xl: 24,
      bold: '700', semibold: '600', medium: '500',
    },
    shadows: {
      card: { elevation: 4 },
      light: { elevation: 2 },
    },
  }),
}));

// Mock do LinearGradient: substitui pelo View simples para facilitar renderização em Node.js
// Flutter equivalente: não é necessário pois os widgets são renderizados nativamente nos testes.
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures: extraímos o primeiro dia de previsão (hoje = 2026-05-12)
// ─────────────────────────────────────────────────────────────────────────────
const todayForecastDay = forecastFixture.forecast.forecastday[0] as unknown as ForecastDay;
const tomorrowForecastDay = forecastFixture.forecast.forecastday[1] as unknown as ForecastDay;
const dayAfterTomorrowForecastDay = forecastFixture.forecast.forecastday[2] as unknown as ForecastDay;

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: WeatherCard
// ─────────────────────────────────────────────────────────────────────────────
describe('WeatherCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Teste 1: Renderiza temperatura máxima e umidade ───────────────────────
  /**
   * Teste: o card exibe a temperatura máxima e a umidade corretamente.
   *
   * Os valores vêm do forecastFixture:
   *   - maxtemp_c: 28.0 → arredondado para "28°"
   *   - avghumidity: 60 → "Umidade: 60%"
   *
   * Flutter equivalente:
   *   expect(find.text('28°'), findsOneWidget);
   *   expect(find.text('Umidade: 60%'), findsOneWidget);
   */
  it('renderiza temperatura máxima corretamente', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    // Math.round(28.0)° = "28°"
    expect(screen.getByText('28°')).toBeTruthy();
  });

  it('renderiza temperatura mínima corretamente', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    // Math.round(18.0) = " / 18°" (formatado com " / ")
    expect(screen.getByText(/ 18°/)).toBeTruthy();
  });

  it('renderiza a umidade corretamente', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    // avghumidity: 60 → "Umidade: 60%"
    expect(screen.getByText('Umidade: 60%')).toBeTruthy();
  });

  it('renderiza a condição climática corretamente', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    expect(screen.getByText('Sunny')).toBeTruthy();
  });

  // ── Teste 2: Exibe "Hoje" para a data atual ───────────────────────────────
  /**
   * Teste: quando isToday = true, o label de data exibe "Hoje".
   *
   * A função `formatDate` em WeatherCard retorna 'Hoje' quando isToday = true,
   * independente da data real. Isso é análogo a:
   *   expect(find.text('Today'), findsOneWidget); // em inglês no Flutter
   */
  it('exibe "Hoje" quando isToday é true', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    expect(screen.getByText('Hoje')).toBeTruthy();
  });

  it('não exibe "Hoje" quando isToday é false', () => {
    render(
      <WeatherCard
        forecastDay={dayAfterTomorrowForecastDay}
        isToday={false}
        onPress={mockOnPress}
      />
    );

    expect(screen.queryByText('Hoje')).toBeNull();
  });

  // ── Teste 3: Chama onPress ao ser tocado ──────────────────────────────────
  /**
   * Teste: ao pressionar o card, a função onPress é chamada.
   *
   * Flutter equivalente:
   *   await tester.tap(find.byType(InkWell));
   *   verify(mockOnPressed()).called(1);
   */
  it('chama onPress quando o card é pressionado', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    // Clica no card usando o accessibilityLabel definido no componente
    fireEvent.press(screen.getByRole('button'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('onPress não é chamado sem interação', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  // ── Teste 4: Accessibility ────────────────────────────────────────────────
  /**
   * Teste: o card possui accessibilityRole="button" para acessibilidade.
   *
   * Flutter equivalente:
   *   expect(tester.getSemantics(find.byType(ElevatedButton)).label, contains('Previsão'));
   */
  it('tem accessibilityRole button para acessibilidade', () => {
    render(
      <WeatherCard
        forecastDay={todayForecastDay}
        isToday={true}
        onPress={mockOnPress}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });
});
