import { pgTable, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';

// TABEL SETTINGS
export const settings = pgTable(
	'settings',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 }).references(() => companies.id),
		group: varchar('group', { length: 64 }),
		key: varchar('key', { length: 128 }).notNull(),
		value: varchar('value', { length: 1024 }).notNull(),
		description: varchar('description', { length: 255 }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => ({
		keyCompanyIdx: uniqueIndex('key_company_idx').on(t.key, t.companyId)
	})
);

export const settingsRelations = relations(settings, ({ one }) => ({
	company: one(companies, { fields: [settings.companyId], references: [companies.id] })
}));

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
