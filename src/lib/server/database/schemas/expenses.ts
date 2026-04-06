import {
	pgTable,
	varchar,
	timestamp,
	text,
	date,
	decimal,
	index,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { projects } from './projects';
import { users } from './users';

export const expensesStatusEnum = pgEnum('expenses_status', [
	'pending',
	'approved',
	'rejected',
	'paid'
]);

export const expenses = pgTable(
	'expenses',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		projectId: varchar('project_id', { length: 36 }).references(() => projects.id, {
			onDelete: 'cascade'
		}),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id),
		category: varchar('category', { length: 100 }),
		description: varchar('description', { length: 255 }).notNull(),
		amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
		date: date('date').notNull(),
		status: expensesStatusEnum('status').default('pending'),
		receiptUrl: text('receipt_url'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_expenses_project').on(t.projectId),
		index('idx_expenses_user').on(t.userId),
		index('idx_expenses_status').on(t.status),
		index('idx_expenses_date').on(t.date)
	]
);

export const expensesRelations = relations(expenses, ({ one }) => ({
	project: one(projects, { fields: [expenses.projectId], references: [projects.id] }),
	user: one(users, { fields: [expenses.userId], references: [users.id] })
}));

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
