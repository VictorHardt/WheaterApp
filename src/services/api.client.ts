import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';

export class WeatherApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

export const apiClient = axios.create({
  baseURL: ENV.WEATHER_BASE_URL,
  timeout: 10000, // 10 segundos
});

// Interceptor de request para injetar a API key
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.params = config.params || {};
    config.params.key = ENV.WEATHER_API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para tratamento padrão de erros
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ error?: { message?: string; code?: number } }>) => {
    let errorMessage = 'Ocorreu um erro inesperado na API de clima.';
    let errorCode = undefined;

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || errorMessage;
      errorCode = error.response.data.error.code?.toString();
    } else if (error.request) {
      errorMessage = 'Não foi possível conectar à API de clima. Verifique sua conexão.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(new WeatherApiError(errorMessage, errorCode));
  }
);
