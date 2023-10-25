import { Setup } from './types';
import fs from 'fs/promises';
import path from 'path';

let setup: Setup;

async function readSetup(): Promise<Setup> {
	if (setup) {
		return setup;
	}
	const fileName = '../setup.json';
	const filePath = path.join(__dirname, fileName);

	try {
		const data = await fs.readFile(filePath, 'utf8');
		setup = JSON.parse(data);
		cleanDomain(setup);
	} catch (error) {
		console.error('Error reading or parsing the file:', error);
	}
	return setup;
}

function cleanDomain(setup: Setup): void {
	if (setup.domain.endsWith('/')) {
		setup.domain = setup.domain.slice(0, -1);
	}
	setup.domain = setup.domain.replace('https://', '').replace('http://', '');
}

export default readSetup;