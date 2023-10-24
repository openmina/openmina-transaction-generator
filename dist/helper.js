"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Helper {
    static getRandomReceiver(currentWallet, wallets) {
        const index = Math.floor(Math.random() * wallets.length);
        if (wallets[index].publicKey === currentWallet.publicKey) {
            return this.getRandomReceiver(currentWallet, wallets);
        }
        return wallets[index].publicKey;
    }
    static getNonceForWallet(wallet, mempoolTxs) {
        const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
        return Math.max(wallet.nonce, txsInMempool.length ? (Math.max(...txsInMempool) + 1) : 0);
    }
}
exports.default = Helper;
