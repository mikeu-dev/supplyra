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
import { clients } from './clients';
import { projects } from './projects';
import { purchaseOrders } from './purchase/orders';

// INVOICES
export const invoicesTypeEnum = pgEnum('invoices_type', ['out_invoice', 'in_invoice']);
export const invoicesStatusEnum = pgEnum('invoices_status', [
	'draft',
	'sent',
	'paid',
	'partially_paid',
	'overdue',
	'cancelled'
]);

export const invoices = pgTable(
	'invoices',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		clientId: varchar('client_id', { length: 36 })
			.notNull()
			.references(() => clients.id),
		projectId: varchar('project_id', { length: 36 }).references(() => projects.id),
		number: varchar('number', { length: 50 }).notNull().unique(),
		issueDate: date('issue_date').notNull(),
		dueDate: date('due_date'),
		type: invoicesTypeEnum('type').default('out_invoice'),
		status: invoicesStatusEnum('status').default('draft'),
		subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
		taxTotal: decimal('tax_total', { precision: 15, scale: 2 }).default('0'),
		total: decimal('total', { precision: 15, scale: 2 }).default('0'),
		notes: text('notes'),
		purchaseOrderId: varchar('purchase_order_id', { length: 36 }).references(
			() => purchaseOrders.id
		),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_invoices_client').on(t.clientId),
		index('idx_invoices_project').on(t.projectId),
		index('idx_invoices_status').on(t.status),
		index('idx_invoices_date').on(t.issueDate)
	]
);

export const invoiceItems = pgTable('invoice_items', {
	id: varchar('id', { length: 36 }).primaryKey(),
	invoiceId: varchar('invoice_id', { length: 36 })
		.notNull()
		.references(() => invoices.id, { onDelete: 'cascade' }),
	description: varchar('description', { length: 255 }).notNull(),
	quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1'),
	unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).default('0'),
	amount: decimal('amount', { precision: 15, scale: 2 }).default('0')
});

export const invoicePayments = pgTable('invoice_payments', {
	id: varchar('id', { length: 36 }).primaryKey(),
	invoiceId: varchar('invoice_id', { length: 36 })
		.notNull()
		.references(() => invoices.id, { onDelete: 'cascade' }),
	amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
	paymentDate: date('payment_date').notNull(),
	method: varchar('method', { length: 50 }),
	reference: varchar('reference', { length: 100 }),
	notes: text('notes'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// RELATIONS
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
	project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
	purchaseOrder: one(purchaseOrders, {
		fields: [invoices.purchaseOrderId],
		references: [purchaseOrders.id]
	}),
	items: many(invoiceItems),
	payments: many(invoicePayments)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
	invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] })
}));

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
	invoice: one(invoices, { fields: [invoicePayments.invoiceId], references: [invoices.id] })
}));

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
