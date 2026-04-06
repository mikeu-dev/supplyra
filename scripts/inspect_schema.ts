import 'dotenv/config';
import postgres from 'postgres';

async function main() {
	const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

	try {
		// Check if companies table exists
		const companiesCheck = await sql`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_schema = 'public' AND table_name = 'companies'
			) as exists
		`;
		console.log(
			companiesCheck[0].exists ? 'Companies table exists.' : 'Companies table does NOT exist.'
		);

		// Get positions table DDL
		try {
			const cols = await sql`
				SELECT column_name, data_type, is_nullable
				FROM information_schema.columns
				WHERE table_name = 'positions' AND table_schema = 'public'
				ORDER BY ordinal_position
			`;
			console.log('Positions columns:', cols);
		} catch {
			console.log('Positions table does NOT exist.');
		}
	} finally {
		await sql.end();
	}
}

main();
