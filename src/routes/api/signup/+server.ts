import { dev } from '$app/environment';
import admin from '$lib/firebase-admin';
import { updateAuthCookies } from '../../../lib/auth/util';
import type { RequestHandler } from './$types';
import { WEB_API_KEY } from '$lib/server/config';

const key = [WEB_API_KEY];

export const POST = (async ({ request, cookies }) => {
  const { email, password, username } = await request.json();
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: username
  });
  const uid = userRecord.uid;
  await admin.auth().setCustomUserClaims(uid, { early_access: true });
  const signIn_res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  if (!signIn_res.ok) return new Response(null, { status: signIn_res.status });
  const { refreshToken } = await signIn_res.json();
  const customToken = await admin.auth().createCustomToken(uid);

  await admin.firestore().collection('users').doc(uid).set({
    email,
    uid,
    admin: false,
    created: new Date(),
    updated: new Date(),
    type: "",
    manuID: "",
  });

  updateAuthCookies(cookies, customToken, refreshToken);

  return new Response(null, {
    status: 200,
    headers: {
      'cache-control': 'no-store'
    }
  });
}) satisfies RequestHandler;
