import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({ fetch, request, cookies }) => {
	const body = await request.json();
	const { uid } = await getUserData(fetch, cookies, admin);
	console.log(body, uid)
	const userData = (await admin.firestore().collection('users').doc(uid).get()).data();
	const deviceData = (await admin.firestore().collection(userData?.manuID).doc(body.deviceID).get()).data();
	console.log('deviceData', deviceData);
	if (!deviceData){
		await admin.firestore().collection(userData?.manuID).doc(body.deviceID).set({updates: [body]});
		return new Response('Ok');
	}
	const manuID = userData?.manuID;
	console.log('manuID', manuID);
	try {
		let res1 = await admin.firestore().collection(manuID).doc(body.deviceID).set({updates: [...deviceData?.updates, body]});
		let res2 = await admin.firestore().collection(body.deviceID).doc(body.version).set(body);
		console.log('res1', res1);
		console.log('res2', res2);
	} catch (error) {
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
	}
	return new Response('Ok');
}) satisfies RequestHandler;
