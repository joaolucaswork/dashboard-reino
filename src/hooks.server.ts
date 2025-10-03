import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Carregar as variáveis de ambiente
  const response = await resolve(event);
  return response;
};