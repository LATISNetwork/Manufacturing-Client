import type { BigNumber } from 'bignumber.js';
import { BigNumber as BigNum } from 'bignumber.js';
import type { AccountId, FileId, PrivateKey, PublicKey, TokenId, TokenInfo, Client } from '@hashgraph/sdk';

import type { Wallet } from './ledgerabstract';
import type { CryptoTransfer } from './cryptotransfer';

export interface SimpleTransfer {
	// HBAR or Token ID (as string)
	asset?: string;
	to?: AccountId;
	// amount must be in low denom
	amount?: BigNum.Instance;
}

export interface AccountBalance {
	// balance here in hbars
	hbars: BigNumber;
	tokens: Map<string, TokenBalance>;
}

export interface TokenBalance {
	// balance has already had decimals applied
	balance: BigNumber;
	decimals: number;
}

export interface HederaService {
	// returns null if the account ID does not match the chosen key
	createClient(options: {
		network:
			| string
			| {
					[key: string]: string | AccountId;
			  };
		wallet: Wallet;
		// index into the wallet, meaning depends on the wallet type
		// 0 always means the canonical key for the wallet
		keyIndex: number;
		// account ID we wish to associate with the wallet
		accountId: AccountId;
	}): Promise<Client | null>;

	getMirrorAccountInfo(
		network: 'mainnet' | 'testnet' | 'previewnet',
		accountId: AccountId,
	): Promise<MirrorAccountInfo>;
}

export interface SimpleHederaClient {
	// get the associated private key, if available
	getPrivateKey(): PrivateKey | null;

	// get the associated public key
	getPublicKey(): PublicKey;

	// get the associated account ID
	getAccountId(): AccountId;

	// returns the account balance in HBARs
	getAccountBalance(): Promise<AccountBalance>;

	transfer(options: {
		transfers: SimpleTransfer[];
		memo: string | null;
		maxFee: BigNumber | null; // tinybars
		onBeforeConfirm?: () => void;
	}): Promise<void>;

	createAccount(options: {
		publicKey: PublicKey;
		initialBalance: BigNumber;
	}): Promise<AccountId | null>;

	associateToken(options: { account: AccountId; tokens: TokenId[] }): Promise<void>;

	uploadFile(options: {
		file: Uint8Array;
		fileMemo: string | null;
		memo: string | null;
	}): Promise<FileId | null>;

	downloadFile(options: { fileId: FileId }): Promise<Uint8Array | null>;

	getAccountRecords(): Promise<CryptoTransfer[] | undefined>;

	getTokenInfo(options: { token: string | TokenId }): Promise<TokenInfo>;

	getTransfer(options: { hash: string }): Promise<CryptoTransfer>;

	updateStaking(options: {
		accountId: AccountId;
		node: number | null;
		declineRewards: boolean;
	}): Promise<void>;
}

export interface MirrorAccountInfo {
	account: string;
	staked_account_id?: string;
	staked_node_id?: number;
	stake_period_start?: number;
}
