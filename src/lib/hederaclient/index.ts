import type { AccountId, Client } from "@hashgraph/sdk";
import axios from "axios";

import type { Wallet } from "../components/ledgerabstract";
import type {
    HederaService,
    MirrorAccountInfo,
    SimpleHederaClient,
} from "../components/hedera";

import { SimpleHederaClientImpl } from "./client";

export class HederaServiceImpl implements HederaService {
    async createClient(options: {
        wallet: Wallet;
        network:
            | string
            | {
                  [key: string]: string | AccountId;
              };
        keyIndex: number;
        accountId: AccountId;
    }): Promise<Client | null> {
        const { Client, AccountId } = await import("@hashgraph/sdk");

        let client;

        if (typeof options.network === "string") {
            if (options.network === "mainnet") {
                // HACK: node 0.0.3 is offline
                client = Client.forNetwork({
                    "https://node01-00-grpc.swirlds.com:443": new AccountId(4),
                });
                // client = Client.forMainnet();
            } else {
                // HACK: the NetworkName type is not exported
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                client = Client.forName(options.network as any);
            }
        } else {
            client = Client.forNetwork(options.network);
        }

        // NOTE: important, ensure that we pre-compute the health state of all nodes
        await client.pingAll();

        const transactionSigner = await options.wallet.getTransactionSigner(
            options.keyIndex
        );

        const privateKey = await options.wallet.getPrivateKey(options.keyIndex);
        const publicKey = await options.wallet.getPublicKey(options.keyIndex);

        if (publicKey == null) {
            return null;
        }

        // TODO: Fix <- What does this mean?
        client.setOperatorWith(
            options.accountId,
            publicKey ?? "",
            transactionSigner
        );

        if (!(await testClientOperatorMatch(client))) {
            return null;
        }

        return client;
    }

    

    async getMirrorAccountInfo(
        network: "mainnet" | "testnet" | "previewnet",
        accountId: AccountId
    ): Promise<MirrorAccountInfo> {
        let urlBase = "";
        switch (network) {
            case "mainnet":
                urlBase = "mainnet-public";
                break;
            case "testnet":
                urlBase = "testnet";
                break;
            case "previewnet":
                urlBase = "previewnet";
                break;
        }

        const response = await axios.get<MirrorAccountInfo>(
            `https://${urlBase}.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
        );
        return response.data;
    }
}

/** Does the operator key belong to the operator account */
async function testClientOperatorMatch(client: Client) {
    const { TransferTransaction, Hbar, Status, StatusError } = await import(
        "@hashgraph/sdk"
    );

    const tx = new TransferTransaction()
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        .addHbarTransfer(client.operatorAccountId!, Hbar.fromTinybars(0))
        .setMaxTransactionFee(Hbar.fromTinybars(1));

    try {
        await tx.execute(client);
    } catch (err) {
        if (err instanceof StatusError) {
            if (
                err.status === Status.InsufficientTxFee ||
                err.status === Status.InsufficientPayerBalance
            ) {
                // If the transaction fails with Insufficient Tx Fee, this means
                // that the account ID verification succeeded before this point
                // Same for Insufficient Payer Balance

                return true;
            }

            return false;
        }

        throw err;
    }

    // under *no* cirumstances should this transaction succeed
    throw new Error(
        "unexpected success of intentionally-erroneous transaction to confirm account ID"
    );
}
