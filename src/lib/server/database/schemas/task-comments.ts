import { pgTable, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { tasks } from './tasks';

export const taskComments = pgTable(
	'task_comments',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		taskId: varchar('task_id', { length: 36 })
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_task_comments_task').on(t.taskId),
		index('idx_task_comments_user').on(t.userId)
	]
);

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
	task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
	user: one(users, { fields: [taskComments.userId], references: [users.id] })
}));
