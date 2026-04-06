import { pgTable, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { projects } from './projects';

// TABEL PROJECT COLUMNS - untuk workflow dinamis per project
export const projectColumns = pgTable('project_columns', {
	id: varchar('id', { length: 36 }).primaryKey(),
	projectId: varchar('project_id', { length: 36 })
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	color: varchar('color', { length: 20 }).default('#6B7280'),
	position: integer('position').notNull().default(0),
	wipLimit: integer('wip_limit'), // null = unlimited
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const projectColumnsRelations = relations(projectColumns, ({ one }) => ({
	project: one(projects, { fields: [projectColumns.projectId], references: [projects.id] })
}));

export type ProjectColumn = typeof projectColumns.$inferSelect;
export type NewProjectColumn = typeof projectColumns.$inferInsert;
