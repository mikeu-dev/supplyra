import { pgTable, varchar, timestamp, text, json, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { employees } from './employees';
import { positions } from './positions';
import { shifts } from './shifts';
import { clients } from './clients';
import { services } from './services';
import { settings } from './settings';

// TABEL COMPANIES
export const companies = pgTable('companies', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 50 }).unique(), // Compro URL slug
	code: varchar('code', { length: 50 }).unique(),
	logo: varchar('logo', { length: 255 }),
	themeConfig: json('theme_config'), // Branding colors, etc.
	isPublic: boolean('is_public').default(false), // Public profile visibility
	address: text('address'),
	phone: varchar('phone', { length: 20 }),
	email: varchar('email', { length: 255 }),
	website: varchar('website', { length: 255 }),
	deletedAt: timestamp('deleted_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const companiesRelations = relations(companies, ({ many }) => ({
	employees: many(employees),
	positions: many(positions),
	shifts: many(shifts),
	clients: many(clients),
	services: many(services),
	settings: many(settings)
}));

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
