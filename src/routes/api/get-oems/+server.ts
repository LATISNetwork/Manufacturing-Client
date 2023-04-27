import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({fetch, request, cookies }) => {
	// const body = await request.json();
    const oemList = await admin.firestore().collection("oems").listDocuments();
    // const { uid } = await getUserData(fetch, cookies, admin);
    // const userData = (await admin.firestore().collection('users').doc(uid).get()).data();
    // const manuID = userData?.manuID;
    // let res = await admin.firestore().collection(manuID).get();
    // console.log(res.docs.map(doc => doc.data()));
    if (oemList instanceof Error) return new Response("Error Getting OEM List", { status: 500 });
    return new Response(JSON.stringify(oemList), { status: 200 });
}) satisfies RequestHandler;
