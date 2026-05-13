/**
 * Testes: cityStore.ts (Zustand)
 *
 * Analogia Flutter:
 *   - Equivale a testes unitários de um ViewModel/Cubit/Bloc no Flutter.
 *   - Testamos as actions do Zustand da mesma forma que testamos métodos
 *     de um Cubit: chamamos o método e verificamos o estado resultante.
 *   - Exemplo Flutter/Bloc:
 *       blocTest('emite CitySelected ao chamar setCity',
 *         build: () => CityBloc(),
 *         act: (bloc) => bloc.add(SetCityEvent('Sao Paulo')),
 *         expect: () => [CitySelected('Sao Paulo')],
 *       );
 *
 * Importante sobre Zustand com persist:
 *   O middleware `persist` do Zustand tenta ler/escrever no AsyncStorage.
 *   Como usamos o mock do AsyncStorage (em __mocks__/), isso é tratado
 *   automaticamente pelo Jest.
 */

import { act } from '@testing-library/react-native';
import { useCityStore } from '../../store/cityStore';

// ─────────────────────────────────────────────────────────────────────────────
// Utilitário: reseta o store para o estado inicial antes de cada teste.
// Isso evita que um teste "vaze" estado para o próximo.
// Flutter equivalente: setUp(() { bloc = CityBloc(); });
// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  act(() => {
    useCityStore.setState({
      selectedCity: null,
      lastUpdated: null,
      searchHistory: [],
    });
  });
});

const mockCity = {
  id: 1,
  name: 'Sao Paulo',
  region: 'Sao Paulo',
  country: 'Brazil',
  lat: -23.53,
  lon: -46.62,
  url: 'sao-paulo-sao-paulo-brazil',
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: Estado Inicial
// ─────────────────────────────────────────────────────────────────────────────
describe('Estado inicial', () => {
  /**
   * Teste: o estado inicial de selectedCity é null.
   *
   * Quando nenhuma cidade foi selecionada, o app usa a localização via GPS.
   * Flutter equivalente:
   *   expect(cityBloc.state.selectedCity, isNull);
   */
  it('selectedCity começa como null (modo GPS)', () => {
    const { selectedCity } = useCityStore.getState();
    expect(selectedCity).toBeNull();
  });

  it('lastUpdated começa como null', () => {
    const { lastUpdated } = useCityStore.getState();
    expect(lastUpdated).toBeNull();
  });

  it('searchHistory começa como lista vazia', () => {
    const { searchHistory } = useCityStore.getState();
    expect(searchHistory).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: setSelectedCity
// ─────────────────────────────────────────────────────────────────────────────
describe('setSelectedCity', () => {
  /**
   * Teste: setSelectedCity atualiza o estado com o nome da cidade.
   *
   * Flutter equivalente:
   *   bloc.add(SetCityEvent('Sao Paulo'));
   *   expect(bloc.state.selectedCity, equals('Sao Paulo'));
   */
  it('atualiza selectedCity com o nome da cidade selecionada', () => {
    act(() => {
      useCityStore.getState().setSelectedCity('Sao Paulo');
    });

    const { selectedCity } = useCityStore.getState();
    expect(selectedCity).toBe('Sao Paulo');
  });

  /**
   * Teste: setSelectedCity com null volta para o modo GPS.
   *
   * Quando o usuário limpa a seleção, o app volta a usar o GPS.
   */
  it('volta para null (modo GPS) ao passar null', () => {
    // Primeiro, seleciona uma cidade
    act(() => {
      useCityStore.getState().setSelectedCity('Rio de Janeiro');
    });
    expect(useCityStore.getState().selectedCity).toBe('Rio de Janeiro');

    // Depois, limpa a seleção
    act(() => {
      useCityStore.getState().setSelectedCity(null);
    });
    expect(useCityStore.getState().selectedCity).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: addSearchHistory
// ─────────────────────────────────────────────────────────────────────────────
describe('addSearchHistory', () => {
  /**
   * Teste: addSearchHistory adiciona uma cidade ao topo do histórico.
   */
  it('adiciona cidade ao topo do histórico de buscas', () => {
    act(() => {
      useCityStore.getState().addSearchHistory(mockCity);
    });

    const { searchHistory } = useCityStore.getState();
    expect(searchHistory).toHaveLength(1);
    expect(searchHistory[0].id).toBe(1);
    expect(searchHistory[0].name).toBe('Sao Paulo');
  });

  /**
   * Teste: addSearchHistory não duplica cidades já existentes no histórico.
   * A cidade existente é removida e re-inserida no topo.
   */
  it('remove duplicata e coloca a cidade no topo ao adicionar novamente', () => {
    const anotherCity = { ...mockCity, id: 2, name: 'Rio de Janeiro' };

    act(() => {
      useCityStore.getState().addSearchHistory(mockCity);
      useCityStore.getState().addSearchHistory(anotherCity);
      // Adiciona Sao Paulo novamente
      useCityStore.getState().addSearchHistory(mockCity);
    });

    const { searchHistory } = useCityStore.getState();
    // Sem duplicatas: apenas 2 cidades
    expect(searchHistory).toHaveLength(2);
    // Sao Paulo deve estar no topo (índice 0)
    expect(searchHistory[0].name).toBe('Sao Paulo');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: clearSearchHistory
// ─────────────────────────────────────────────────────────────────────────────
describe('clearSearchHistory', () => {
  /**
   * Teste: clearSearchHistory esvazia o histórico de buscas.
   */
  it('limpa o histórico de buscas', () => {
    // Adiciona uma cidade primeiro
    act(() => {
      useCityStore.getState().addSearchHistory(mockCity);
    });
    expect(useCityStore.getState().searchHistory).toHaveLength(1);

    // Limpa o histórico
    act(() => {
      useCityStore.getState().clearSearchHistory();
    });

    expect(useCityStore.getState().searchHistory).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO: setLastUpdated
// ─────────────────────────────────────────────────────────────────────────────
describe('setLastUpdated', () => {
  it('atualiza o timestamp de lastUpdated', () => {
    const timestamp = 1715562000000;

    act(() => {
      useCityStore.getState().setLastUpdated(timestamp);
    });

    expect(useCityStore.getState().lastUpdated).toBe(timestamp);
  });
});
