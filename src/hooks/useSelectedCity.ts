import { useCityStore } from '../store';
import { useLocation } from './useLocation';
import { useWeather } from './useWeather';

export const useSelectedCity = () => {
  const { selectedCity, setSelectedCity } = useCityStore();
  const { coords } = useLocation();

  // Se selectedCity no store for null, usa coordenadas do GPS
  const locationQuery = selectedCity 
    ? selectedCity 
    : coords 
      ? `${coords.latitude},${coords.longitude}` 
      : null;

  const weather = useWeather(locationQuery);

  return {
    ...weather,
    selectedCity,
    setSelectedCity,
  };
};
