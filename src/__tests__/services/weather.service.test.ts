/**
 * Testes: weather.service.ts
 *
 * Analogia Flutter:
 *   - Este arquivo equivale a um teste unitário de Repository em Flutter.
 *   - O MSW (Mock Service Worker) faz o papel do Mockito + MockHttpClient:
 *     intercepta as chamadas HTTP na camada de rede, sem precisar de um servidor real.
 *   - Cada `server.use(http.get(...))` é análogo a:
 *       when(mockHttp.get(any)).thenAnswer((_) async => Response('...', 200));
 */

import { server } from '../mocks/server';
import { rest } from 'msw';
import { getForecast, searchCities } from '../../services/weather.service';
import { WeatherApiError } from '../../services/api.client';
import { forecastFixture } from '../fixtures/forecast.fixture';

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: getForecast
// ─────────────────────────────────────────────────────────────────────────────
describe('getForecast', () => {
  /**
   * Teste: getForecast retorna dados corretos quando a API responde com sucesso.
   *
   * O handler padrão (definido em handlers.ts) já devolve o forecastFixture,
   * então apenas chamamos a função e verificamos o resultado.
   *
   * Flutter equivalente:
   *   test('retorna WeatherModel quando http.get tem sucesso', () async {
   *     when(mockHttp.get(any)).thenAnswer((_) async => Response(jsonFixture, 200));
   *     final result = await repository.getForecast('Sao Paulo');
   *     expect(result.location.name, equals('Sao Paulo'));
   *   });
   */
  it('retorna dados de previsão quando a API responde com sucesso', async () => {
    const result = await getForecast('Sao Paulo');

    // Verifica estrutura principal da resposta
    expect(result.location.name).toBe('Sao Paulo');
    expect(result.current.temp_c).toBe(25.0);
    expect(result.current.humidity).toBe(60);

    // Verifica que os 3 dias de previsão foram retornados
    expect(result.forecast.forecastday).toHaveLength(3);
    expect(result.forecast.forecastday[0].date).toBe('2026-05-12');
  });

  /**
   * Teste: getForecast lança WeatherApiError quando a API retorna 400.
   *
   * Aqui sobrescrevemos o handler padrão para este teste específico usando
   * `server.use(...)`, que funciona como um "override temporário" — equivalente
   * a `when(mock.get(any)).thenThrow(...)` para um único teste.
   *
   * A WeatherApiError é lançada pelo interceptor do Axios em api.client.ts.
   */
  it('lança WeatherApiError quando a API retorna erro 400', async () => {
    // Sobrescreve o handler apenas para este teste
    server.use(
      rest.get('https://api.weatherapi.com/v1/forecast.json', (_req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: { code: 1006, message: 'No matching location found.' } })
        );
      })
    );

    // Verifica que a função lança a classe de erro correta
    await expect(getForecast('CidadeInexistente')).rejects.toThrow(WeatherApiError);
    await expect(getForecast('CidadeInexistente')).rejects.toThrow(
      'No matching location found.'
    );
  });

  /**
   * Teste: getForecast lança WeatherApiError quando a rede falha (sem resposta).
   *
   * `HttpResponse.error()` simula uma falha de rede (network error),
   * equivalente a um SocketException no Dart.
   */
  it('lança WeatherApiError quando a rede falha', async () => {
    server.use(
      rest.get('https://api.weatherapi.com/v1/forecast.json', (_req, res) => {
        // MSW v1: simula falha de rede retornando um erro de rede
        return res.networkError('Network error');
      })
    );

    await expect(getForecast('Sao Paulo')).rejects.toThrow(WeatherApiError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: searchCities
// ─────────────────────────────────────────────────────────────────────────────
describe('searchCities', () => {
  /**
   * Teste: searchCities retorna uma lista de cidades.
   *
   * O handler padrão em handlers.ts já retorna um array com "Sao Paulo".
   * Verificamos que a lista é retornada e tem a estrutura correta.
   *
   * Flutter equivalente:
   *   test('retorna lista de CityModel ao buscar "sao"', () async {
   *     when(mockHttp.get(any)).thenAnswer((_) async => Response(jsonList, 200));
   *     final results = await repository.searchCities('sao');
   *     expect(results, isA<List<CityModel>>());
   *     expect(results.first.name, equals('Sao Paulo'));
   *   });
   */
  it('retorna uma lista de cidades quando a busca tem sucesso', async () => {
    const results = await searchCities('sao');

    expect(results).toBeInstanceOf(Array);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Sao Paulo');
    expect(results[0].country).toBe('Brazil');
    expect(results[0].id).toBe(1);
  });

  /**
   * Teste: searchCities retorna lista vazia para cidade inexistente.
   */
  it('retorna lista vazia quando nenhuma cidade é encontrada', async () => {
    server.use(
      rest.get('https://api.weatherapi.com/v1/search.json', (_req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    const results = await searchCities('xyzxyzxyz');
    expect(results).toHaveLength(0);
  });

  /**
   * Teste: searchCities lança WeatherApiError quando a API retorna erro.
   */
  it('lança WeatherApiError quando a API retorna erro 400', async () => {
    server.use(
      rest.get('https://api.weatherapi.com/v1/search.json', (_req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: { code: 1006, message: 'Parameter q is missing.' } })
        );
      })
    );

    await expect(searchCities('')).rejects.toThrow(WeatherApiError);
  });
});
