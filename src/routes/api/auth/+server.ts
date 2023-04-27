import admin from '$lib/firebase-admin';
import type { Cookies } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { updateAuthCookies } from '$lib/auth/util';
import type { RequestHandler } from './$types';
import { WEB_API_KEY } from '$lib/server/config';

const key = [WEB_API_KEY];

export const POST = (async ({ cookies, fetch, request }) => {
  const { email, password } = await request.json();
  const signIn_res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  if (!signIn_res.ok) return return401(cookies);
  const { refreshToken, localId } = await signIn_res.json();
  const customToken = await admin.auth().createCustomToken(localId);

  updateAuthCookies(cookies, customToken, refreshToken);

  // TODO: make this return consistent with GET
  const body = JSON.stringify({
    customToken: customToken
  });
  return new Response(body, {
    status: 200,
    headers: {
      'cache-control': 'no-store'
    }
  });
}) satisfies RequestHandler;

export const GET = (async ({ cookies }) => {
  // print cookies
  const refreshToken = cookies.get('refreshToken');
  console.log('refreshToken: ', refreshToken);
  let customToken = cookies.get('customToken');
  if (!refreshToken) return return401(cookies);
  let user: DecodedIdToken;
  try {
    if (!customToken) throw new Error();
    user = await admin.auth().verifyIdToken(customToken);
  } catch (e) {
    // if token is expired, exchange refresh token for new token
    const refresh_res = await fetch(`https://identitytoolkit.googleapis.com/v1/token?key=${key}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken })
    });
    if (!refresh_res.ok) return return401(cookies);
    const tokens = await refresh_res.json();
    const idToken = tokens['id_token'];
    if (tokens['refresh_token'] !== refreshToken) return return401(cookies);
    try {
      user = await admin.auth().verifyIdToken(idToken);
      customToken = await admin.auth().createCustomToken(user.uid);
      updateAuthCookies(cookies, customToken, null);
    } catch (e) {
      return return401(cookies);
    }
  }
  const body = JSON.stringify({
    user: user,
    customToken: customToken
  });
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store'
    }
  });
}) satisfies RequestHandler;

const return401 = (cookies: Cookies) => {
  cookies.delete('refreshToken');
  return new Response(
    JSON.stringify({
      error: 'Unauthorized'
    }),
    {
      status: 401,
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
};
