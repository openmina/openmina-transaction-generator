import { Setup } from './types';
import readSetup from './setup';
import { RequestOptions } from 'http';
import Helper from './helper';
import http from 'http';

async function makeGraphQLRequest(
	operationType: 'query' | 'mutation',
	operationName: string,
	query: string,
	variables?: any,
): Promise<any> {
	const setup: Setup = await readSetup();
	const graphqlQuery = `${operationType} ${operationName} ${query}`;

	const options: RequestOptions = {
		hostname: setup.domain,
		port: setup.port,
		path: '/' + Helper.getTargetNodeName(setup) + '/graphql',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	};

	const requestBody: string = JSON.stringify({
		query: graphqlQuery,
		variables,
	});

	return new Promise((resolve, reject) => {
		const req = http.request(options, (res: any) => {
			let data = '';

			res.on('data', (chunk: any) => {
				data += chunk;
			});

			res.on('end', () => {
				const response = JSON.parse(data);
				if (res.statusCode === 200 && !response.errors) {
					resolve(response.data);
				} else {
					if (res.statusCode === 200) {
						console.error('❌  GraphQL request failed with error:', response.errors[0].message);
					} else {
						console.error('❌  GraphQL request failed with status code:', res.statusCode);
					}
					reject(response);
				}
			});
		});

		req.on('error', (error: any) => {
			console.error('❌  GraphQL Request Error:', error);
			reject(error);
		});

		req.write(requestBody);
		req.end();
	});
}

export async function makeGraphQLQuery(queryName: string, query: string, variables?: any): Promise<any> {
	return makeGraphQLRequest('query', queryName, query, variables);
}

export async function makeGraphQLMutation(mutationName: string, query: string, variables?: any): Promise<any> {
	return makeGraphQLRequest('mutation', mutationName, query, variables);
}