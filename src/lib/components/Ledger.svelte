<script lang="ts">
  /// <reference types="w3c-web-usb" />
  import { onMount } from "svelte";
  import { walletstores } from "./wallet-stores";
  import { LedgerHardwareWallet } from "./hardware-ledger";
  import { Client, AccountId, PublicKey } from "@hashgraph/sdk";
  import type { SimpleHederaClient } from "./hedera";
  import { HederaServiceImpl } from "../hederaclient";
  import { accountId } from "../stores/wallet";

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
      const hederaService = new HederaServiceImpl();
      const client: SimpleHederaClient = await hederaService.createClient({
        wallet: wallet,
        network: "mainnet",
        keyIndex: 0,
        accountId: accountId
      });
      await walletstores.setWallet(wallet);
      await walletstores.setClient(client);
      // const client: Client =
      console.log("Connected to Ledger");

      //   const pubKey = await wallet.getPublicKey(0);
      //   console.log("pubKey: ", pubKey);

      sessionStorage.setItem("store", JSON.stringify(walletstores));
    } catch (e: any) {
      // Bad practice <- Lazy Forrest
      error = e.message;
      console.log("Error connecting to Ledger");
      console.log(e);
    } finally {
      busy = false;
      disabled = false;
    }
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

<div>
  <button on:click={handleConnect}> Connect </button>
</div>

<style>
  button {
    background-color: #4caf50; /* Green */
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 8px 2px;
    cursor: pointer;
    /* round corners */
    border-radius: 8px;
    /* Center on page */
    position: absolute;
    left: 50%;
    transform: translate(-50%);
  }
</style>
