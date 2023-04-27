<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	let ready: boolean = false;
	import '../shims-buffer';
	onMount(() => (ready = true));
</script>

{#if ready}
	<slot />
		<div
			class=" w-screen h-screen inset-0 top-0 bottom-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-gray-900 to-black -z-10 fixed"
		/>
{/if}
