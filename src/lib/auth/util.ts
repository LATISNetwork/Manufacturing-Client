import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

type Token = string | undefined | null;

export const updateAuthCookies = (cookies: Cookies, customToken: Token, refreshToken: Token) => {
  if (customToken !== undefined && customToken !== null)
    cookies.set('customToken', customToken, {
      maxAge: 60 * 55,
      path: '/',
      secure: !dev,
      httpOnly: true
    });
  if (refreshToken !== undefined && refreshToken !== null)
    cookies.set('refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      secure: !dev,
      httpOnly: true
    });
};

export const verifyAuth = async (
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>
) => {
  const auth_res = await fetch('/api/auth', {
    method: 'GET'
  });
  const auth = await auth_res.json();
  const loggedIn = auth_res.ok && auth.user;
  return {
    props: {
      user: auth.user,
      customToken: auth.customToken
    },
    loggedIn
  };
};
