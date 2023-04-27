<script lang="ts">
  /// <reference types="w3c-web-usb" />
  import { onMount } from "svelte";
  import { walletstores } from "./wallet-stores";
  import { LedgerHardwareWallet } from "./hardware-ledger";
  import type { AccountId, PublicKey } from "@hashgraph/sdk";
  import { componentType, loggedIn, ComponentType, pubKey } from '$lib/stores/stores';
  import {
    Client,
    ContractCreateFlow,
    FileCreateTransaction,
    ContractFunctionParameters,
  } from "@hashgraph/sdk";
  // import type { SimpleHederaClient } from "./hedera";
  import { HederaServiceImpl } from "../hederaclient";
  import {
    manufacturerAccountId,
    manufacturerPrivateKey,
    manufacturerPublicKey,
    manufacturerContract,
    oemContract,
  } from "../stores/wallet";
  // import { HashconnectService } from "./hashpack";

  let busy = false;
  let error = "";
  let disabled = false;

  const isWebUSBSupported = async () => {
    return Promise.resolve(
      !!navigator &&
        !!navigator.usb &&
        typeof navigator.usb.getDevices === "function"
    );
  };

  const handleConnect = async () => {
    disabled = true;
    busy = true;
    error = "";
    await navigator.usb.requestDevice({ filters: [] }).then(function (device) {
      console.log("device: ", device);
    });
    console.log("devices: ", await navigator.usb.getDevices());

    try {
      const wallet = await new LedgerHardwareWallet();

      const store = walletstores;
      await store.setWallet(wallet);
      console.log("Connected to Ledger");
      console.log(wallet);

      const pubKeyL = await wallet.getPublicKey(0).then(() => {
        console.log("connected to ledger!!!!");
        $componentType = ComponentType.LOGIN;
      });
      console.log("pubKey: ", pubKeyL);
    } catch (e: any) {
      // Bad practice <- Lazy Forrest
      error = e.message;
      console.log("Error connecting to Ledger");
      console.log(e);
    } finally {
      busy = false;
      disabled = false;
    }

    const MANUFACTURER = Client.forTestnet().setOperator(
      manufacturerAccountId,
      manufacturerPrivateKey
    );

    await walletstores.setClient(MANUFACTURER);
  };

  onMount(() => {
    isWebUSBSupported().then((supported) => {
      if (supported) {
        console.log("WebUSB is supported");
        // handleConnect();
      } else {
        disabled = true;
        error = "WebUSB is not supported";
        console.log("WebUSB is not supported");
      }
    });
  });
</script>

<div
  class="flex flex-col justify-center items-center h-screen gap-y-2 text-center"
>
  <h1 class="text-5xl text-fuchsia-200 font-bold">LATIS</h1>
  <h1 class="text-fuchsia-400 mb-8">
    Secure your device updates, decentralized and trusted.
  </h1>
  <button
    on:click={handleConnect}
    class="border-2 border-solid border-white rounded-full py-2 px-8 text-white font-bold text-xl bg-black hover:animate-pulse bg-opacity-10"
  >
    Connect Your Hardware Wallet
  </button>
  <h1 class="text-gray-400">powered by the Hedera Network</h1>
</div>
