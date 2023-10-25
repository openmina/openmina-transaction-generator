import Client from 'mina-signer';
import WALLETS from './wallets';
import { makeGraphQLMutation, makeGraphQLQuery } from './gql-service';
import { MempoolTx, Wallet, Transaction, BaseWallet } from './types';
import readSetup from './setup';
import Helper from './helper';

let client: Client;

export async function getAccounts(): Promise<Wallet[]> {
	let query = '{';
	WALLETS.forEach((wallet: BaseWallet, i: number) => query += `account${i}: account(publicKey: "${wallet.publicKey}") { nonce balance { liquid } }, `);
	query += '}';

	return makeGraphQLQuery('getAccounts', query).then((response: any) => {
		return Object.keys(response).map((key: any, i: number) => ({
			...WALLETS[i],
			minaTokens: Number(response[`account${i}`].balance.liquid) / 1000000,
			nonce: Number(response[`account${i}`].nonce),
			successTx: 0,
			failedTx: 0,
		}));
	});
}

export async function getMempoolTransactions(): Promise<MempoolTx[]> {
	return makeGraphQLQuery('getMempoolTransactions', '{ pooledUserCommands { ... on UserCommandPayment { nonce from } } }')
		.then(
			(response: any) => response.pooledUserCommands.map((tx: any) => ({
				from: tx.from,
				nonce: tx.nonce,
				memo: tx.memoVerbatim,
				dateTime: tx.memoVerbatim?.includes(',') ? new Date(tx.memoVerbatim.split(',')[0]).toString() : undefined,
			} as MempoolTx)),
		);
}

export async function sendTransaction(transaction: Transaction): Promise<Transaction | { error: Error }> {
	const client = await getClient();
	const signedPayment = client.signPayment(transaction, transaction.privateKey);
	const signedTx = {
		...transaction,
		field: signedPayment.signature.field,
		scalar: signedPayment.signature.scalar,
	};

	const txBody: string = Helper.sendTxGraphQLMutationBody();
	return makeGraphQLMutation('sendTx', txBody, signedTx).then(
		(response: any) => {
			return {
				...response.sendPayment.payment,
				from: response.sendPayment.payment.from,
				memo: response.sendPayment.payment.memoVerbatim ?? response.sendPayment.payment.memo,
				dateTime: response.sendPayment.payment.memoVerbatim?.includes(',') ? new Date(response.sendPayment.payment.memoVerbatim.split(',')[0]).toString() : undefined,
			};
		},
		(err: any) => {
			const error = new Error(err.message);
			(error as any).data = {
				...signedTx,
				dateTime: signedTx.memo?.includes(',') ? new Date(signedTx.memo.split(',')[0]).toString() : undefined,
			};
			return { error };
		},
	);
}

async function getClient(): Promise<Client> {
	if (client) {
		return client;
	}
	const setup = await readSetup();
	client = new Client({ network: setup.network });
	return client;
}
