<script lang="ts">
  import { LedgerHardwareWallet } from "./hardware-ledger";
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
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,
    ContractCreateFlow,
    PublicKey,
  } from "@hashgraph/sdk";

  import fs from "fs";
  import type { SimpleHederaClient } from "./hedera";
  import { oemContract } from "../stores/wallet";

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
  }
</script>

<button
  on:click={logout}
  class="m-4 border-emerald-500 border-2 rounded-md px-4 py-2 hover:bg-emerald-900 hover:bg-opacity-50 transition-all"
>
  Log out
</button>

<div class="m-4 my-auto border-2 border-gray-600 rounded-md p-8">
  <h1>Schedule an Update</h1>
  <hr />
  <label for="oem" class="mr-4">OEM:</label>
  <select bind:value={oem} on:change={() => updateDeviceTypeList()}>
    {#each oemList as o}
      <option value={o}>
        {o}
      </option>
    {/each}
  </select>
  <div class="mt-4">
    <label for="device type" class="mr-4">Device Type:</label>
    <select
      bind:value={deviceType}
      disabled={!oem}
      on:change={() => updateVersionList()}
    >
      {#each deviceTypeList as d}
        <option value={d}>
          {d}
        </option>
      {/each}
    </select>
  </div>
  <div class="mt-4">
    <label for="version" class="mr-4">Version:</label>

    <select
      bind:value={updateVersion}
      disabled={!deviceType || !oem}
      on:change={() => updateDeviceList()}
    >
      {#each versionList as update}
        <option value={update}>
          {update}
        </option>
      {/each}
    </select>
  </div>

  <div class="mt-4">
    <label for="device" class="mr-4">Device:</label>

    <select
      bind:value={deviceId}
      disabled={!deviceType || !oem || !updateVersion}
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
  >
    Assign Update
  </button>
</div>

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
