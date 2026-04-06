import {
	pgTable,
	varchar,
	timestamp,
	text,
	boolean,
	decimal,
	index,
	foreignKey,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { accounts } from '../accounting/accounts'; // For linking Expense/Income accounts

// PRODUCT CATEGORIES
export const inventoryProductCategoriesCostingMethodEnum = pgEnum(
	'inventory_product_categories_costing_method',
	['standard', 'average', 'fifo']
);
export const inventoryProductCategoriesTypeEnum = pgEnum('inventory_product_categories_type', [
	'goods',
	'service',
	'consumable'
]);

export const productCategories = pgTable('inventory_product_categories', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(),
	parentId: varchar('parent_id', { length: 36 }), // Hierarchical categories
	costingMethod: inventoryProductCategoriesCostingMethodEnum('costing_method').default('standard'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// PRODUCTS (Barang & Jasa)
export const products = pgTable(
	'inventory_products',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),
		categoryId: varchar('category_id', { length: 36 }),
		// .references(() => productCategories.id), // Removed to avoid long constraint name

		name: varchar('name', { length: 255 }).notNull(),
		code: varchar('code', { length: 100 }), // SKU / Barcode
		description: text('description'),

		type: inventoryProductCategoriesTypeEnum('type').default('goods'),

		salesPrice: decimal('sales_price', { precision: 15, scale: 2 }).default('0'),
		cost: decimal('cost', { precision: 15, scale: 2 }).default('0'),

		// Accounting Links
		incomeAccountId: varchar('income_account_id', { length: 36 }).references(() => accounts.id),
		expenseAccountId: varchar('expense_account_id', { length: 36 }).references(() => accounts.id),

		image: varchar('image', { length: 255 }),
		unit: varchar('unit', { length: 50 }), // Unit of Measure (e.g. Pcs, Box, Kg)
		brand: varchar('brand', { length: 100 }), // Brand name

		isActive: boolean('is_active').default(true),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_products_code').on(t.code),
		foreignKey({
			name: 'fk_products_category',
			columns: [t.categoryId],
			foreignColumns: [productCategories.id]
		})
	]
);

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
	company: one(companies, { fields: [productCategories.companyId], references: [companies.id] }),
	parent: one(productCategories, {
		fields: [productCategories.parentId],
		references: [productCategories.id],
		relationName: 'parent'
	}),
	children: many(productCategories, { relationName: 'parent' })
}));

export const productsRelations = relations(products, ({ one }) => ({
	company: one(companies, { fields: [products.companyId], references: [companies.id] }),
	category: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	incomeAccount: one(accounts, { fields: [products.incomeAccountId], references: [accounts.id] }),
	expenseAccount: one(accounts, { fields: [products.expenseAccountId], references: [accounts.id] })
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
