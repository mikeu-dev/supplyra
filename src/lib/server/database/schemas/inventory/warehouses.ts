import { pgTable, varchar, timestamp, text, boolean, decimal } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';

// WAREHOUSES (Gudang Fisik)
export const warehouses = pgTable('inventory_warehouses', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Main Office", "Server Room"
	code: varchar('code', { length: 50 }).notNull(),
	address: text('address'),
	latitude: decimal('latitude', { precision: 10, scale: 8 }),
	longitude: decimal('longitude', { precision: 11, scale: 8 }),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// LOCATIONS (Lokasi Spesifik / Rak / Zona)
export const locations = pgTable('inventory_locations', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	warehouseId: varchar('warehouse_id', { length: 36 }).references(() => warehouses.id, {
		onDelete: 'cascade'
	}),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Stock", "Shelf 1", "Scrap"
	usage: varchar('usage', { length: 50 }).default('internal'), // internal, supplier, customer, inventory, production, transit
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
	company: one(companies, { fields: [warehouses.companyId], references: [companies.id] }),
	locations: many(locations)
}));

export const locationsRelations = relations(locations, ({ one }) => ({
	warehouse: one(warehouses, { fields: [locations.warehouseId], references: [warehouses.id] }),
	company: one(companies, { fields: [locations.companyId], references: [companies.id] })
}));

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
