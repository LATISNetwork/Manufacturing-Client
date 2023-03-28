import type { PrivateKey, AccountId, PublicKey } from '@hashgraph/sdk';
import type { BigNumber } from 'bignumber.js';

import type { Wallet } from './ledgerabstract';
import type { AccountBalance, MirrorAccountInfo, SimpleHederaClient } from './hedera';
import { writable } from 'svelte/store';
declare const __TEST__: boolean;
interface State {
	network: 'mainnet' | 'testnet' | 'previewnet';
	// the wallet that has been unlocked
	wallet: Wallet | null;
	// the specific instantiation of a client
	// from the unlocked wallet that is being used
	client: SimpleHederaClient | null;
	// the balance of the account associated with the client
	balance: AccountBalance | null;
	// the current price of HBARS in USD
	hbarPriceUsd: BigNumber.Instance | null;
	// a place to stuff extra information needed to process a transaction
	extraTxInfo: Record<string, string | number> | null;
	// is there an open prompt for the user on their hardware wallet
	prompt: boolean;
	// are you sure you want to logout? open state
	logoutConfirm: boolean;
	//Hedera network status
	networkStatus: boolean;
}

// @ledgerhq/hw-transport's TransportStatusError's doesn't expose status* properties
interface TransportStatusError extends Error {
	statusCode: number;
	statusText: string;
}

export const walletstores = (() => {
	const initWalletStores = () => {
		return {
			network: 'mainnet' as 'mainnet' | 'testnet' | 'previewnet',
			wallet: null as Wallet | null,
			client: null as SimpleHederaClient | null,
			balance: null as AccountBalance | null,
			hbarPriceUsd: null as BigNumber.Instance | null,
			extraTxInfo: null as Record<string, string | number> | null,
			prompt: false as boolean,
			logoutConfirm: false as boolean,
			networkStatus: true as boolean,
		};
	};
	const store = writable(initWalletStores());
	const { subscribe, set, update } = store;
	return {
		subscribe,
		set,
		update,

		publicKey() {
			subscribe((state) => {
				return state.client?.getPublicKey() ?? null;
			});
		},

		privateKey() {
			subscribe((state) => {
				return state.client?.getPrivateKey() ?? null;
			});
		},

		accountId() {
			subscribe((state) => {
				return state.client?.getAccountId() ?? null;
			});
		},

		getClient() {
			subscribe((state) => {
				return state.client;
			});
		},

		extraInfo() {
			subscribe((state) => {
				return state.extraTxInfo;
			});
		},

		async networkPing() {
			const { AccountBalanceQuery, AccountId } = await import('@hashgraph/sdk');
			const accountId = AccountId.fromString('0.0.2');

			try {
				new AccountBalanceQuery().setNodeAccountIds([accountId]).setAccountId(accountId);
				update((state) => {
					state.networkStatus = true;
					return state;
				})
			} catch (error) {
				update((state) => {
					state.networkStatus = false;
					return state;
				})
			}

			subscribe((state) => {
				return state.networkStatus;
			});
		},

		setNetwork(name: 'mainnet' | 'testnet' | 'previewnet') {
			update((state) => {
				state.network = name;
				return state;
			})
		},

		setWallet(wallet: Wallet | null) {
			update((state) => {
				state.wallet = wallet;
				return state;
			})
		},

		setClient(client: SimpleHederaClient | null) {
			update((state) => {
				state.client = client;
				return state;
			})
		},

		async requestAccountBalance() {
			subscribe(async (state) => {
				await state.client?.getAccountBalance();
			})
		},

		setExtraInfo(info: Record<string, string | number>): void {
			update((state) => {
				state.extraTxInfo = info;
				return state;
			})
		},

		setPromptOpen(open: boolean): void {
			update((state) => {
				state.prompt = open;
				return state;
			})
		},

		setConfirmLogoutOpen(open: boolean): void {
			update((state) => {
				state.logoutConfirm = open;
				return state;
			})
		},

		async errorMessage(error: Error): Promise<string> {
			const { Status, StatusError } = await import('@hashgraph/sdk');
			const { StatusCodes, TransportStatusError } = await import('@ledgerhq/hw-transport');

			if (error instanceof StatusError) {
				switch (error.status) {
					case Status.AccountDeleted:
					case Status.AccountExpiredAndPendingRemoval:
					case Status.AccountIdDoesNotExist:
					case Status.AccountKycNotGrantedForToken:
					case Status.AccountFrozenForToken:
					case Status.AccountRepeatedInAccountAmounts:
					case Status.Busy:
					case Status.Unknown:
					case Status.Unauthorized:
					case Status.DuplicateTransaction:
					case Status.EmptyTokenTransferAccountAmounts:
					case Status.EmptyTokenTransferBody:
					case Status.EmptyTransactionBody:
					case Status.FileContentEmpty:
					case Status.FileDeleted:
					case Status.MaxFileSizeExceeded:
					case Status.MemoTooLong:
					case Status.MessageSizeTooLarge:
					case Status.Ok:
					case Status.Success:
					case Status.PayerAccountNotFound:
					case Status.PayerAccountUnauthorized:
					case Status.ReceiptNotFound:
					case Status.RecordNotFound:
					case Status.ResultSizeLimitExceeded:
					case Status.TokenAlreadyAssociatedToAccount:
					case Status.TokenNotAssociatedToAccount:
					case Status.TokenNotAssociatedToFeeCollector:
					case Status.TokenHasNoWipeKey:
					case Status.TokenHasNoFeeScheduleKey:
					case Status.TokenHasNoFreezeKey:
					case Status.TokenHasNoKycKey:
					case Status.TokenHasNoSupplyKey:
					case Status.TokenWasDeleted:
					case Status.TokensPerAccountLimitExceeded:
				}
			} else if (error instanceof TransportStatusError) {
				// need to type assert because @ledgerhq/hw-transport's TransportStatusError doesn't expose statusCode property(?)
				switch ((error as TransportStatusError).statusCode) {
					case StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED:
					default:
				}
			}

			return error.message;
		},
	};
})();
