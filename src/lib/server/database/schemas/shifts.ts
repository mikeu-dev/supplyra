import { pgTable, varchar, timestamp, text, time } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';
import { employees } from './employees';

// TABEL USER SHIFTS
export const shifts = pgTable('shifts', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: text('name'),
	startTime: time('start_time').default('09:00:00').notNull(),
	endTime: time('end_time').default('17:00:00').notNull(),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const ShiftRelations = relations(shifts, ({ one, many }) => ({
	company: one(companies, { fields: [shifts.companyId], references: [companies.id] }),
	employees: many(employees)
}));

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
