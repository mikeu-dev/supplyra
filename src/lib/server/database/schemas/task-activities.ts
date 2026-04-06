import { pgTable, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tasks } from './tasks';
import { users } from './users';

export const taskActivitiesTypeEnum = pgEnum('task_activities_type', [
	'move',
	'create',
	'update',
	'delete',
	'comment'
]);

export const taskActivities = pgTable('task_activities', {
	id: varchar('id', { length: 36 }).primaryKey(),
	taskId: varchar('task_id', { length: 36 })
		.notNull()
		.references(() => tasks.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	type: taskActivitiesTypeEnum('type').notNull(),
	data: text('data'), // JSON format for storing change details (e.g. { fromColumn: 'A', toColumn: 'B' })
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export type TaskActivity = typeof taskActivities.$inferSelect;
export type NewTaskActivity = typeof taskActivities.$inferInsert;
