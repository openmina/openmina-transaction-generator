import { getAccounts, getMempoolTransactions, sendTransaction } from './tx-service';
import { BenchmarksMempoolTx, BenchmarksWallet, BenchmarksWalletTransaction } from './types';
import Helper from './helper';
import setup from './setup';

const chalk = require('chalk');
const boxen = require('boxen');

async function run() {
	console.log('Running...');
	let sendFromRandomWallet: boolean = true;
	let wallets: BenchmarksWallet[] = await getAccounts();
	console.log('Retrieved wallets');
	const mempoolTxs: BenchmarksMempoolTx[] = await getMempoolTransactions();
	console.log('Retrieved mempool transactions');
	wallets = wallets.map(wallet => {
		const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
		const mempoolNonce = txsInMempool.length ? Math.max(...txsInMempool) : undefined;
		return ({ ...wallet, mempoolNonce });
	});
	let sentTxCount = 0;
	let successTxCount = 0;
	let failedTxCount = 0;
	let sendingFee = 1;
	let txsToSend: BenchmarksWalletTransaction[] = [];

	if (sendFromRandomWallet) {
		console.log('Preparing ' + setup.transactionsToSend + ' transactions to send');
		txsToSend = wallets
			.slice(0, setup.transactionsToSend)
			.map((wallet: BenchmarksWallet, i: number) => {
				const nonce = Helper.getNonceForWallet(wallet, mempoolTxs).toString();
				const counter = sentTxCount + i;
				const memo = Date.now() + ',' + (counter + 1);
				const payment = {
					from: wallet.publicKey,
					nonce,
					to: Helper.getRandomReceiver(wallet, wallets),
					fee: (sendingFee * 1e9).toString(),
					amount: '2000000000',
					memo,
					validUntil: '4294967295',
				};

				return {
					...payment,
					privateKey: wallet.privateKey,
				};
			});
	}

	console.log('Sending ' + txsToSend.length + ' transactions');
	for (const tx of txsToSend.slice(0, 5)) {
		await sendTransaction(tx).then((response: any) => {
			if (response.error) {
				failedTxCount++;
			} else {
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

	let port = setup.port ? `:${setup.port}` : '';
	const logMessage = [
		successStyle(`Success: ${successTxCount} transactions\n\n`),
		failedStyle(`Failed: ${failedTxCount} transactions\n\n`),
		'Check the transactions at:\n',
		urlStyle(`${setup.url}${port}/explorer/transactions?node=${setup.activeNodeName}`),
	].join('');

	const msgBox = boxen(logMessage, boxenOptions);
	console.log(msgBox);
}

run();

