import type { RequestHandler } from './$types';
import admin from '$lib/firebase-admin';

export const POST = (async ({request}) => {
	const {oem} = await request.json();
    console.log(oem);
    const deviceTypeList = await admin.firestore().collection(oem + '').listDocuments();
    console.log(deviceTypeList);
    if (deviceTypeList instanceof Error) {
        return new Response(JSON.stringify({}), { status: 500 });
    }

    return new Response(JSON.stringify(deviceTypeList), { status: 200 });
}) satisfies RequestHandler;
