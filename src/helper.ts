import { MempoolTx, Setup, Wallet } from './types';

class Helper {
	static getRandomReceiver(currentWallet: Wallet, wallets: Wallet[]): string {
		const index = Math.floor(Math.random() * wallets.length);
		if (wallets[index].publicKey === currentWallet.publicKey) {
			return this.getRandomReceiver(currentWallet, wallets);
		}
		return wallets[index].publicKey;
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