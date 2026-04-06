import { pgTable, varchar, timestamp, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';
import { employees } from './employees';
import { accounts } from './accounting/accounts';

// SALARY COMPONENT TYPES (Master Data: Tunjangan Makan, Potongan BPJS, dll)
export const salaryComponentsTypeEnum = pgEnum('salary_components_type', [
	'allowance',
	'deduction'
]);
export const salaryComponentsCalculationTypeEnum = pgEnum('salary_components_calculation_type', [
	'fixed',
	'percentage'
]);

export const salaryComponents = pgTable('salary_components', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Tunjangan Makan", "BPJS Kesehatan"
	type: salaryComponentsTypeEnum('type').notNull(), // Tunjangan atau Potongan
	calculationType: salaryComponentsCalculationTypeEnum('calculation_type').default('fixed'),
	defaultAmount: decimal('default_amount', { precision: 15, scale: 2 }).default('0'),
	accountId: varchar('account_id', { length: 36 }), // Link to Chart of Accounts (Expense/Liability)
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// EMPLOYEE SALARY COMPONENTS (Assignment per Employee)
export const employeeSalaryComponents = pgTable('employee_salary_components', {
	id: varchar('id', { length: 36 }).primaryKey(),
	employeeId: varchar('employee_id', { length: 36 })
		.notNull()
		.references(() => employees.id, { onDelete: 'cascade' }),
	componentId: varchar('component_id', { length: 36 })
		.notNull()
		.references(() => salaryComponents.id, { onDelete: 'cascade' }),
	amount: decimal('amount', { precision: 15, scale: 2 }).default('0'), // Override amount
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// RELATIONS
export const salaryComponentsRelations = relations(salaryComponents, ({ one, many }) => ({
	company: one(companies, { fields: [salaryComponents.companyId], references: [companies.id] }),
	account: one(accounts, { fields: [salaryComponents.accountId], references: [accounts.id] }),
	employeeComponents: many(employeeSalaryComponents)
}));

export const employeeSalaryComponentsRelations = relations(employeeSalaryComponents, ({ one }) => ({
	employee: one(employees, {
		fields: [employeeSalaryComponents.employeeId],
		references: [employees.id]
	}),
	component: one(salaryComponents, {
		fields: [employeeSalaryComponents.componentId],
		references: [salaryComponents.id]
	})
}));
