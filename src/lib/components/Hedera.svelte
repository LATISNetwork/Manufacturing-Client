<script lang="ts">
  import { LedgerHardwareWallet } from "./hardware-ledger";
  import { toast, SvelteToast } from "@zerodevx/svelte-toast";
  import type { Wallet } from "./ledgerabstract";
  import { walletstores } from "./wallet-stores";
  // import connected from "./Ledger.svelte";
  import wallet from "./Ledger.svelte";
  import Ledger from "./Ledger.svelte";
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { componentType, loggedIn, ComponentType } from "$lib/stores/stores";

  import type {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractCallQuery,
    Hbar,
    ContractCreateFlow,
    PublicKey,
    ContractId,
  } from "@hashgraph/sdk";

  import {
    ContractFunctionParameters,
    ContractExecuteTransaction,
  } from "@hashgraph/sdk";

  import fs from "fs";
  import type { SimpleHederaClient } from "./hedera";
  import { oemContract, manufacturerContract } from "../stores/wallet";

  export let updateVersion = "";
  export let deviceType = "";
  export let oem = "";
  export let deviceId = "";

  let ledgerWallet: Wallet | null; // This command works but constantly print stuff to the console
  let client: Client | null;
  let error = "";
  let oemList: any[] = [];
  let deviceTypeList: any[] = [];
  let versionList: any[] = [];
  let deviceList: any[] = [];

  const app = new SvelteToast({
    // Set where the toast container should be appended into
    target: document.body,
    props: {},
  });

  const updateOEMList = async () => {
    const oemListTemp = await fetch("/api/get-oems", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
    });
    const updateListJsonAwait = await oemListTemp.json();
    console.log(updateListJsonAwait);
    for (let i = 0; i < updateListJsonAwait.length; i++) {
      oemList = [...oemList, updateListJsonAwait[i]._path.segments[1]];
      console.log(updateListJsonAwait[i]._path.segments[1]);
    }
  };

  const updateDeviceTypeList = async () => {
    updateVersion = deviceType = "";
    const res = await fetch("api/get-deviceTypes", {
      method: "POST",
      body: JSON.stringify({ oem }),
    });
    const resAwait = await res;
    if (!resAwait.ok) {
      deviceTypeList = [];
      error = resAwait.statusText;
      return;
    }
    console.log(res);
    const responseJson = await res.json();

    console.log(responseJson);
    if (responseJson.error) {
      error = responseJson.error;
      deviceTypeList = [];
      return;
    }
    console.log(responseJson);
    for (let i = 0; i < responseJson.length; i++) {
      deviceTypeList = [...deviceTypeList, responseJson[i]._path.segments[1]];
      console.log(responseJson[i]._path.segments[1]);
    }
  };

  const updateVersionList = async () => {
    const res = await fetch("api/get-version", {
      method: "POST",
      body: JSON.stringify({ oem: oem, deviceType: deviceType }),
    });
    const resAwait = await res;
    if (!resAwait.ok) {
      versionList = [];
      error = resAwait.statusText;
      return;
    }
    console.log(res);
    const responseJson = await res.json();

    console.log(responseJson);
    if (responseJson.error) {
      error = responseJson.error;
      versionList = [];
      return;
    }
    console.log(responseJson);
    for (let i = 0; i < responseJson.length; i++) {
      versionList = [...versionList, responseJson[i]];
      console.log(responseJson[i]);
    }
  };

  const updateDeviceList = async () => {
    if (oem != "LatisOEM") {
      deviceList = [];
      return;
    }
    const oemListTemp = await fetch("/api/get-devices", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
    });
    const updateListJsonAwait = await oemListTemp.json();
    console.log(updateListJsonAwait);
    for (let i = 0; i < updateListJsonAwait.length; i++) {
      deviceList = [...deviceList, updateListJsonAwait[i]._path.segments[1]];
      console.log(updateListJsonAwait[i]._path.segments[1]);
    }
  };

  onMount(async () => {
    const unsubscribeWallet = walletstores.subscribe((store) => {
      ledgerWallet = store.wallet;
    });
    const unsubscribeClient = walletstores.subscribe((store) => {
      client = store.client;
    });

    await updateOEMList();
  });

  const checkForUpdates = async () => {
    const res = await fetch("api/query-updates", {
      method: "POST",
      body: JSON.stringify({ oem, deviceType, updateVersion }),
    });
    const resAwait = await res;
    if (!resAwait.ok) {
      error = resAwait.statusText;
      return;
    }
    const responseJson = await res.json();
    if (responseJson.error) {
      error = responseJson.error;
      return;
    }
    if (responseJson.newUpdate) {
      console.log(responseJson);
      toast.push(
        "Update available from " +
          responseJson.oemID +
          " for " +
          responseJson.deviceID +
          " to version " +
          responseJson.version +
          "!"
      );
    }
  };
  const whileCheck = async () => {
    while (true) {
      await new Promise((r) => setTimeout(r, 5000));
      await checkForUpdates();
    }
  };

  whileCheck();

  const logout = async () => {
    // Clear cookies
    const signout_res = await fetch(`/api/signout`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
    });

    if (!signout_res.ok) {
      error = await signout_res.text();
      console.log(error);
    } else {
      // console.log(signout_res);
      componentType.set(ComponentType.LEDGER);
      loggedIn.set(false);
      window.location.reload();
    }
  };

  async function handleSubmit() {
    console.log("submit");
    console.log(oem);
    console.log(deviceType);
    console.log(updateVersion);
    console.log(deviceId);

    const res = await fetch("api/assign-update", {
      method: "POST",
      body: JSON.stringify({ deviceId }),
    });
    const resAwait = await res;
    if (!resAwait.ok) {
      error = resAwait.statusText;
      return;
    }
    console.log(res);
    const responseJson = await res.json();
    console.log(responseJson);

    if (oem == "LatisOEM") {
      toast.push("Pushing update to device through Hedera");
      console.log("Pushing to Hedera");
      const contractFetchUpdateTx = new ContractExecuteTransaction()
        .setContractId(manufacturerContract)
        .setGas(1000000)
        .setFunction(
          "assignUpdate",
          new ContractFunctionParameters()
            .addAddress(deviceId)
            .addString(oem)
            .addString(deviceType)
            .addString(updateVersion)
        );
      const contractFetchUpdateSubmit = await contractFetchUpdateTx.execute(
        client
      );
      const contractFetchUpdateRx = await contractFetchUpdateSubmit.getReceipt(
        client
      ); // Commenting this one line smh causes things to fail unsure how
      console.log("- Fetching update from middleman\n");
      console.log(contractFetchUpdateRx);
    }
  }
