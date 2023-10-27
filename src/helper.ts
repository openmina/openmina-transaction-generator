import { MempoolTx, Wallet } from './types';

class Helper {

	static getNextReceiver(currentIndex: number, wallets: Wallet[]): string {
		if (currentIndex === wallets.length - 1) {
			return wallets[0].publicKey;
		}
		return wallets[currentIndex + 1].publicKey;
	}

	static getNonceForWallet(wallet: Wallet, mempoolTxs: MempoolTx[]): number {
		const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
		const mempoolNonce = txsInMempool.length ? (Math.max(...txsInMempool) + 1) : 0;
		return Math.max(wallet.nonce, mempoolNonce);
	}

	static sendTxGraphQLMutationBody(): string {
		return `
    ($fee: UInt64!, $amount: UInt64!,
    $to: PublicKey!, $from: PublicKey!, $nonce:UInt32, $memo: String,
    $validUntil: UInt32,$scalar: String!, $field: String!
    ) {
      sendPayment(
        input: {
          fee: $fee,
          amount: $amount,
          to: $to,
          from: $from,
          memo: $memo,
          nonce: $nonce,
          validUntil: $validUntil
        },
        signature: {
          field: $field, scalar: $scalar
        }) {
        payment {
          amount
          fee
          feeToken
          from
          hash
          id
          isDelegation
          memo
          nonce
          kind
          to
        }
      }
    }`;
	}

}

export default Helper;