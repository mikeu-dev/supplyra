import { pgTable, varchar, timestamp, decimal, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { employees } from './employees';

// TABEL EMPLOYEE SALARIES
export const employeeSalariesTypeEnum = pgEnum('employee_salaries_type', [
	'monthly',
	'weekly',
	'hourly'
]);

export const employeeSalaries = pgTable('employee_salaries', {
	id: varchar('id', { length: 36 }).primaryKey(),
	employeeId: varchar('employee_id', { length: 36 })
		.notNull()
		.references(() => employees.id, { onDelete: 'cascade' }),
	amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
	type: employeeSalariesTypeEnum('type').default('monthly'),
	effectiveDate: date('effective_date').notNull(),
	endDate: date('end_date'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const employeeSalariesRelations = relations(employeeSalaries, ({ one }) => ({
	employee: one(employees, { fields: [employeeSalaries.employeeId], references: [employees.id] })
}));
