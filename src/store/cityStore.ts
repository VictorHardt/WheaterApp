import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CitySearchResult } from '../types';

interface CityState {
  selectedCity: string | null;
  lastUpdated: number | null;
  searchHistory: CitySearchResult[];
  setSelectedCity: (city: string | null) => void;
  setLastUpdated: (timestamp: number) => void;
  addSearchHistory: (city: CitySearchResult) => void;
  clearSearchHistory: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      lastUpdated: null,
      searchHistory: [],
      setSelectedCity: (city) => set({ selectedCity: city }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      addSearchHistory: (city) => set((state) => {
        // Remove duplicata se já existir e coloca no topo
        const filtered = state.searchHistory.filter(c => c.id !== city.id);
        return { searchHistory: [city, ...filtered].slice(0, 10) }; // Mantém os últimos 10
      }),
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'weather-city-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
