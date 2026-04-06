import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// TABEL BANKS
export const banks = pgTable(
	'banks',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		code: varchar('code', { length: 64 }).notNull().unique(),
		name: varchar('name', { length: 255 }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
		deletedAt: timestamp('deleted_at')
	},
	(table) => [index('idx_banks_code').on(table.code)]
);

export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;
