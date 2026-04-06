import {
	pgTable,
	varchar,
	timestamp,
	text,
	date,
	index,
	json,
	boolean,
	decimal,
	integer,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { clients } from './clients';
import { tasks } from './tasks';
import { projectUsers } from './project-users';
import { projectColumns } from './project-columns';
import { timesheets } from './timesheets';
import { purchaseRequisitions } from './purchase/requisitions';
import { purchaseOrders } from './purchase/orders';
import { invoices } from './invoices';
import { salesOrders } from './crm/orders';

// TABEL PROJECTS
export const projectsStatusEnum = pgEnum('projects_status', [
	'pending',
	'active',
	'completed',
	'on_hold'
]);

export const projects = pgTable(
	'projects',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		clientId: varchar('client_id', { length: 36 })
			.notNull()
			.references(() => clients.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 255 }).notNull(),
		description: text('description'),
		startDate: date('start_date'),
		dueDate: date('due_date'),
		status: projectsStatusEnum('status').default('pending'),
		thumbnail: varchar('thumbnail', { length: 255 }),
		mockup: varchar('mockup', { length: 255 }),
		category: varchar('category', { length: 50 }),
		techStack: json('tech_stack'),
		isPortfolio: boolean('is_portfolio').default(false),
		latitude: decimal('latitude', { precision: 10, scale: 8 }),
		longitude: decimal('longitude', { precision: 11, scale: 8 }),
		totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).default('0'),
		estimatedHours: integer('estimated_hours').default(0),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_projects_client_id').on(table.clientId),
		index('idx_projects_status').on(table.status),
		index('idx_projects_start_date').on(table.startDate),
		index('idx_projects_due_date').on(table.dueDate)
	]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
	client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
	tasks: many(tasks),
	projectUsers: many(projectUsers),
	columns: many(projectColumns),
	timesheets: many(timesheets),
	purchaseRequisitions: many(purchaseRequisitions),
	purchaseOrders: many(purchaseOrders),
	invoices: many(invoices),
	salesOrders: many(salesOrders)
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
