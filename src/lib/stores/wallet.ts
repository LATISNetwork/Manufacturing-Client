import { writable } from 'svelte/store';
import { walletstores } from '../components/wallet-stores';
import { AccountId } from '@hashgraph/sdk';

export const walletstore = walletstores;

export const accountId = AccountId.fromString("0.0.123456"); //replace with actual account id