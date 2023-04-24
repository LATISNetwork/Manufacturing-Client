import type { Client } from "@hashgraph/sdk";
import type { BigNumber } from "bignumber.js";

import type { SimpleTransfer } from "../../components/hedera";
import { walletstores} from "../../components/wallet-stores";
import { walletstore } from "../../stores/wallet";
export async function transfer(
  client: Client,
  options: {
    transfers: SimpleTransfer[];
    memo: string | null;
    maxFee: BigNumber | null; // tinybars
    onBeforeConfirm?: () => void;
  }
): Promise<void> {
  const { TransferTransaction, Hbar } = await import("@hashgraph/sdk");

  const transaction = new TransferTransaction();
  const store = walletstore;

  let outgoingHbarAmount = 0;
  transaction.setTransactionMemo(options.memo ?? "");
  transaction.setMaxTransactionFee(options.maxFee ?? new Hbar(1));

  for (const transfer of options.transfers) {
    if (transfer.asset === "HBAR") {
      transaction.addHbarTransfer(transfer.to ?? "", transfer.amount?.toNumber());
      outgoingHbarAmount = outgoingHbarAmount + Number(transfer.amount?.negated().toString().replace(" ℏ", ""));
    } else {

      const amount = transfer.amount?.multipliedBy(Math.pow(10, store.balance!.tokens!.get(transfer.asset)!.decimals));
      transaction.addTokenTransfer(
        transfer.asset ?? "",
        transfer.to ?? "",
        amount?.toNumber()
      );
      transaction.addTokenTransfer(
        transfer.asset ?? "",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        client.operatorAccountId!,
        amount?.negated().toNumber()
      );
    }
  }

  if(outgoingHbarAmount !== 0) transaction.addHbarTransfer(client.operatorAccountId, new Hbar(outgoingHbarAmount));

  const resp = await transaction.execute(client);

  options.onBeforeConfirm?.();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const receipt = await resp.getReceipt(client);
}
