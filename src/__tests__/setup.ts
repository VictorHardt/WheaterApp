import '@testing-library/jest-native/extend-expect';
import { server } from './mocks/server';

// Inicializa o servidor do MSW antes de todos os testes começarem
beforeAll(() => {
  server.listen({
    // Alerta no console caso haja alguma requisição não mockada
    onUnhandledRequest: 'warn',
  });
});

// Reseta os handlers após cada teste, garantindo que um teste não afete o outro
afterEach(() => {
  server.resetHandlers();
});

// Fecha o servidor quando todos os testes finalizarem
afterAll(() => {
  server.close();
});
