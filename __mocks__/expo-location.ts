export const getCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
    altitude: null,
    accuracy: 100,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
});
