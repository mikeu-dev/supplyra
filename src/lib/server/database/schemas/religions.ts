import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// TABEL RELIGIONS
export const religions = pgTable(
	'religions',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		name: varchar('name', { length: 255 }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
		deletedAt: timestamp('deleted_at')
	},
	(table) => [index('idx_religions_name').on(table.name)]
);

export type Religion = typeof religions.$inferSelect;
export type NewReligion = typeof religions.$inferInsert;
