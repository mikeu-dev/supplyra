import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL USER STAGES
export const stages = pgTable('stages', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.unique()
		.references(() => users.id),
	name: text('name'),
	code: text('code'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const StageRelations = relations(stages, ({ one }) => ({
	user: one(users, { fields: [stages.userId], references: [users.id] })
}));

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;
