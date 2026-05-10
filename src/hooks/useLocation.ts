import { useState, useEffect, useCallback } from 'react';
import * as locationService from '../services';

export interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  isLoading: boolean;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    coords: null,
    permissionStatus: 'undetermined',
    isLoading: true,
  });

  const requestPermissionAndLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const status = await locationService.requestLocationPermission();
      if (status !== 'granted') {
        setState({
          coords: null,
          permissionStatus: 'denied',
          isLoading: false,
        });
        return;
      }

      const location = await locationService.getCurrentLocation();
      if (!location) {
        setState({
          coords: null,
          permissionStatus: 'denied',
          isLoading: false,
        });
        return;
      }

      setState({
        coords: {
          latitude: location.lat,
          longitude: location.lon,
        },
        permissionStatus: 'granted',
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching location', error);
      setState({
        coords: null,
        permissionStatus: 'denied',
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    requestPermissionAndLocation();
  }, [requestPermissionAndLocation]);

  return {
    ...state,
    requestPermission: requestPermissionAndLocation,
  };
};
