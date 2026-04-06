import { APP_CONFIG } from '../../../config/app';
import { db } from '../index';
import { settings } from '../schemas';
import { generateId } from '../../../utils/useUserId';

export async function seedSettings() {
	console.log('Seeding settings...');

	const company = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'SUP-001')
	});

	if (!company) {
		console.error('Default company not found. Skipping settings seeding.');
		return;
	}

	for (const [key, value] of Object.entries(APP_CONFIG)) {
		await db
			.insert(settings)
			.values({
				id: generateId(),
				companyId: company.id,
				group: 'general',
				key: key,
				value: JSON.stringify(value),
				description: null
			})
			.onConflictDoUpdate({
				target: [settings.key, settings.companyId],
				set: {
					value: JSON.stringify(value)
				}
			});
	}
}
