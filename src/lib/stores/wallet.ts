import { writable } from 'svelte/store';
import { walletstores } from '../components/wallet-stores';
import { AccountId, PrivateKey, ContractId } from '@hashgraph/sdk';

export const walletstore = walletstores;

// Manufacturer Testnet Account
export const manufacturerAccountId = AccountId.fromString("0.0.3833437"); //replace with actual account id
export const manufacturerPrivateKey = PrivateKey.fromString
("3030020100300706052b8104000a04220420d383a44ff54c9662a36557caf7a743064849d10adedd962717b2a392c257e854");
export const manufacturerPublicKey = manufacturerPrivateKey.publicKey.toEvmAddress();

export const manufacturerContract = ContractId.fromString("0.0.4408608"); // LatisManufacturer

export const oemContract = ContractId.fromString("0.0.4408618"); // LatisOEM