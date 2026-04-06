import { db } from '../index';
import * as table from '../schemas/index';
import { eq } from 'drizzle-orm';

export async function seedCompanies() {
	console.log('[SEED] Seeding companies...');
	const existing = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'SUP-001')
	});

	if (!existing) {
		console.log('Creating default company...');
		await db.insert(table.companies).values({
			id: crypto.randomUUID(),
			name: 'Supplyra Solutions',
			slug: 'supplyra-solutions',
			isPublic: true,
			code: 'SUP-001',
			email: 'admin@supplyra.example.com',
			createdAt: new Date(),
			updatedAt: new Date()
		});
	} else {
		console.log('Updating default company...');
		await db
			.update(table.companies)
			.set({
				name: 'Supplyra Solutions',
				slug: 'supplyra-solutions',
				isPublic: true,
				themeConfig: { primary: '#3b82f6' }
			})
			.where(eq(table.companies.id, existing.id));
	}

	// 2. Dummy Subsidiary
	const company2 = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'DUM-002')
	});

	if (!company2) {
		console.log('Creating second company (Dummy Subsidiary)...');
		await db.insert(table.companies).values({
			id: crypto.randomUUID(),
			name: 'Dummy Subsidiary',
			slug: 'dummy-subsidiary',
			isPublic: true,
			code: 'DUM-002',
			email: 'info@dummy.example.com',
			createdAt: new Date(),
			updatedAt: new Date(),
			themeConfig: { primary: '#10b981' }
		});
	}
}
