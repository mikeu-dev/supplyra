import {
	pgTable,
	varchar,
	timestamp,
	text,
	date,
	integer,
	index,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { projects } from './projects';
import { users } from './users';
import { projectColumns } from './project-columns';

// TABEL TASKS
export const tasksPriorityEnum = pgEnum('tasks_priority', ['low', 'medium', 'high']);

export const tasks = pgTable(
	'tasks',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		projectId: varchar('project_id', { length: 36 })
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		parentId: varchar('parent_id', { length: 36 }), // untuk subtasks - self reference
		columnId: varchar('column_id', { length: 36 }).references(() => projectColumns.id, {
			onDelete: 'set null'
		}),
		assignedTo: varchar('assigned_to', { length: 36 }).references(() => users.id, {
			onDelete: 'set null'
		}),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		priority: tasksPriorityEnum('priority').default('medium'),
		deadline: date('deadline'),
		position: integer('position').notNull().default(0), // untuk ordering dalam kolom
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_tasks_project_id').on(table.projectId),
		index('idx_tasks_parent_id').on(table.parentId),
		index('idx_tasks_column_id').on(table.columnId),
		index('idx_tasks_assigned_to').on(table.assignedTo),
		index('idx_tasks_priority').on(table.priority),
		index('idx_tasks_deadline').on(table.deadline)
	]
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
	assignee: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
	column: one(projectColumns, { fields: [tasks.columnId], references: [projectColumns.id] }),
	parent: one(tasks, {
		fields: [tasks.parentId],
		references: [tasks.id],
		relationName: 'subtasks'
	}),
	subtasks: many(tasks, { relationName: 'subtasks' })
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
