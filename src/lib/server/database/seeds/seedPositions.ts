// src/lib/server/db/seed/seedPositions.ts
import { PositionService } from '../../../server/modules/position/service';
import { positions as positionsData } from '../../../config/app';
import { db } from '../index';
import { eq } from 'drizzle-orm';
import * as table from '../schemas/index';

const positionService = new PositionService();

export async function seedPositions() {
	console.log('[SEED] Seeding positions...');

	const company = await db.query.companies.findFirst({
		where: (t, { eq }) => eq(t.code, 'SUP-001')
	});

	if (!company) {
		console.error('[WARN] Default company not found. Skipping position seeding.');
		return;
	}

	for (const position of positionsData) {
		let baseSalary = '0';
		const nameLower = position.name.toLowerCase();

		// Estimation Logic (Same as Salary Components)
		if (
			nameLower.includes('chief') ||
			nameLower.includes('ceo') ||
			nameLower.includes('cto') ||
			nameLower.includes('komisaris')
		) {
			baseSalary = '35000000';
		} else if (nameLower.includes('manager')) {
			baseSalary = '12000000';
		} else if (nameLower.includes('software engineer') || nameLower.includes('network engineer')) {
			baseSalary = '10000000';
		} else if (
			nameLower.includes('web developer') ||
			nameLower.includes('mobile developer') ||
			nameLower.includes('quality') ||
			nameLower.includes('ui/ux')
		) {
			baseSalary = '6000000';
		} else if (nameLower.includes('cleaning')) {
			baseSalary = '2800000';
		} else {
			// Staff / Admin / Marketing / Accounting / Others
			baseSalary = '5000000';
		}

		const existing = await db.query.positions.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.name, position.name))
		});

		if (!existing) {
			await positionService.create({
				...position,
				companyId: company.id,
				baseSalary: baseSalary
			});
		} else {
			// Update baseSalary if it's 0 or to enforce standard
			await db
				.update(table.positions)
				.set({ baseSalary: baseSalary })
				.where(eq(table.positions.id, existing.id));
		}
	}
	console.log('[SUCCESS] Positions seeded/updated successfully.');
}
