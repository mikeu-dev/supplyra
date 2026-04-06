import { pgTable, varchar, timestamp, decimal, index, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { products } from './products';
import { locations } from './warehouses';

// STOCK MOVES (Perpindahan Stok)
export const inventoryStockMovesStateEnum = pgEnum('inventory_stock_moves_state', [
	'draft',
	'confirmed',
	'assigned',
	'done',
	'cancelled'
]);

export const stockMoves = pgTable(
	'inventory_stock_moves',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		productId: varchar('product_id', { length: 36 })
			.notNull()
			.references(() => products.id),

		locationId: varchar('location_id', { length: 36 }) // Source Location
			.notNull()
			.references(() => locations.id),

		locationDestId: varchar('location_dest_id', { length: 36 }) // Destination Location
			.notNull()
			.references(() => locations.id),

		quantity: decimal('quantity', { precision: 15, scale: 2 }).notNull().default('0'),

		reference: varchar('reference', { length: 100 }), // e.g. PO/001, SO/001
		state: inventoryStockMovesStateEnum('state').default('draft'),

		date: timestamp('date').default(sql`CURRENT_TIMESTAMP`),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_stock_moves_product').on(t.productId),
		index('idx_stock_moves_location').on(t.locationId),
		index('idx_stock_moves_location_dest').on(t.locationDestId)
	]
);

// STOCK QUANTS (Stok Saat Ini per Lokasi)
export const stockQuants = pgTable(
	'inventory_stock_quants',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		productId: varchar('product_id', { length: 36 })
			.notNull()
			.references(() => products.id),

		locationId: varchar('location_id', { length: 36 })
			.notNull()
			.references(() => locations.id),

		quantity: decimal('quantity', { precision: 15, scale: 2 }).notNull().default('0'),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		// Unique constraint: one record per product per location
		index('idx_stock_quants_product_location').on(t.productId, t.locationId)
	]
);

export const stockMovesRelations = relations(stockMoves, ({ one }) => ({
	company: one(companies, { fields: [stockMoves.companyId], references: [companies.id] }),
	product: one(products, { fields: [stockMoves.productId], references: [products.id] }),
	sourceLocation: one(locations, { fields: [stockMoves.locationId], references: [locations.id] }),
	destLocation: one(locations, { fields: [stockMoves.locationDestId], references: [locations.id] })
}));

export const stockQuantsRelations = relations(stockQuants, ({ one }) => ({
	company: one(companies, { fields: [stockQuants.companyId], references: [companies.id] }),
	product: one(products, { fields: [stockQuants.productId], references: [products.id] }),
	location: one(locations, { fields: [stockQuants.locationId], references: [locations.id] })
}));

export type StockMove = typeof stockMoves.$inferSelect;
export type NewStockMove = typeof stockMoves.$inferInsert;

export type StockQuant = typeof stockQuants.$inferSelect;
export type NewStockQuant = typeof stockQuants.$inferInsert;
