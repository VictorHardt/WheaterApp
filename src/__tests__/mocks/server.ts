import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configura um servidor de interceptação de requisições (Mock Service Worker) com os handlers definidos
export const server = setupServer(...handlers);
