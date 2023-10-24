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
exports.sendTransaction = exports.getMempoolTransactions = exports.getAccounts = void 0;
const mina_signer_1 = __importDefault(require("mina-signer"));
const wallets_1 = __importDefault(require("./wallets"));
const gql_service_1 = require("./gql-service");
const setup_1 = __importDefault(require("./setup"));
const client = new mina_signer_1.default({ network: setup_1.default.network });
function getAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        let query = '{';
        wallets_1.default.forEach((wallet, i) => query += `account${i}: account(publicKey: "${wallet.publicKey}") { nonce balance { liquid } }, `);
        query += '}';
        return (0, gql_service_1.makeGraphQLQuery)('getAccounts', query).then((response) => {
            return Object.keys(response).map((key, i) => (Object.assign(Object.assign({}, wallets_1.default[i]), { minaTokens: Number(response[`account${i}`].balance.liquid) / 1000000, nonce: Number(response[`account${i}`].nonce), successTx: 0, failedTx: 0 })));
        });
    });
}
exports.getAccounts = getAccounts;
function getMempoolTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, gql_service_1.makeGraphQLQuery)('getMempoolTransactions', '{ pooledUserCommands { ... on UserCommandPayment { nonce from } } }').then((response) => {
            return response.pooledUserCommands.map((tx) => {
                var _a;
                return ({
                    from: tx.from,
                    nonce: tx.nonce,
                    memo: tx.memoVerbatim,
                    dateTime: ((_a = tx.memoVerbatim) === null || _a === void 0 ? void 0 : _a.includes(',')) ? new Date(tx.memoVerbatim.split(',')[0]).toString() : undefined,
                });
            });
        });
    });
}
exports.getMempoolTransactions = getMempoolTransactions;
function sendTransaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const signedPayment = client.signPayment(transaction, transaction.privateKey);
        const signedTx = Object.assign(Object.assign({}, transaction), { field: signedPayment.signature.field, scalar: signedPayment.signature.scalar });
        const txBody = sendTxGraphQLMutationBody();
        return (0, gql_service_1.makeGraphQLMutation)('sendTx', txBody, signedTx).then((response) => {
            var _a, _b;
            return Object.assign(Object.assign({}, response.sendPayment.payment), { from: response.sendPayment.payment.from, memo: (_a = response.sendPayment.payment.memoVerbatim) !== null && _a !== void 0 ? _a : response.sendPayment.payment.memo, dateTime: ((_b = response.sendPayment.payment.memoVerbatim) === null || _b === void 0 ? void 0 : _b.includes(',')) ? new Date(response.sendPayment.payment.memoVerbatim.split(',')[0]).toString() : undefined });
        }, (err) => {
            var _a;
            const error = new Error(err.message);
            error.data = Object.assign(Object.assign({}, signedTx), { dateTime: ((_a = signedTx.memo) === null || _a === void 0 ? void 0 : _a.includes(',')) ? new Date(signedTx.memo.split(',')[0]).toString() : undefined });
            return { error };
        });
    });
}
exports.sendTransaction = sendTransaction;
function sendTxGraphQLMutationBody() {
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
