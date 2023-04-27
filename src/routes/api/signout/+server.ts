import type { RequestHandler } from './$types';
import { updateAuthCookies } from '$lib/auth/util';

export const POST = (async ({ cookies }) => {
  updateAuthCookies(cookies, '', '');
  return new Response('{}', {
    status: 200,
    headers: {
      'cache-control': 'no-store'
    }
  });
}) satisfies RequestHandler;
