import readSetup from './src/setup';
import { Setup, Transaction } from './src/types';
import { getAccounts, getMempoolTransactions, sendTransaction } from './src/tx-service';
import Helper from './src/helper';
import chalk, { Chalk } from 'chalk';
import boxen, { BorderStyle } from 'boxen';

async function run() {
	console.log(chalk.blue('🚀 Running...\n'));

	const setup: Setup = await readSetup();
	console.log(chalk.green('⚙️ Configuration found\n'));
	const WALLETS = setup.wallets;

	let sentTxCount = 0;
	let successTxCount = 0;
	let failedTxCount = 0;

	console.log(chalk.green(`📤 Sending ${setup.transactionsToSend} transactions to send\n`));
	for (let i = 0; i < WALLETS.slice(0, setup.transactionsToSend).length; i++) {
		try {
			const wallet = WALLETS[i];
			sentTxCount++;
			const currentNode = setup.allNodes[i % setup.allNodes.length];
			const walletsFromCurrentNode = await getAccounts(currentNode);
			const mempoolTxsFromCurrentNode = await getMempoolTransactions(currentNode);
			const nonce = Helper.getNonceForWallet(walletsFromCurrentNode[i], mempoolTxsFromCurrentNode).toString();
			const counter = sentTxCount + i;
			const memo = `${Date.now()},${counter}`;
			const tx: Transaction = {
				from: wallet.publicKey,
				nonce,
				to: Helper.getNextReceiver(i, walletsFromCurrentNode),
				fee: (setup.transactionFee * 1000000000).toString(),
				amount: (setup.transactionAmount * 1000000000).toString(),
				memo,
				validUntil: '4294967295',
				privateKey: wallet.privateKey,
			};

			try {
				await sendTransaction(currentNode, tx).then(async (response: any) => {
					if (response.error) {
						failedTxCount++;
					} else {
						successTxCount++;
					}
				});
			} catch (e) {
				failedTxCount++;
			}
		} catch (e: any) {
			failedTxCount++;
			console.log(chalk.red('❌  Error on preparing a transaction:', e.message));
		}
	}

	/*
		console.log(chalk.green(`📤 Sending ${txsToSend.length} transactions\n`));
		for (const { nodeName, tx } of txsToSend) {
			try {
				await sendTransaction(nodeName, tx).then(async (response: any) => {
					if (response.error) {
						// if (response.error.message.includes('Insufficient_replace_fee')) {
						// 	console.log('trying again');
						// 	await sendTransaction(nodeName, { ...tx, fee: tx.fee + '0' }).then((response: any) => {
						// 		console.log('conclusion');
						// 		if (response.error) {
						// 			console.log('failed');
						// 			failedTxCount++;
						// 		} else {
						// 			console.log('success');
						// 			successTxCount++;
						// 		}
						// 	});
						// } else {
						failedTxCount++;
						// }
					} else {
						successTxCount++;
					}
				});
			} catch (e) {
				failedTxCount++;
			}*/

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
