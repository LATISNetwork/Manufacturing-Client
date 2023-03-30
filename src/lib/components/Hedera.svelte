<script lang="ts">
    import { LedgerHardwareWallet } from "./hardware-ledger";
    let updateVersion = "";
    let device = "";
    let fileHash = "";
    let response = "";
    let file : HTMLInputElement;
    let error = "";
    let smartContract = ""

</script>
<div class="m-4 my-auto border-2 border-gray-600 rounded-md p-8">
    <h1>Schedule an update to Hedera</h1>

    <div class="mt-4">
        <label for="smartContract" class="mr-4">Smart Contract:</label>
        <input type="text" id="fileHash" name="fileHash" placeholder="Select Smart Contract" class="bg-black" bind:value="{smartContract}">
    </div>
    <div class="mt-4 ">
        <label for="update" class="mr-4">Update:</label>
        <input type="text" id="name" name="name" placeholder="Select Update" class="bg-black" bind:value="{updateVersion}">
    </div>

    <div class="mt-4">
        <label for="device" class="mr-4">Device:</label>
        <input type="text" id="device" name="device" placeholder="Select Device" class="bg-black" bind:value="{device}">
    </div>

</div>

<!-- {#if error}
<div class="m-4 my-auto text-red-400">
    <h1>Error</h1>
    <p>{error}</p>
</div>
{/if}
{#if response}
<div class="m-4 mt-8 my-auto w-full flex-wrap">
    <h1>Response</h1>
    <p>{response}</p>
</div>
{/if} -->