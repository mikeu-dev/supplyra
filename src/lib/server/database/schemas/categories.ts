import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';

export const categories = pgTable('categories', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	parentId: varchar('parent_id', { length: 36 }),
	type: varchar('type', { length: 50 }).notNull(), // 'product', 'expense', 'asset', etc.
	color: varchar('color', { length: 50 }),
	icon: varchar('icon', { length: 50 }),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	company: one(companies, { fields: [categories.companyId], references: [companies.id] }),
	parent: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: 'parent'
	}),
	children: many(categories, { relationName: 'parent' })
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
