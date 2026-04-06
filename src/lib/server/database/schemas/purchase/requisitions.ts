import {
	pgTable,
	varchar,
	timestamp,
	text,
	decimal,
	date,
	index,
	foreignKey,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { users } from '../users';
import { products } from '../inventory/products';
import { purchaseOrders } from './orders';
import { projects } from '../projects';

// PURCHASE REQUISITIONS (Permintaan Barang Internal)
export const purchaseRequisitionsStateEnum = pgEnum('purchase_requisitions_state', [
	'draft',
	'requested',
	'approved',
	'rejected',
	'ordered',
	'cancelled'
]);

export const purchaseRequisitions = pgTable(
	'purchase_requisitions',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		number: varchar('number', { length: 50 }).notNull().unique(), // e.g. PR/2024/001

		requestedById: varchar('requested_by_id', { length: 36 })
			.notNull()
			.references(() => users.id),

		approvedById: varchar('approved_by_id', { length: 36 }).references(() => users.id),

		date: date('date').notNull(),

		state: purchaseRequisitionsStateEnum('state').default('draft'),

		description: text('description'),
		totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).default('0'),

		projectId: varchar('project_id', { length: 36 }).references(() => projects.id),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_purchase_requisitions_date').on(t.date),
		index('idx_purchase_requisitions_state').on(t.state)
	]
);

// PURCHASE REQUISITION LINES
export const purchaseRequisitionLines = pgTable(
	'purchase_requisition_lines',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		requisitionId: varchar('requisition_id', { length: 36 }).notNull(),

		productId: varchar('product_id', { length: 36 })
			.notNull()
			.references(() => products.id),

		description: varchar('description', { length: 255 }).notNull(),

		quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1'),
		estimatedUnitPrice: decimal('estimated_unit_price', { precision: 15, scale: 2 }).default('0'),

		subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => ({
		requisitionFk: foreignKey({
			name: 'purchase_req_lines_requisition_id_fk',
			columns: [t.requisitionId],
			foreignColumns: [purchaseRequisitions.id]
		}).onDelete('cascade')
	})
);

// RELATIONS
export const purchaseRequisitionsRelations = relations(purchaseRequisitions, ({ one, many }) => ({
	company: one(companies, { fields: [purchaseRequisitions.companyId], references: [companies.id] }),
	requestedBy: one(users, {
		fields: [purchaseRequisitions.requestedById],
		references: [users.id],
		relationName: 'requester'
	}),
	approvedBy: one(users, {
		fields: [purchaseRequisitions.approvedById],
		references: [users.id],
		relationName: 'approver'
	}),
	project: one(projects, { fields: [purchaseRequisitions.projectId], references: [projects.id] }),
	lines: many(purchaseRequisitionLines),
	purchaseOrders: many(purchaseOrders) // PR can result in one or more POs
}));

export const purchaseRequisitionLinesRelations = relations(purchaseRequisitionLines, ({ one }) => ({
	requisition: one(purchaseRequisitions, {
		fields: [purchaseRequisitionLines.requisitionId],
		references: [purchaseRequisitions.id]
	}),
	product: one(products, {
		fields: [purchaseRequisitionLines.productId],
		references: [products.id]
	}),
	company: one(companies, {
		fields: [purchaseRequisitionLines.companyId],
		references: [companies.id]
	})
}));

export type PurchaseRequisition = typeof purchaseRequisitions.$inferSelect;
export type NewPurchaseRequisition = typeof purchaseRequisitions.$inferInsert;

export type PurchaseRequisitionLine = typeof purchaseRequisitionLines.$inferSelect;
export type NewPurchaseRequisitionLine = typeof purchaseRequisitionLines.$inferInsert;
