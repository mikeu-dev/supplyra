import { services as servicesData } from '../../../config/app';
import { db } from '../index';
import { services } from '../schemas';
import { generateId } from '../../../utils/useUserId';

export async function seedServices() {
	console.log('Seeding services...');

	const company = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'SUP-001')
	});

	if (!company) {
		console.error('Default company not found. Skipping service seeding.');
		return;
	}

	// Helper to insert or update
	for (const service of servicesData.id) {
		// Find corresponding english data
		const index = servicesData.id.indexOf(service);
		const enService = servicesData.en[index];

		// Check if service already exists
		const existingService = await db.query.services.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.titleId, service.title))
		});

		if (!existingService) {
			await db.insert(services).values({
				id: generateId(),
				companyId: company.id,
				image: service.image,
				titleId: service.title,
				titleEn: enService?.title || service.title, // Fallback
				descriptionId: service.description,
				descriptionEn: enService?.description || service.description // Fallback
			});
		} else {
			console.log(`Service "${service.title}" already exists. Skipping.`);
		}
	}
}
