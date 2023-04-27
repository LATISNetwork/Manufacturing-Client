import { verifyAuth } from '$lib/auth/util';
import admin from '$lib/firebase-admin';
import type { RequestHandler } from './$types';
import { getUserData } from './get-user';
// given a user's uid, return their user data
export const GET = (async ({ fetch, cookies }) => {
  const userData = await getUserData(fetch, cookies, admin);
  return new Response(JSON.stringify(userData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}) satisfies RequestHandler;
