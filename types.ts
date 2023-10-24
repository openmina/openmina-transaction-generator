export interface OpenminaTransactionGeneratorSetup {
	url: string;
	port: number | null | undefined;
	activeNodeName: string;
	network: 'testnet' | 'mainnet';
	otherNodes: string[];
	transactionsToSend: number;
}

export interface BenchmarksWallet {
	publicKey: string;
	privateKey: string;
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

export interface BenchmarksMempoolTx {
	from: string;
	nonce: number;
	memo: string;
	dateTime: string;
}

export interface BenchmarksWalletTransaction {
	amount: string;
	fee: string;
	memo: string;
	validUntil: string;
	from: string;
	to: string;
	nonce: string;
	privateKey: string;
}