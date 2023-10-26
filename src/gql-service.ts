import { Setup } from './types';
import readSetup from './setup';
import { RequestOptions } from 'http';
import http from 'http';
import chalk from 'chalk';

async function makeGraphQLRequest(
	operationType: 'query' | 'mutation',
	nodeName: string,
	operationName: string,
	query: string,
	variables?: any,
): Promise<any> {
	const setup: Setup = await readSetup();
	const graphqlQuery = `${operationType} ${operationName} ${query}`;

	const options: RequestOptions = {
		hostname: setup.domain,
		port: setup.port,
		path: (nodeName ? ('/' + nodeName) : '') + '/graphql',
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
				let response ;
				try {
					 response = JSON.parse(data);
				} catch (e) {
					console.error(chalk.red('❌  GraphQL response is not a valid JSON: ' + e));
					reject(e);
				}
				if (res.statusCode === 200 && !response.errors) {
					resolve(response.data);
				} else {
					if (res.statusCode === 200) {
						console.error(chalk.red('❌  GraphQL request failed with error:', response.errors[0].message));
					} else {
						console.error(chalk.red('❌  GraphQL request failed with status code:', res.statusCode));
					}
					reject(response);
				}
			});
		});

		req.on('error', (error: any) => {
			console.error(chalk.red('❌  GraphQL Request Error:', error));
			reject(error);
		});

		req.write(requestBody);
		req.end();
	});
}

export async function makeGraphQLQuery(nodeName: string, queryName: string, query: string, variables?: any): Promise<any> {
	return makeGraphQLRequest('query', nodeName, queryName, query, variables);
}

export async function makeGraphQLMutation(nodeName: string, mutationName: string, query: string, variables?: any): Promise<any> {
	return makeGraphQLRequest('mutation', nodeName, mutationName, query, variables);
}