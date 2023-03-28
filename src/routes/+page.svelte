<script lang="ts">

	import { browser } from '$app/environment';
	import Estuary from '$lib/components/Estuary.svelte';
	const agent = window.electron ? 'Electron' : 'Browser';
	import Ledger from '$lib/components/Ledger.svelte';
</script>

<main>
	<div class="m-4">
		<h1>LATIS Manufacturing Portal</h1>
		<p>Running in {agent}</p>
	</div>
	<Estuary />
	<Ledger />

</main>
