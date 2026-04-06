import { db } from '../index';
import { salaryComponents as table } from '../schemas/index';
import { positions as positionsData } from '../../../config/app';
import { eq } from 'drizzle-orm';

export async function seedSalaryComponents() {
	console.log('[SEED] Seeding salary components...');

	const company = await db.query.companies.findFirst({
		where: (t, { eq }) => eq(t.code, 'SUP-001')
	});

	if (!company) {
		console.error('[WARN] Default company not found. Skipping salary component seeding.');
		return;
	}

	// 1. Generic Components (Updated Estimations)
	const genericComponents = [
		{
			name: 'Gaji Pokok',
			type: 'allowance',
			calculationType: 'fixed',
			defaultAmount: '0', // Base salary typically set per employee, keeping 0 or setting a minimum UMK? Let's keep 0 as base.
			isTaxable: true
		},
		{
			name: 'Tunjangan Makan',
			type: 'allowance',
			calculationType: 'fixed',
			defaultAmount: '500000', // Estimate
			isTaxable: true
		},
		{
			name: 'Tunjangan Transport',
			type: 'allowance',
			calculationType: 'fixed',
			defaultAmount: '500000', // Estimate
			isTaxable: true
		},
		{
			name: 'BPJS Kesehatan',
			type: 'deduction',
			calculationType: 'percentage',
			defaultAmount: '0',
			isTaxable: false
		},
		{
			name: 'BPJS Ketenagakerjaan',
			type: 'deduction',
			calculationType: 'percentage',
			defaultAmount: '0',
			isTaxable: false
		},
		{
			name: 'PPh 21',
			type: 'deduction',
			calculationType: 'percentage',
			defaultAmount: '0',
			isTaxable: false
		}
	] as const;

	for (const component of genericComponents) {
		const existing = await db.query.salaryComponents.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.name, component.name))
		});

		if (!existing) {
			await db.insert(table).values({
				id: crypto.randomUUID(),
				companyId: company.id,
				name: component.name,
				type: component.type,
				calculationType: component.calculationType,
				defaultAmount: component.defaultAmount,
				isActive: true
			});
		} else {
			// Optional: Update default amount if it's 0 and we have a new value
			if (existing.defaultAmount === '0.00' && component.defaultAmount !== '0') {
				await db
					.update(table)
					.set({ defaultAmount: component.defaultAmount })
					.where(eq(table.id, existing.id));
			}
		}
	}

	// 2. Position-based Allowances (Tunjangan Jabatan)
	for (const position of positionsData) {
		const componentName = `Tunjangan Jabatan ${position.name}`;
		let amount = '0';
		const nameLower = position.name.toLowerCase();

		// Estimation Logic
		if (
			nameLower.includes('chief') ||
			nameLower.includes('ceo') ||
			nameLower.includes('cto') ||
			nameLower.includes('komisaris')
		) {
			amount = '35000000';
		} else if (nameLower.includes('manager')) {
			amount = '12000000';
		} else if (nameLower.includes('software engineer') || nameLower.includes('network engineer')) {
			amount = '10000000';
		} else if (
			nameLower.includes('web developer') ||
			nameLower.includes('mobile developer') ||
			nameLower.includes('quality') ||
			nameLower.includes('ui/ux')
		) {
			amount = '6000000';
		} else if (nameLower.includes('cleaning')) {
			amount = '2800000';
		} else {
			// Staff / Admin / Marketing / Accounting / Others
			amount = '5000000';
		}

		const existing = await db.query.salaryComponents.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.name, componentName))
		});

		if (!existing) {
			await db.insert(table).values({
				id: crypto.randomUUID(),
				companyId: company.id,
				name: componentName,
				type: 'allowance',
				calculationType: 'fixed',
				defaultAmount: amount,
				isActive: true
			});
		} else {
			// Update amount if it was 0, or always update to match new logic?
			// Let's always update to enforce the new "approved" values.
			await db.update(table).set({ defaultAmount: amount }).where(eq(table.id, existing.id));
		}
	}

	console.log('[SUCCESS] Salary components seeded/updated successfully.');
}
