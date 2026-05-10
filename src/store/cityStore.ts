import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CityState {
  selectedCity: string | null;
  lastUpdated: number | null;
  setSelectedCity: (city: string | null) => void;
  setLastUpdated: (timestamp: number) => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      lastUpdated: null,
      setSelectedCity: (city) => set({ selectedCity: city }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
    }),
    {
      name: 'weather-city-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
