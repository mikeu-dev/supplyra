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
import { users } from './users';
import { projects } from './projects';
import { tasks } from './tasks';

export const timesheetsStatusEnum = pgEnum('timesheets_status', [
	'draft',
	'submitted',
	'approved',
	'rejected'
]);

export const timesheets = pgTable(
	'timesheets',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		projectId: varchar('project_id', { length: 36 }).references(() => projects.id),
		taskId: varchar('task_id', { length: 36 }).references(() => tasks.id),
		date: date('date').notNull(),
		hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
		description: text('description'),
		status: timesheetsStatusEnum('status').default('draft'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_timesheets_user').on(t.userId),
		index('idx_timesheets_date').on(t.date),
		index('idx_timesheets_project').on(t.projectId)
	]
);

export const timesheetsRelations = relations(timesheets, ({ one }) => ({
	user: one(users, { fields: [timesheets.userId], references: [users.id] }),
	project: one(projects, { fields: [timesheets.projectId], references: [projects.id] }),
	task: one(tasks, { fields: [timesheets.taskId], references: [tasks.id] })
}));

export type Timesheet = typeof timesheets.$inferSelect;
export type NewTimesheet = typeof timesheets.$inferInsert;
