"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tx_service_1 = require("./tx-service");
const helper_1 = __importDefault(require("./helper"));
const setup_1 = __importDefault(require("./setup"));
const chalk = require('chalk');
const boxen = require('boxen');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Running...');
        let sendFromRandomWallet = true;
        let wallets = yield (0, tx_service_1.getAccounts)();
        console.log('Retrieved wallets');
        const mempoolTxs = yield (0, tx_service_1.getMempoolTransactions)();
        console.log('Retrieved mempool transactions');
        wallets = wallets.map(wallet => {
            const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
            const mempoolNonce = txsInMempool.length ? Math.max(...txsInMempool) : undefined;
            return (Object.assign(Object.assign({}, wallet), { mempoolNonce }));
        });
        let sentTxCount = 0;
        let successTxCount = 0;
        let failedTxCount = 0;
        let sendingFee = 1;
        let txsToSend = [];
        if (sendFromRandomWallet) {
            console.log('Preparing ' + setup_1.default.transactionsToSend + ' transactions to send');
            txsToSend = wallets
                .slice(0, setup_1.default.transactionsToSend)
                .map((wallet, i) => {
                const nonce = helper_1.default.getNonceForWallet(wallet, mempoolTxs).toString();
                const counter = sentTxCount + i;
                const memo = Date.now() + ',' + (counter + 1);
                const payment = {
                    from: wallet.publicKey,
                    nonce,
                    to: helper_1.default.getRandomReceiver(wallet, wallets),
                    fee: (sendingFee * 1e9).toString(),
                    amount: '2000000000',
                    memo,
                    validUntil: '4294967295',
                };
                return Object.assign(Object.assign({}, payment), { privateKey: wallet.privateKey });
            });
        }
        console.log('Sending ' + txsToSend.length + ' transactions');
        for (const tx of txsToSend.slice(0, 5)) {
            yield (0, tx_service_1.sendTransaction)(tx).then((response) => {
                if (response.error) {
                    failedTxCount++;
                }
                else {
                    successTxCount++;
                }
            });
        }
        const boxenOptions = {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
            backgroundColor: '#555555',
        };
        const successStyle = chalk.green.bold.underline;
        const failedStyle = chalk.red.bold.underline;
        const urlStyle = chalk.blue.underline.bold;
        let port = setup_1.default.port ? `:${setup_1.default.port}` : '';
        const logMessage = [
            successStyle(`Success: ${successTxCount} transactions\n\n`),
            failedStyle(`Failed: ${failedTxCount} transactions\n\n`),
            'Check the transactions at:\n',
            urlStyle(`${setup_1.default.url}${port}/explorer/transactions?node=${setup_1.default.activeNodeName}`),
        ].join('');
        const msgBox = boxen(logMessage, boxenOptions);
        console.log(msgBox);
    });
}
run();
