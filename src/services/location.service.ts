import * as Location from 'expo-location';

/**
 * Verifica e solicita permissão de localização usando expo-location.
 */
export async function requestLocationPermission(): Promise<Location.PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

/**
 * Retorna { lat, lon } ou null se a permissão foi negada/indisponível.
 * Lida com granted, denied, unavailable de forma defensiva sem lançar exceções.
 */
export async function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  try {
    const status = await requestLocationPermission();

    if (status !== Location.PermissionStatus.GRANTED) {
      // Casos: DENIED, UNDETERMINED
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    };
  } catch (error) {
    // Caso ocorra erro por serviço de localização desligado (unavailable)
    return null;
  }
}
