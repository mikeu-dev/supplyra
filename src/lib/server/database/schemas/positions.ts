import { pgTable, varchar, timestamp, text, decimal } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';
import { employees } from './employees';

// TABEL USER POSITIONS
export const positions = pgTable('positions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: text('name'),
	baseSalary: decimal('base_salary', { precision: 15, scale: 2 }).default('0'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const PositionRelations = relations(positions, ({ one, many }) => ({
	company: one(companies, { fields: [positions.companyId], references: [companies.id] }),
	employees: many(employees)
}));

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;
