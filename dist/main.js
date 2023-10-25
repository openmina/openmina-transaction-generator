"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const setup_1 = __importDefault(require("./src/setup"));
const tx_service_1 = require("./src/tx-service");
const helper_1 = __importDefault(require("./src/helper"));
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importStar(require("boxen"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.blue('🚀 Running...\n'));
        const setup = yield (0, setup_1.default)();
        console.log(chalk_1.default.green('⚙️ Configuration found\n'));
        let wallets = yield (0, tx_service_1.getAccounts)();
        console.log(chalk_1.default.green('💼 Retrieved wallets\n'));
        const mempoolTxs = yield (0, tx_service_1.getMempoolTransactions)();
        console.log(chalk_1.default.green('📊 Retrieved mempool transactions\n'));
        /*wallets = wallets.map(wallet => {
            const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
            const mempoolNonce = txsInMempool.length ? Math.max(...txsInMempool) : undefined;
            return ({ ...wallet, mempoolNonce });
        });*/
        let sentTxCount = 0;
        let successTxCount = 0;
        let failedTxCount = 0;
        let txsToSend = [];
        let sendFromRandomWallet = true;
        if (sendFromRandomWallet) {
            console.log(chalk_1.default.green(`🛠️Preparing ${setup.transactionsToSend} transactions to send\n`));
            txsToSend = wallets
                .slice(0, setup.transactionsToSend)
                .map((wallet, i) => {
                sentTxCount++;
                const nonce = helper_1.default.getNonceForWallet(wallet, mempoolTxs).toString();
                const counter = sentTxCount + i;
                const memo = `${Date.now()},${counter}`;
                const payment = {
                    from: wallet.publicKey,
                    nonce,
                    to: helper_1.default.getRandomReceiver(wallet, wallets),
                    fee: setup.transactionFee.toString(),
                    amount: setup.transactionAmount.toString(),
                    memo,
                    validUntil: '4294967295',
                };
                return Object.assign(Object.assign({}, payment), { privateKey: wallet.privateKey });
            });
        }
        console.log(chalk_1.default.green(`📤 Sending ${txsToSend.length} transactions\n`));
        for (const tx of txsToSend) {
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
            borderStyle: "classic" /* BorderStyle.Classic */,
            borderColor: 'green',
            backgroundColor: '#111',
        };
        const successStyle = chalk_1.default.green.bold.underline;
        const failedStyle = chalk_1.default.red.bold.underline;
        const urlStyle = chalk_1.default.cyan.underline.bold;
        const port = setup.port ? `:${setup.port}` : '';
        const operationsStatistics = [
            successStyle(`Success: ${successTxCount} transactions\n\n`),
            failedStyle(`Failed: ${failedTxCount} transactions\n\n`),
            'Check the transactions at:\n',
            urlStyle(`${setup.domain}${port}/explorer/transactions`),
        ].join('');
        const statsBox = (0, boxen_1.default)(operationsStatistics, boxenOptions);
        console.log(statsBox);
    });
}
run();
