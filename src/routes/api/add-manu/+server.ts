import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';
import type { RequestHandler } from './$types';

export const POST = (async ({ fetch, request, cookies }) => {
	const { manuID } = await request.json();
	const { uid } = await getUserData(fetch, cookies, admin);
	if (uid === undefined) return new Response('{response: "Auth Failed"}', { status: 404 });
	let res = await admin.firestore().collection('users').doc(uid).update({ manuID, type: 'oem' });
	if (res instanceof Error) return new Response(res.message, { status: 500 });
	// create an oemID collection if it doesn't exist
	let res1 = await admin.firestore().collection(manuID).doc('updates').set({ init: [] });
	let data = await admin.firestore().collection('manus').doc(manuID).get();
	// if it doesn't exist, create it
	let res2;
	if (!data.exists) {
		await admin
			.firestore()
			.collection('manus')
			.doc(manuID)
			.set({ uid: [uid] });
	} else {
		// add new uid to oemID
		res2 = await admin
			.firestore()
			.collection('manus')
			.doc(manuID)
			.update({ uid: [...data.data()?.uid, uid] });
		if (res2 instanceof Error) return new Response(res2.message, { status: 500 });
		return new Response(JSON.stringify(res2), { status: 200 });
	}
    return new Response(JSON.stringify(res1), { status: 200 });
}) satisfies RequestHandler;
