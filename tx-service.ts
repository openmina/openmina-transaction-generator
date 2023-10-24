import Client from 'mina-signer';
import WALLETS from './wallets';
import { makeGraphQLMutation, makeGraphQLQuery } from './gql-service';
import { BenchmarksMempoolTx, BenchmarksWallet, BenchmarksWalletTransaction } from './types';
import setup from './setup';

const client: Client = new Client({ network: setup.network });

export async function getAccounts(): Promise<BenchmarksWallet[]> {
	let query = '{';
	WALLETS.forEach((wallet, i: number) => query += `account${i}: account(publicKey: "${wallet.publicKey}") { nonce balance { liquid } }, `);
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

export async function getMempoolTransactions(): Promise<BenchmarksMempoolTx[]> {
	return makeGraphQLQuery('getMempoolTransactions', '{ pooledUserCommands { ... on UserCommandPayment { nonce from } } }').then((response: any) => {
		return response.pooledUserCommands.map((tx: any) => ({
			from: tx.from,
			nonce: tx.nonce,
			memo: tx.memoVerbatim,
			dateTime: tx.memoVerbatim?.includes(',') ? new Date(tx.memoVerbatim.split(',')[0]).toString() : undefined,
		} as BenchmarksMempoolTx));
	});
}

export async function sendTransaction(transaction: BenchmarksWalletTransaction): Promise<BenchmarksWalletTransaction | { error: Error }> {
	const signedPayment = client.signPayment(transaction, transaction.privateKey);
	const signedTx = {
		...transaction,
		field: signedPayment.signature.field,
		scalar: signedPayment.signature.scalar,
	};

	const txBody: string = sendTxGraphQLMutationBody();
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

function sendTxGraphQLMutationBody(): string {
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
