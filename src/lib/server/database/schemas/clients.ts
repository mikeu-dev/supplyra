import { pgTable, varchar, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { projects } from './projects';
import { companies } from './companies';

// TABEL CLIENTS
export const clientsTypeEnum = pgEnum('clients_type', ['client', 'vendor', 'both']);

export const clients = pgTable('clients', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(),
	contactEmail: varchar('contact_email', { length: 255 }),
	phone: varchar('phone', { length: 20 }),
	logo: varchar('logo', { length: 255 }),
	latitude: decimal('latitude', { precision: 10, scale: 8 }),
	longitude: decimal('longitude', { precision: 11, scale: 8 }),
	type: clientsTypeEnum('type').default('client'),
	deletedAt: timestamp('deleted_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
	company: one(companies, { fields: [clients.companyId], references: [companies.id] }),
	projects: many(projects)
}));

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
