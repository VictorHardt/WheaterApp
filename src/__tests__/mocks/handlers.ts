import { rest } from 'msw';
import { forecastFixture } from '../fixtures/forecast.fixture';

export const handlers = [
  // Intercepta a requisição para a API de forecast e retorna o fixture
  // MSW v1: usa `rest` e `ctx.json()` em vez de `http` e `HttpResponse` (v2)
  rest.get('https://api.weatherapi.com/v1/forecast.json', (_req, res, ctx) => {
    return res(ctx.json(forecastFixture));
  }),

  // Intercepta a API de busca de cidades
  rest.get('https://api.weatherapi.com/v1/search.json', (_req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          name: 'Sao Paulo',
          region: 'Sao Paulo',
          country: 'Brazil',
          lat: -23.53,
          lon: -46.62,
          url: 'sao-paulo-sao-paulo-brazil',
        },
      ])
    );
  }),
];
