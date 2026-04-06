import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL USER UNITS
export const units = pgTable('units', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.unique()
		.references(() => users.id),
	name: text('name'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const UnitRelations = relations(units, ({ one }) => ({
	user: one(users, { fields: [units.userId], references: [users.id] })
}));

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
