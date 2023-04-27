import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';
import type { RequestHandler } from './$types';

export const POST = (async ({ fetch, request, cookies }) => {
	const { deviceId } = await request.json();
	if (deviceId === undefined) return new Response('{response: "Auth Failed"}', { status: 404 });
	// create an oemID collection if it doesn't exist
	let res2 = await admin
        .firestore()
        .collection('devices')
        .doc(deviceId)
        .update({updatePending : true });
    if (res2 instanceof Error) return new Response(res2.message, { status: 500 });
    return new Response(JSON.stringify(res2), { status: 200 });
}) satisfies RequestHandler;
