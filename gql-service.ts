import setup from './setup';

const http = require('http');

const url = setup.url;
const port = setup.port;
const path = '/' + setup.activeNodeName + '/graphql';

async function makeGraphQLRequest(
	operationType: 'query' | 'mutation',
	operationName: string,
	query: string,
	variables?: any
): Promise<any> {
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
		const req = http.request(options, (res: any) => {
			let data = '';

			res.on('data', (chunk:any) => {
				data += chunk;
			});

			res.on('end', () => {
				console.log(data);
				if (res.statusCode === 200) {
					resolve(JSON.parse(data).data);
				} else {
					console.error('GraphQL Request Failed with Status Code:', res.statusCode);
					reject(JSON.parse(data));
				}
			});
		});

		req.on('error', (error: any) => {
			console.error('GraphQL Request Error:', error);
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