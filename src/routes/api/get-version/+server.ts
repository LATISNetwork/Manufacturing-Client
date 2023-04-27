import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({request}) => {
	const output = await request.json();
    const oem = output.oem;
    const deviceType = output.deviceType;
    console.log(oem);
    console.log(deviceType);
    const dataOut = (await admin.firestore().collection(oem + '').doc(deviceType + '').get()).data();
    console.log(dataOut.updates[0].version);
    let versionOut = [];
    for(let i = 0; i < dataOut.updates.length; i++) {
        versionOut.push(dataOut.updates[i].version);
    }
    console.log(versionOut);
    if (versionOut instanceof Error) {
        return new Response(JSON.stringify({}), { status: 500 });
    }
    return new Response(JSON.stringify(versionOut), { status: 200 });
}) satisfies RequestHandler;
