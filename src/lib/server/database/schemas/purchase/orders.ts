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
import { products } from '../inventory/products';
import { warehouses } from '../inventory/warehouses';
import { projects } from '../projects';
import { purchaseRequisitions } from './requisitions';

// PURCHASE ORDERS / RFQ
export const purchaseOrdersStateEnum = pgEnum('purchase_orders_state', [
	'draft',
	'sent',
	'purchase',
	'done',
	'cancelled'
]);

export const purchaseOrders = pgTable(
	'purchase_orders',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		number: varchar('number', { length: 50 }).notNull().unique(), // e.g. RFQ/001 -> PO/001

		supplierId: varchar('supplier_id', { length: 36 })
			.notNull()
			.references(() => clients.id), // Using clients as suppliers

		warehouseId: varchar('warehouse_id', { length: 36 }).references(() => warehouses.id), // Destination Warehouse

		userId: varchar('user_id', { length: 36 }).references(() => users.id), // Buyer / Creator

		date: date('date').notNull(),
		expectedDate: date('expected_date'), // Expected Arrival

		state: purchaseOrdersStateEnum('state').default('draft'),

		subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
		taxTotal: decimal('tax_total', { precision: 15, scale: 2 }).default('0'),
		total: decimal('total', { precision: 15, scale: 2 }).default('0'),

		projectId: varchar('project_id', { length: 36 }).references(() => projects.id),

		notes: text('notes'),

		requisitionId: varchar('requisition_id', { length: 36 }).references(
			() => purchaseRequisitions.id
		),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_purchase_orders_supplier').on(t.supplierId),
		index('idx_purchase_orders_date').on(t.date)
	]
);

// PURCHASE ORDER LINES
export const purchaseOrderLines = pgTable('purchase_order_lines', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),

	orderId: varchar('order_id', { length: 36 })
		.notNull()
		.references(() => purchaseOrders.id, { onDelete: 'cascade' }),

	productId: varchar('product_id', { length: 36 })
		.notNull()
		.references(() => products.id),

	description: varchar('description', { length: 255 }).notNull(),

	quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1'),
	unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).default('0'), // Cost

	taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),

	subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),

	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
	company: one(companies, { fields: [purchaseOrders.companyId], references: [companies.id] }),
	supplier: one(clients, { fields: [purchaseOrders.supplierId], references: [clients.id] }),
	warehouse: one(warehouses, { fields: [purchaseOrders.warehouseId], references: [warehouses.id] }),
	user: one(users, { fields: [purchaseOrders.userId], references: [users.id] }),
	project: one(projects, { fields: [purchaseOrders.projectId], references: [projects.id] }),
	requisition: one(purchaseRequisitions, {
		fields: [purchaseOrders.requisitionId],
		references: [purchaseRequisitions.id]
	}),
	lines: many(purchaseOrderLines)
}));

export const purchaseOrderLinesRelations = relations(purchaseOrderLines, ({ one }) => ({
	order: one(purchaseOrders, {
		fields: [purchaseOrderLines.orderId],
		references: [purchaseOrders.id]
	}),
	product: one(products, { fields: [purchaseOrderLines.productId], references: [products.id] }),
	company: one(companies, { fields: [purchaseOrderLines.companyId], references: [companies.id] })
}));

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;
export type NewPurchaseOrderLine = typeof purchaseOrderLines.$inferInsert;
