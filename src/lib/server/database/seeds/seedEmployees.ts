import { db } from '../index';
import * as table from '../schemas/index';

export async function seedEmployees() {
	console.log('[SEED] Seeding employees...');

	const allCompanies = await db.select().from(table.companies).limit(5);
	const allPositions = await db.select().from(table.positions).limit(5);
	const allShifts = await db.select().from(table.shifts).limit(5);

	if (allCompanies.length === 0 || allPositions.length === 0 || allShifts.length === 0) {
		console.warn('[WARN] Missing master data (Company/Position/Shift). Skipping employee seed.');
		return;
	}

	const allUsers = await db.select().from(table.users);
	const allEmployees = await db.select().from(table.employees);

	const userIdsWithEmployee = new Set(allEmployees.map((e) => e.userId));
	const usersMissingEmployee = allUsers.filter((u) => !userIdsWithEmployee.has(u.id));

	console.log(`Found ${usersMissingEmployee.length} users without employee record.`);

	// Try to find the Main Company first
	const mainCompany = allCompanies.find((c) => c.code === 'SUP-001') || allCompanies[0];
	const secondCompany = allCompanies.find((c) => c.code === 'MS-002');

	for (const user of usersMissingEmployee) {
		let company = mainCompany; // Prioritize main company

		// Specific assignment for Mitra
		if (user.email.includes('mitra') && secondCompany) {
			company = secondCompany;
		}

		const position = allPositions[Math.floor(Math.random() * allPositions.length)];
		const shift = allShifts[Math.floor(Math.random() * allShifts.length)];

		const randomSuffix = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0');
		const idCard = `EMP${randomSuffix}`;
		const nik = `320101${randomSuffix}0001`;

		await db.insert(table.employees).values({
			id: crypto.randomUUID(),
			userId: user.id,
			companyId: company.id,
			positionId: position.id,
			shiftId: shift.id,
			idCard: idCard,
			nik: nik,
			joinDate: new Date().toISOString().split('T')[0],
			status: 'permanent',
			workEmail: user.email,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}
}
