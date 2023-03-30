<script lang="ts">
  import { LedgerHardwareWallet } from "./hardware-ledger";
  export let updateVersion = "";
  export let device = "";
  export let smartContract = "";
  let smartContractDict = [
    {
      name: "OEM 1",
      id: 0x2345678987654345678909876545678909876545678909876545678909876545,
    },
  ];

  let deviceDict = [
    {
      name: "CNC 1",
      publicKey: 0x2345678987654345678909876545678909876545678909876545678909876545,
    },
    {
      name: "3D Printer 1",
      publicKey: 0x2345678987654345678909876545678909876545678909876545678909876545,
    },
  ];

  let updateDict = [
    {
      name: "Update 1.0.2",
      id: 0x2345678987654345678909876545678909876545678909876545678909876545,
    },
    {
      name: "Update 1.0.3",
      id: 0x2345678987654345678909876545678909876545678909876545678909876545,
    },
  ];

  function handleSubmit() {
    console.log("submit");
    console.log(smartContract);
    console.log(device);
    console.log(updateVersion);
    // TODO: Call smart contract to schedule update
    
  }
</script>

<div class="m-4 my-auto border-2 border-gray-600 rounded-md p-8">
  <h1>Schedule an Update</h1>
  <hr />
  <label for="smartContract" class="mr-4">Smart Contract:</label>
  <select
    bind:value={smartContract}
    on:change={() => (updateVersion = device = "")}
  >
    {#each smartContractDict as sC}
      <option value={sC.id}>
        {sC.name}
      </option>
    {/each}
  </select>
  <div class="mt-4">
    <label for="update" class="mr-4">Device:</label>

    <select
      bind:value={device}
      on:change={() => (updateVersion = "")}
    >
      {#each deviceDict as d}
        <option value={d.publicKey}>
          {d.name}
        </option>
      {/each}
    </select>
  </div>
  <div class="mt-4">
    <label for="update" class="mr-4">Update:</label>

    <select
    bind:value={updateVersion}
  >
    {#each updateDict as update}
      <option value={update.id}>
        {update.name}
      </option>
    {/each}
  </select>
  </div>

  <!-- Enter -->
  <!-- Call handleSubmit on click -->
  <button
    disabled={!smartContract || !updateVersion || !device}
    type="submit"
    on:click={handleSubmit}
  >
    Submit
  </button>
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

<style>
  input {
    display: block;
    width: 500px;
    max-width: 100%;
  }
  select {
    display: block;
    width: 500px;
    max-width: 100%;
    background-color: black;
  }
  button {
    display: block;
    width: 500px;
    max-width: 100%;
    background-color: black;
    color: white;
    border: none;
    padding: 10px;
    margin-top: 10px;
  }
  /* When button is disabled */
  button:disabled {
    background-color: gray;
  }
  h1 {
    font-size: 1.5rem;
  }
</style>
