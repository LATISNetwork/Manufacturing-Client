<script lang="ts">
  /// <reference types="w3c-web-usb" />
  import { onMount } from "svelte";
  import { walletstores } from "./wallet-stores";
  import { LedgerHardwareWallet } from "./hardware-ledger";
  import type { AccountId, PublicKey } from "@hashgraph/sdk";
  import {
    Client,
    ContractCreateFlow,
    FileCreateTransaction,
  } from "@hashgraph/sdk";
  // import type { SimpleHederaClient } from "./hedera";
  import { HederaServiceImpl } from "../hederaclient";
  import { lookUpContract, manufacturerAccountId, manufacturerPrivateKey, manufacturerPublicKey } from "../stores/wallet";
  import { HashconnectService } from "./hashpack";

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
      // const hederaService = new HederaServiceImpl();
      // const client: Client = await hederaService.createClient({
      //   wallet: wallet,
      //   network: "mainnet",
      //   keyIndex: 0,
      //   accountId: accountId,
      // });
      await walletstores.setWallet(wallet);
      // await walletstores.setClient(client);
      console.log("Connected to Ledger");

      //   const pubKey = await wallet.getPublicKey(0);
      //   console.log("pubKey: ", pubKey);

      // sessionStorage.setItem("store", JSON.stringify(walletstores));
    } catch (e: any) {
      // Bad practice <- Lazy Forrest
      error = e.message;
      console.log("Error connecting to Ledger");
      console.log(e);
    } finally {
      busy = false;
      disabled = false;
    }

    // let client = await new HashconnectService();
    // await client.setUpHashConnectEvents();
    // await client.connectToExtension();
    // console.log("Some success connecting to extension");

    const MANUFACTURER = Client.forTestnet().setOperator(
      manufacturingAccountId,
      manufacturingPublicKey
    );

    const contractByteCode = await Buffer.from(lookUpContract);
    const manufacturerContractInstantiateTx = new ContractCreateFlow()
      .setBytecode(contractByteCode)
      .setGas(1000000);
    // const response = await new FileCreateTransaction()
    //   .setKeys([client.operatorPublicKey])
    //   .setMaxTransactionFee(1000)
    //   .execute(client);

    // const id = await (await response.getReceipt(client)).fileId;
    // console.log("FileCreateTransaction response: ", response);
    // console.log("FileCreateTransaction id: ", id);
    // .setConstructorParameters(new ContractFunctionParameters());
    console.log("No error creating transaction");
    const manufacturerContractInstantiateSubmit =
      await manufacturerContractInstantiateTx.execute(client);
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
