import type { RequestHandler } from "./$types";
import { getUserData } from "../get-user-data/get-user";
import admin from "$lib/firebase-admin";

export const POST = (async ({ fetch, request, cookies }) => {
  // const body = await request.json();
  const { uid } = await getUserData(fetch, cookies, admin);
  const userData = (
    await admin.firestore().collection("users").doc(uid).get()
  ).data();
  const manuID = userData?.manuID;
  console.log("manuID: ", manuID);
  let res = await admin.firestore().collection("manus").doc(manuID).get();
  if (res instanceof Error) return new Response(res.message, { status: 500 });
  let resJson = res.data();
  let updates = resJson?.updates[0];
  if (updates === undefined)
    return new Response('{response: "Auth Failed"}', { status: 404 });
  if (updates.new == true) {
    updates.new = false;
    console.log("updates: ", updates);
    await admin
      .firestore()
      .collection("manus")
      .doc(manuID)
      .update({ updates: [updates] });
    return new Response(
      JSON.stringify({
        updates: updates,
        newUpdate: true,
        oemID: updates.oemID,
        deviceID: updates.deviceID,
        version: updates.version,
      }),
      { status: 200 }
    );
  } else {
    return new Response(
      JSON.stringify({ updates: updates, newUpdate: false }),
      { status: 200 }
    );
  }
}) satisfies RequestHandler;
