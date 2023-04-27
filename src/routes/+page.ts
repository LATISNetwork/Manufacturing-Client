import { verifyAuth } from '$lib/auth/util';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { walletstores } from '$lib/components/wallet-stores';
import {componentType, loggedIn, ComponentType} from '$lib/stores/stores';
export const load = (async ({ fetch }) => {
	componentType.set(ComponentType.LEDGER); // Change back to ledger
	loggedIn.set(false);

	// walletstores.subscribe((wallets) => {
	// 	console.log('wallets.wallet', wallets);
	// 	if (wallets.wallet !== null) {
	// 		componentType.set(1);
	// 	}
	// });
	const params = await verifyAuth(fetch);
	if (params.loggedIn) {
		loggedIn.set(true);
		componentType.set(2);
	}
}) satisfies PageLoad;
