export interface Setup {
	domain: string;
	port: number | null | undefined;
	activeNodeName: string; // ex: 'prod1'
	network: 'testnet' | 'mainnet';
	allNodes: string[];
	sendToAllNodes: boolean; // if false, send to activeNodeName only, otherwise send to allNodes 1 by 1 until transactionsToSend is reached
	transactionsToSend: number;
	transactionAmount: number;
	transactionFee: number;
}

export interface BaseWallet {
	publicKey: string;
	privateKey: string;
}

export interface Wallet extends BaseWallet {
	minaTokens: number;
	nonce: number;
	mempoolNonce?: number;
	lastTxTime?: string;
	lastTxMemo?: string;
	lastTxStatus?: string;
	successTx: number;
	failedTx: number;
	errorReason?: string;
}

export interface MempoolTx {
	from: string;
	nonce: number;
	memo: string;
	dateTime: string;
}

export interface Transaction {
	amount: string;
	fee: string;
	memo: string;
	validUntil: string;
	from: string;
	to: string;
	nonce: string;
	privateKey: string;
}