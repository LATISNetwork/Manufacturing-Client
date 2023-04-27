<script lang="ts">
	import { browser } from '$app/environment';
	import Hedera from '$lib/components/Hedera.svelte';
	// const agent = window.electron ? 'Electron' : 'Browser';
	import Ledger from '$lib/components/Ledger.svelte';
	import Login from '$lib/components/Login.svelte';
	import { onMount } from 'svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	let ready: boolean = false;
	import '../shims-buffer';
	onMount(() => {
		ready = true;
		componentType.subscribe((value) => {
			if (value === ComponentType.LOGIN && $loggedIn == true) {
				componentType.set(ComponentType.PORTAL);
			}
		});
	});
</script>

<main class="text-lg">
	{#if $componentType === ComponentType.LEDGER}
		<Ledger />
	{:else if $componentType === ComponentType.LOGIN}
		{#if $loggedIn == true}
			<Hedera />
		{:else}
			<Login />
		{/if}
	{:else if $componentType === ComponentType.PORTAL}
		<Hedera />
	{/if}
</main>
