import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';

// TABEL SERVICES
export const services = pgTable('services', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	image: varchar('image', { length: 255 }),
	titleId: varchar('title_id', { length: 255 }),
	titleEn: varchar('title_en', { length: 255 }),
	descriptionId: text('description_id'),
	descriptionEn: text('description_en'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const servicesRelations = relations(services, ({ one }) => ({
	company: one(companies, { fields: [services.companyId], references: [companies.id] })
}));
