export interface Setup {
	domain: string;
	port: number | null | undefined;
	network: 'testnet' | 'mainnet';
	allNodes: string[];
	sendToAllNodes: boolean; // right now this is true only. False is not implemented
	transactionsToSend: number;
	transactionAmount: number;
	transactionFee: number;
	wallets: BaseWallet[];
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