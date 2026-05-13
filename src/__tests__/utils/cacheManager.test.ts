/**
 * Testes: cacheManager.ts
 *
 * Analogia Flutter:
 *   - Equivale a testes unitários puros (sem UI) de um serviço de cache local.
 *   - O mock do AsyncStorage é como mockar SharedPreferences ou Hive no Flutter:
 *       when(mockStorage.getString(any)).thenReturn(null);
 *   - Para testar funções que dependem de `Date.now()`, usamos `jest.spyOn`
 *     para "congelar o tempo", equivalente a:
 *       final clock = MockClock(); when(clock.now()).thenReturn(fixedDate);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveForecastCache,
  loadForecastCache,
  getCacheAgeMinutes,
  isCacheStale,
} from '../../utils/cacheManager';
import { forecastFixture } from '../fixtures/forecast.fixture';

// Acessa o mock gerado pelo Jest para o AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Reseta o estado dos mocks antes de cada teste para garantir isolamento
beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: saveForecastCache
// ─────────────────────────────────────────────────────────────────────────────
describe('saveForecastCache', () => {
  /**
   * Teste: saveForecastCache salva os dados serializados no AsyncStorage.
   *
   * Verificamos que:
   * 1. AsyncStorage.setItem foi chamado exatamente uma vez.
   * 2. A chave (key) segue o padrão esperado `forecast_cache_{cidade}`.
   * 3. O valor (value) é uma string JSON que contém os dados e o `cachedAt`.
   *
   * Flutter equivalente:
   *   verify(mockStorage.setString('forecast_cache_sao paulo', any)).called(1);
   */
  it('chama AsyncStorage.setItem com a chave e valor corretos', async () => {
    // Garante que setItem resolve sem erro
    mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);

    await saveForecastCache('Sao Paulo', forecastFixture as any);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);

    // Verifica a chave: deve ser lowercase e com o prefixo correto
    const [key, value] = mockAsyncStorage.setItem.mock.calls[0];
    expect(key).toBe('forecast_cache_sao paulo');

    // Verifica que o valor é JSON válido com os campos esperados
    const parsed = JSON.parse(value);
    expect(parsed).toHaveProperty('data');
    expect(parsed).toHaveProperty('cachedAt');
    expect(parsed).toHaveProperty('cityName', 'Sao Paulo');
    expect(parsed.data.location.name).toBe('Sao Paulo');
  });

  /**
   * Teste: saveForecastCache não lança erro quando o AsyncStorage falha.
   *
   * A função deve capturar o erro internamente (try/catch) para não
   * interromper o fluxo da aplicação caso o storage esteja cheio ou indisponível.
   */
  it('não lança erro se o AsyncStorage falhar (erro silencioso)', async () => {
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));

    // Não deve lançar erro — apenas logar no console
    await expect(
      saveForecastCache('Sao Paulo', forecastFixture as any)
    ).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: loadForecastCache
