import { BenchmarksMempoolTx, BenchmarksWallet } from './types';

class Helper {
	static getRandomReceiver(currentWallet: BenchmarksWallet, wallets: BenchmarksWallet[]): string {
		const index = Math.floor(Math.random() * wallets.length);
		if (wallets[index].publicKey === currentWallet.publicKey) {
			return this.getRandomReceiver(currentWallet, wallets);
		}
		return wallets[index].publicKey;
	}

	static getNonceForWallet(wallet: BenchmarksWallet, mempoolTxs: BenchmarksMempoolTx[]): number {
		const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
		return Math.max(wallet.nonce, txsInMempool.length ? (Math.max(...txsInMempool) + 1) : 0);
	}
}

export default Helper;