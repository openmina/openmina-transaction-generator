import readSetup from './src/setup';
import { MempoolTx, Setup, Transaction, Wallet } from './src/types';
import { getAccounts, getMempoolTransactions, sendTransaction } from './src/tx-service';
import Helper from './src/helper';
import chalk, { Chalk } from 'chalk';
import boxen, { BorderStyle } from 'boxen';

async function run() {
	console.log(chalk.blue('🚀 Running...\n'));

	const setup: Setup = await readSetup();
	console.log(chalk.green('⚙️ Configuration found\n'));

	let wallets: Wallet[] = await getAccounts();
	console.log(chalk.green('💼 Retrieved wallets\n'));

	const mempoolTxs: MempoolTx[] = await getMempoolTransactions();
	console.log(chalk.green('📊 Retrieved mempool transactions\n'));

	/*wallets = wallets.map(wallet => {
		const txsInMempool = mempoolTxs.filter(tx => tx.from === wallet.publicKey).map(tx => tx.nonce);
		const mempoolNonce = txsInMempool.length ? Math.max(...txsInMempool) : undefined;
		return ({ ...wallet, mempoolNonce });
	});*/
	let sentTxCount = 0;
	let successTxCount = 0;
	let failedTxCount = 0;
	let txsToSend: Transaction[] = [];
	let sendFromRandomWallet: boolean = true;

	if (sendFromRandomWallet) {
		console.log(chalk.green(`🛠 ️Preparing ${setup.transactionsToSend} transactions to send\n`));
		txsToSend = wallets
			.slice(0, setup.transactionsToSend)
			.map((wallet: Wallet, i: number) => {
				sentTxCount++;
				const nonce = Helper.getNonceForWallet(wallet, mempoolTxs).toString();
				const counter = sentTxCount + i;
				const memo = `${Date.now()},${counter}`;
				const payment = {
					from: wallet.publicKey,
					nonce,
					to: Helper.getRandomReceiver(wallet, wallets),
					fee: setup.transactionFee.toString(),
					amount: setup.transactionAmount.toString(),
					memo,
					validUntil: '4294967295',
				};

				return {
					...payment,
					privateKey: wallet.privateKey,
				};
			});
	}

	console.log(chalk.green(`📤 Sending ${txsToSend.length} transactions\n`));
	for (const tx of txsToSend) {
		await sendTransaction(tx).then((response: any) => {
			if (response.error) {
				failedTxCount++;
			} else {
				successTxCount++;
			}
		});
	}

	const boxenOptions: boxen.Options = {
		padding: 1,
		margin: 1,
		borderStyle: BorderStyle.Classic,
		borderColor: 'green',
		backgroundColor: '#111',
	};

	const successStyle: Chalk = chalk.green.bold.underline;
	const failedStyle: Chalk = chalk.red.bold.underline;
	const urlStyle: Chalk = chalk.cyan.underline.bold;

	const port: string = setup.port ? `:${setup.port}` : '';
	const operationsStatistics: string = [
		successStyle(`Success: ${successTxCount} transactions\n\n`),
		failedStyle(`Failed: ${failedTxCount} transactions\n\n`),
		'Check the transactions at:\n',
		urlStyle(`${setup.domain}${port}/explorer/transactions`),
	].join('');

	const statsBox = boxen(operationsStatistics, boxenOptions);
	console.log(statsBox);
}

run();
