import { verifyAuth } from '$lib/auth/util';
export const getUserData = async (
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
  cookies: { get: (arg0: string) => any },
  admin
) => {
  const customToken = cookies.get('customToken');
  if (!customToken) {
    return new Response(JSON.stringify({ alert: 'Unauthorized', uid: 'NoAccount' }), {
      status: 401
    });
  }
  const { uid } = (await verifyAuth(fetch)).props.user;
  //   get user data from firestore
  const userRef = admin.firestore().collection('users').doc(uid);
  // Get the user data from the document
  const userSnapshot = await userRef.get();
  let userData = userSnapshot.data();
  userData = {
    ...userData,
    uid
  };
  return userData;
};
