import { Buffer } from "buffer";
// import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
import type { PublicKey } from "@hashgraph/sdk";
import type Transport from "@ledgerhq/hw-transport";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BIPPath from "bip32-path";

import { walletstores } from "./wallet-stores";

import { Wallet } from "./ledgerabstract";

const PATH = (index: number) => `44/3030/0/0/${index}`;



const CLA = 0xE0;
const INS_GET_PK = 0x02;
const INS_SIGN_TX = 0x04;

const P1_UNUSED_APDU = 0x00;
const P2_UNUSED_APDU = 0x00;

const OPEN_TIMEOUT = 100000;
const LISTENER_TIMEOUT = 300000;

interface APDU {
  CLA: number;
  INS: number;
  P1: number;
  P2: number;
  buffer: Buffer;
}

export class LedgerHardwareWallet extends Wallet {
  private transport: Transport | null = null;
  private publicKeys: Map<number, PublicKey> = new Map();

  private serializePath(path: Array<number>): Buffer {
    const data = Buffer.alloc(1 + path.length * 4);

    path.forEach((segment, index) => {
      data.writeUInt32BE(segment, 1 + index * 4);
    });

    return data;
  }

  private async getTransport(): Promise<Transport | null> {
    if (this.transport != null) {
      return this.transport;
    }

      const TransportUSB= (
        await import("@ledgerhq/hw-transport-webhid")
      )["default"];
      // console.log("TransportUSB: ", TransportUSB);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.transport = await TransportUSB.create(
        OPEN_TIMEOUT,
        LISTENER_TIMEOUT
      );
      // console.log("Transport: ", this.transport);

    if (this.transport != null) {
      // console.log("Transport: ", this.transport);
      this.transport.on("disconnect", async () => {
        try {
          await this.transport?.close();
          this.transport = null;
        } catch (error) {
          if (error instanceof DOMException) {
            console.error("Ledger Transport threw DOM Exception");
          } else throw error;
        }
      });
    }
    console.log("Transport: ", this.transport);
    return this.transport;
  }

  private async sendAPDU(message: APDU): Promise<Buffer | null> {
    const store = walletstores;
    let response: Buffer | null = null;
    store.setPromptOpen(true);
    console.log("Sending APDU: ", message);
    await this.getTransport().then(async (transport) => {
      console.log("Transport: ", transport);
      if (transport != null) {
        console.log("Sending APDU: ", message);
        response = await transport.send(
          message.CLA,
          message.INS,
          message.P1,
          message.P2,
          message.buffer
        );
        console.log("Response: ", response);
      }
    }).finally(
      () => store.setPromptOpen(false)
    );

    return response;
  }

  hasPrivateKey(): boolean {
    return false;
  }

  private async signTransaction(
    index: number,
    txn: Uint8Array
  ): Promise<Uint8Array> {
    // IOC hack for missing  decimal information in protos
    let decimals = P1_UNUSED_APDU;

    const store = walletstores;
    const extra = store.extraInfo;

    if (extra != null && extra.decimals != null) {
      decimals = extra.decimals as number;
    }

    // TODO: Use this when the ledger app can be updated to handle full path + tx data
    // const data = Buffer.from(txn);
    // const path = this.serializePath(BIPPath.fromString(PATH(index)).toPathArray());
    // const parts = [path, data];
    // const buffer = Buffer.concat(parts);

    const data = Buffer.from(txn);
    const buffer = Buffer.alloc(4 + data.length);
    buffer.writeUInt32LE(index);
    buffer.fill(data, 4);

    const response = await this.sendAPDU({
      CLA,
      INS: INS_SIGN_TX,
      P1: decimals,
      P2: P2_UNUSED_APDU,
      buffer,
    });

    if (response != null) {
      return new Uint8Array(response.slice(0, -2));
    }

    return new Uint8Array();
  }

  async getTransactionSigner(
    index: number
  ): Promise<(transactionBody: Uint8Array) => Promise<Uint8Array>> {
    return (tx) => this.signTransaction(index, tx);
  }

  async getPublicKey(index: number): Promise<PublicKey | undefined> {
    const { PublicKey } = await import("@hashgraph/sdk");

    if (this.publicKeys.get(index) != null) {
      return this.publicKeys.get(index);
    } else {
      // NOTE: this just happens to work in the current BOLOS implementation
      console.log("Getting public key for index", index);
      const buffer = this.serializePath(BIPPath.fromString(PATH(index)).toPathArray());
      console.log("Buffer", buffer);
      const response = await this.sendAPDU({
        CLA,
        INS: INS_GET_PK,
        P1: P1_UNUSED_APDU,
        P2: P2_UNUSED_APDU,
        buffer,
      });

      if (response != null) {
        console.log("Got public key for index", index);
        const pubKeyStr = response.slice(0, -2).toString("hex");
        const pubKey = PublicKey.fromString(pubKeyStr);
        this.publicKeys.set(index, pubKey);
        return pubKey;
      }
    }
  }
}