// ─────────────────────────────────────────────────────────────────────────────
describe('loadForecastCache', () => {
  /**
   * Teste: loadForecastCache retorna null quando não há cache.
   *
   * O mock padrão do AsyncStorage retorna null para getItem,
   * simulando um cache vazio (primeira abertura do app, por exemplo).
   */
  it('retorna null quando não há cache para a cidade', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await loadForecastCache('CidadeSemCache');

    expect(result).toBeNull();
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
      'forecast_cache_cidadesemcache'
    );
  });

  /**
   * Teste: loadForecastCache retorna os dados do cache quando existem.
   *
   * Simulamos que o AsyncStorage possui um valor salvo (JSON serializado).
   */
  it('retorna os dados do cache quando existem', async () => {
    const cachedData = {
      data: forecastFixture,
      cachedAt: Date.now(),
      cityName: 'Sao Paulo',
    };
    mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedData));

    const result = await loadForecastCache('Sao Paulo');

    expect(result).not.toBeNull();
    expect(result?.cityName).toBe('Sao Paulo');
    expect(result?.data.location.name).toBe('Sao Paulo');
    expect(result?.cachedAt).toBeDefined();
  });

  /**
   * Teste: loadForecastCache retorna null quando o AsyncStorage lança erro.
   */
  it('retorna null silenciosamente se o AsyncStorage falhar', async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

    const result = await loadForecastCache('Sao Paulo');

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: getCacheAgeMinutes
// ─────────────────────────────────────────────────────────────────────────────
describe('getCacheAgeMinutes', () => {
  /**
   * Teste: getCacheAgeMinutes retorna o número de minutos correto.
   *
   * Usamos jest.spyOn para "congelar o tempo" e garantir um resultado
   * determinístico, independente de quando o teste rodar.
   *
   * Flutter equivalente:
   *   final fixedNow = DateTime(2026, 5, 12, 22, 0);
   *   when(mockClock.now()).thenReturn(fixedNow);
   *   final age = cacheManager.getCacheAgeMinutes(fixedNow.subtract(Duration(minutes: 15)));
   *   expect(age, 15);
   */
  it('retorna 0 quando o cache acabou de ser salvo', () => {
    const now = Date.now();
    // cachedAt = agora → diferença de 0 minutos
    const age = getCacheAgeMinutes(now);
    expect(age).toBe(0);
  });

  it('retorna o número correto de minutos decorridos', () => {
    // Congela o tempo em um valor fixo
    const fixedNow = 1_000_000_000_000; // timestamp fixo em ms
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const twentyMinutesAgo = fixedNow - 20 * 60 * 1000;
    const age = getCacheAgeMinutes(twentyMinutesAgo);

    expect(age).toBe(20);

    // Restaura Date.now() para o comportamento real
    jest.restoreAllMocks();
  });

  it('retorna 60 para um cache salvo há 1 hora', () => {
    const fixedNow = 1_000_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const oneHourAgo = fixedNow - 60 * 60 * 1000;
    const age = getCacheAgeMinutes(oneHourAgo);

    expect(age).toBe(60);

    jest.restoreAllMocks();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: isCacheStale
// ─────────────────────────────────────────────────────────────────────────────
describe('isCacheStale', () => {
  /**
   * Teste: isCacheStale retorna false para cache recente (< 30 min).
   */
  it('retorna false para cache com menos de 30 minutos', () => {
    const fixedNow = 1_000_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const fifteenMinutesAgo = fixedNow - 15 * 60 * 1000;
    const stale = isCacheStale(fifteenMinutesAgo);

    expect(stale).toBe(false);

    jest.restoreAllMocks();
  });

  /**
   * Teste: isCacheStale retorna true para cache com mais de 30 minutos.
   *
   * Flutter equivalente:
   *   expect(cacheManager.isCacheStale(cachedAt: oldTimestamp), isTrue);
   */
  it('retorna true para cache com mais de 30 minutos (padrão)', () => {
    const fixedNow = 1_000_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const thirtyOneMinutesAgo = fixedNow - 31 * 60 * 1000;
    const stale = isCacheStale(thirtyOneMinutesAgo);

    expect(stale).toBe(true);

    jest.restoreAllMocks();
  });

  /**
   * Teste: isCacheStale respeita o parâmetro maxAgeMinutes customizado.
   */
  it('usa o maxAgeMinutes customizado quando fornecido', () => {
    const fixedNow = 1_000_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const tenMinutesAgo = fixedNow - 10 * 60 * 1000;

    // Com limite de 5 min → stale = true
    expect(isCacheStale(tenMinutesAgo, 5)).toBe(true);
    // Com limite de 60 min → stale = false
    expect(isCacheStale(tenMinutesAgo, 60)).toBe(false);

    jest.restoreAllMocks();
  });

  /**
   * Teste: isCacheStale retorna true exatamente na fronteira de 30 minutos.
   * (30 minutos não é > 30, então é false. 31 minutos é > 30, então true.)
   */
  it('retorna false exatamente em 30 minutos (fronteira)', () => {
    const fixedNow = 1_000_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const exactlyThirtyMinutesAgo = fixedNow - 30 * 60 * 1000;
    // Math.floor(30 * 60 * 1000 / 60000) = 30. 30 > 30 = false
    const stale = isCacheStale(exactlyThirtyMinutesAgo);

    expect(stale).toBe(false);

    jest.restoreAllMocks();
  });
});
