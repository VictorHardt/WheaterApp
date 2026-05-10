export const ENV = {
  WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '',
  WEATHER_BASE_URL: process.env.EXPO_PUBLIC_WEATHER_BASE_URL ?? 'https://api.weatherapi.com/v1',
};

if (!ENV.WEATHER_API_KEY) {
  console.warn(
    '⚠️ WARNING: EXPO_PUBLIC_WEATHER_API_KEY is not set in the .env file. The application may not function correctly without a valid API key.'
  );
}
