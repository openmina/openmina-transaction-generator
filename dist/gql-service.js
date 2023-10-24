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
exports.makeGraphQLMutation = exports.makeGraphQLQuery = void 0;
const setup_1 = __importDefault(require("./setup"));
const http = require('http');
const url = setup_1.default.url;
const port = setup_1.default.port;
const path = '/' + setup_1.default.activeNodeName + '/graphql';
function makeGraphQLRequest(operationType, operationName, query, variables) {
    return __awaiter(this, void 0, void 0, function* () {
        const graphqlQuery = `${operationType} ${operationName} ${query}`;
        const options = {
            hostname: url,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        console.log(options);
        const requestBody = JSON.stringify({
            query: graphqlQuery,
            variables,
        });
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    console.log(data);
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data).data);
                    }
                    else {
                        console.error('GraphQL Request Failed with Status Code:', res.statusCode);
                        reject(JSON.parse(data));
                    }
                });
            });
            req.on('error', (error) => {
                console.error('GraphQL Request Error:', error);
                reject(error);
            });
            req.write(requestBody);
            req.end();
        });
    });
}
function makeGraphQLQuery(queryName, query, variables) {
    return __awaiter(this, void 0, void 0, function* () {
        return makeGraphQLRequest('query', queryName, query, variables);
    });
}
exports.makeGraphQLQuery = makeGraphQLQuery;
function makeGraphQLMutation(mutationName, query, variables) {
    return __awaiter(this, void 0, void 0, function* () {
        return makeGraphQLRequest('mutation', mutationName, query, variables);
    });
}
exports.makeGraphQLMutation = makeGraphQLMutation;
