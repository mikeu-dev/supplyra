import {
	pgTable,
	varchar,
	timestamp,
	text,
	decimal,
	date,
	index,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { clients } from '../clients';
import { users } from '../users';
import { leads } from './leads';
import { products } from '../inventory/products';
import { projects } from '../projects';

// SALES ORDERS / QUOTATIONS
export const crmSalesOrdersStateEnum = pgEnum('crm_sales_orders_state', [
	'draft',
	'sent',
	'sale',
	'done',
	'cancelled'
]);

export const salesOrders = pgTable(
	'crm_sales_orders',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		number: varchar('number', { length: 50 }).notNull().unique(), // e.g. SQ/001 (Quotation) -> SO/001 (Order)

		clientId: varchar('client_id', { length: 36 })
			.notNull()
			.references(() => clients.id),

		salespersonId: varchar('salesperson_id', { length: 36 }).references(() => users.id),

		leadId: varchar('lead_id', { length: 36 }).references(() => leads.id), // Origin Opportunity

		date: date('date').notNull(),
		validUntil: date('valid_until'),

		state: crmSalesOrdersStateEnum('state').default('draft'),

		subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
		taxTotal: decimal('tax_total', { precision: 15, scale: 2 }).default('0'),
		total: decimal('total', { precision: 15, scale: 2 }).default('0'),

		projectId: varchar('project_id', { length: 36 }).references(() => projects.id),

		notes: text('notes'),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_sales_orders_client').on(t.clientId),
		index('idx_sales_orders_date').on(t.date)
	]
);

// ORDER LINES
export const salesOrderLines = pgTable('crm_sales_order_lines', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),

	orderId: varchar('order_id', { length: 36 })
		.notNull()
		.references(() => salesOrders.id, { onDelete: 'cascade' }),

	productId: varchar('product_id', { length: 36 })
		.notNull()
		.references(() => products.id),

	description: varchar('description', { length: 255 }).notNull(),

	quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1'),
	unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).default('0'),

	taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),

	subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),

	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
	company: one(companies, { fields: [salesOrders.companyId], references: [companies.id] }),
	client: one(clients, { fields: [salesOrders.clientId], references: [clients.id] }),
	salesperson: one(users, { fields: [salesOrders.salespersonId], references: [users.id] }),
	lead: one(leads, { fields: [salesOrders.leadId], references: [leads.id] }),
	project: one(projects, { fields: [salesOrders.projectId], references: [projects.id] }),
	lines: many(salesOrderLines)
}));

export const salesOrderLinesRelations = relations(salesOrderLines, ({ one }) => ({
	order: one(salesOrders, { fields: [salesOrderLines.orderId], references: [salesOrders.id] }),
	product: one(products, { fields: [salesOrderLines.productId], references: [products.id] }),
	company: one(companies, { fields: [salesOrderLines.companyId], references: [companies.id] })
}));

export type SalesOrder = typeof salesOrders.$inferSelect;
export type NewSalesOrder = typeof salesOrders.$inferInsert;

export type SalesOrderLine = typeof salesOrderLines.$inferSelect;
export type NewSalesOrderLine = typeof salesOrderLines.$inferInsert;
