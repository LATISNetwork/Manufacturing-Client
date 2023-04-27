import { verifyAuth } from '$lib/auth/util';
import { redirect } from '@sveltejs/kit';
// import type {LayoutData} from './$types';
export const load = async ({ fetch }) => {
  const params = await verifyAuth(fetch);
  return params;
};
