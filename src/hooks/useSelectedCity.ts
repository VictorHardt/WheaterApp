import { useCityStore } from '../store';
import { useLocation } from './useLocation';
import { useWeather } from './useWeather';

export const useSelectedCity = () => {
  const { selectedCity, setSelectedCity } = useCityStore();
  const location = useLocation();
  const { coords, permissionStatus, isLoading: isLocationLoading } = location;

  // Se selectedCity no store for null, usa coordenadas do GPS
  const locationQuery = selectedCity 
    ? selectedCity 
    : coords 
      ? `${coords.latitude},${coords.longitude}` 
      : null;

  // Se a permissão foi negada e não há cidade selecionada, o fallback pode ser aplicado na UI
  const weather = useWeather(locationQuery || (permissionStatus === 'denied' && !selectedCity ? 'São Paulo' : null));

  return {
    ...weather,
    selectedCity,
    setSelectedCity,
    permissionStatus,
    isLocationLoading,
  };
};
