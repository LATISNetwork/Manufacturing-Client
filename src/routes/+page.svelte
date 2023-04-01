<script lang="ts">

	// import { browser } from '$app/environment';
	// import Estuary from '$lib/components/Estuary.svelte';
	import Ledger from '$lib/components/Ledger.svelte';
	import Hedera from '$lib/components/Hedera.svelte';
</script>

<main>
	<div class="m-4">
		<h1>LATIS Manufacturing Portal</h1>
	</div>
	<Hedera />
	<Ledger />

</main>
