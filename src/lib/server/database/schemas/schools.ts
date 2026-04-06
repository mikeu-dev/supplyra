import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL USER SCHOOLS
export const schools = pgTable('schools', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.unique()
		.references(() => users.id),
	name: text('name'),
	address: text('address'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const SchoolRelations = relations(schools, ({ one }) => ({
	user: one(users, { fields: [schools.userId], references: [users.id] })
}));

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
