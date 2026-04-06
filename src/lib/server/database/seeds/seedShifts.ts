// src/lib/server/db/seed/seedShifts.ts
import { ShiftService } from '../../../server/modules/shift/service';
import { shifts as shiftsData } from '../../../config/app';
import { db } from '../index';

const shiftService = new ShiftService();

export async function seedShifts() {
	console.log('Seeding shifts...');

	const company = await db.query.companies.findFirst({
		where: (t, { eq }) => eq(t.code, 'SUP-001')
	});

	if (!company) {
		console.error('Default company not found. Skipping shift seeding.');
		return;
	}

	for (const shift of shiftsData) {
		const existing = await db.query.shifts.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.name, shift.name))
		});

		if (!existing) {
			await shiftService.create({
				...shift,
				companyId: company.id
			});
		}
	}
}
