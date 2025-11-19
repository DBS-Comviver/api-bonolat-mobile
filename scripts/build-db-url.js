const fs = require('fs');
const path = require('path');
require('dotenv').config();

function buildDatabaseUrl() {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	const dbType = process.env.DB_TYPE || 'mysql';
	const dbUser = process.env.DB_USER;
	const dbPassword = process.env.DB_PASSWORD || '';
	const dbHost = process.env.DB_HOST || 'localhost';
	const dbPort = process.env.DB_PORT || '3306';
	const dbName = process.env.DB_NAME || 'portal_dbs_tst';

	if (dbUser && dbPassword) {
		const encodedPassword = encodeURIComponent(dbPassword);
		return `${dbType}://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;
	}

	return null;
}

const databaseUrl = buildDatabaseUrl();

if (databaseUrl) {
	const envPath = path.join(process.cwd(), '.env');
	let envContent = '';

	if (fs.existsSync(envPath)) {
		envContent = fs.readFileSync(envPath, 'utf8');
	}

	if (!envContent.includes('DATABASE_URL=')) {
		envContent += `\n# Auto-generated DATABASE_URL from individual variables\nDATABASE_URL=${databaseUrl}\n`;
		fs.writeFileSync(envPath, envContent, 'utf8');
		console.log('DATABASE_URL construída e adicionada ao .env');
	} else {
		const lines = envContent.split('\n');
		const updatedLines = lines.map(line => {
			if (line.startsWith('DATABASE_URL=')) {
				return `DATABASE_URL=${databaseUrl}`;
			}
			return line;
		});
		fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
		console.log('DATABASE_URL atualizada no .env');
	}

	process.env.DATABASE_URL = databaseUrl;
} else {
	console.error('Erro: DATABASE_URL não pôde ser construída. Verifique se DB_USER e DB_PASSWORD estão definidos no .env');
	process.exit(1);
}

