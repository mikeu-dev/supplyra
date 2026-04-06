import { pgTable, varchar, timestamp, decimal, date, json, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';
import { employees } from './employees';

// PAYROLL BATCHES (Periode Penggajian)
export const payrollBatchesStatusEnum = pgEnum('payroll_batches_status', [
	'draft',
	'processed',
	'paid',
	'cancelled'
]);
export const payrollsStatusEnum = pgEnum('payrolls_status', [
	'pending',
	'processing',
	'paid',
	'failed'
]);

export const payrollBatches = pgTable('payroll_batches', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Gaji Oktober 2023"
	period: date('period').notNull(), // Start date of period or month marker
	status: payrollBatchesStatusEnum('status').default('draft'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// PAYROLLS (Slip Gaji per Karyawan)
export const payrolls = pgTable('payrolls', {
	id: varchar('id', { length: 36 }).primaryKey(),
	batchId: varchar('batch_id', { length: 36 })
		.notNull()
		.references(() => payrollBatches.id, { onDelete: 'cascade' }),
	employeeId: varchar('employee_id', { length: 36 })
		.notNull()
		.references(() => employees.id, { onDelete: 'cascade' }),
	baseSalary: decimal('base_salary', { precision: 15, scale: 2 }).default('0'),
	totalAllowance: decimal('total_allowance', { precision: 15, scale: 2 }).default('0'),
	totalDeduction: decimal('total_deduction', { precision: 15, scale: 2 }).default('0'),
	netSalary: decimal('net_salary', { precision: 15, scale: 2 }).default('0'),
	details: json('details'), // Storing calculated component details
	status: payrollsStatusEnum('status').default('pending'),
	gatewayRefId: varchar('gateway_ref_id', { length: 255 }),
	gatewayStatus: varchar('gateway_status', { length: 50 }),
	paidAt: timestamp('paid_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// RELATIONS
export const payrollBatchesRelations = relations(payrollBatches, ({ one, many }) => ({
	company: one(companies, { fields: [payrollBatches.companyId], references: [companies.id] }),
	payrolls: many(payrolls)
}));

export const payrollsRelations = relations(payrolls, ({ one }) => ({
	batch: one(payrollBatches, { fields: [payrolls.batchId], references: [payrollBatches.id] }),
	employee: one(employees, { fields: [payrolls.employeeId], references: [employees.id] })
}));

export type PayrollBatch = typeof payrollBatches.$inferSelect;
export type NewPayrollBatch = typeof payrollBatches.$inferInsert;
export type Payroll = typeof payrolls.$inferSelect;
export type NewPayroll = typeof payrolls.$inferInsert;
