import axios from "axios";

import { walletstores} from "../../components/wallet-stores";
import type { CryptoTransfer } from "../../interfaces/CryptoTransfer";
import { walletstore } from "../../stores/wallet";

export async function getTransfer(options: { hash: string } ): Promise<CryptoTransfer> {
    const store = walletstore;
    const network = store.getNetwork();

    const resp = await axios.get(`https://v2.api${network}.kabuto.sh/transaction?filter[entityId]=${store.accountId}`)
        .then(({ data }) => data)
        .catch((error: Error) => {
            throw error;
        });

    return resp.data.filter((transfer: CryptoTransfer)=> transfer.hash === options.hash)[0];
}
