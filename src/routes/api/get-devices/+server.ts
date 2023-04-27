import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({fetch, request, cookies }) => {
    const deviceList = await admin.firestore().collection("devices").listDocuments();
    if (deviceList instanceof Error) return new Response("Error Getting Device List", { status: 500 });
    return new Response(JSON.stringify(deviceList), { status: 200 });
}) satisfies RequestHandler;