</script>

<div class="m-4 bg-fuchsia-500 bg-opacity-10 rounded-lg shadow-md p-8 mb-8">
  <div class="w-full flex flex-row justify-between align-middle my-4">
    <h1 class="text-2xl text-fuchsia-300 font-bold">LATIS Manufacturer Client</h1>
    <button
      on:click={logout}
      class=" border-fuchsia-500 border-2 rounded-md px-4 py-2 w-1/12 hover:bg-fuchsia-900 hover:bg-opacity-50 transition-all"
    >
      Log out
    </button>
  </div>

  <h1 class="text-xl mb-4">Schedule an Update</h1>
  <div class="bg-fuchsia-500 bg-opacity-10 rounded-lg shadow-md p-8 w-1/2">
    <div class=" flex flex-row justify-between">
      <label for="oem" class="mr-4">OEM:</label>
      <select
        bind:value={oem}
        on:change={() => updateDeviceTypeList()}
        class="w-2/3 appearance-none bg-black bg-opacity-30 border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 rounded-md p-4 placeholder:italic text-gray-300"
      >
        {#each oemList as o}
          <option value={o} >
            {o}
          </option>
        {/each}
      </select>
    </div>

    <div class="mt-4 flex flex-row justify-between">
      <label for="device type" class="mr-4">Device Type:</label>
      <select
        bind:value={deviceType}
        disabled={!oem}
        on:change={() => updateVersionList()}
        class="w-2/3 appearance-none bg-black bg-opacity-30 border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 rounded-md p-4 placeholder:italic text-gray-300"
      >
        {#each deviceTypeList as d}
          <option value={d} >
            {d}
          </option>
        {/each}
      </select>
    </div>
    <div class="mt-4 flex flex-row justify-between">
      <label for="version" class="mr-4">Version:</label>

      <select
        bind:value={updateVersion}
        disabled={!deviceType || !oem}
        on:change={() => updateDeviceList()}
        class="w-2/3 appearance-none bg-black bg-opacity-30 border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 rounded-md p-4 placeholder:italic text-gray-300"
      >
        {#each versionList as update}
          <option value={update}>
            {update}
          </option>
        {/each}
      </select>
    </div>

    <div class="mt-4 flex flex-row justify-between">
      <label for="device" class="mr-4">Device:</label>

      <select
        bind:value={deviceId}
        disabled={!deviceType || !oem || !updateVersion}
        class="w-2/3 appearance-none bg-black bg-opacity-30 border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 rounded-md p-4 placeholder:italic text-gray-300"
      >
        {#each deviceList as device}
          <option value={device}>
            {device}
          </option>
        {/each}
      </select>
    </div>

    <button
      disabled={!oem || !updateVersion || !deviceType || !deviceId}
      type="submit"
      on:click={handleSubmit}
      class="bg-fuchsia-600 mt-4 hover:bg-fuchsia-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-all"
    >
      Assign Update
    </button>
  </div>
</div>

<style>
  /* When button is disabled */
  :disabled {
    color: #9ca3af;
  }
  :root {
    --toastBackground: rgb(0, 0, 0);
    --toastColor: #ffffff;
    --toastBarBackground: fuchsia;
  }
  option {
    background-color: rgba(0, 0, 0, 0.3);
    color: #ffffff;
  }
  option::before {
    content: attr(value) ":";
    color: #ffffff;
  }
</style>
