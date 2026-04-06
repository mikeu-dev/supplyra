import { pgTable, varchar, timestamp, date, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';
import { positions } from './positions';
import { shifts } from './shifts';
import { employeeSalaries } from './employee-salaries';
import { roles } from './roles';

// TABEL EMPLOYEES
export const employeesStatusEnum = pgEnum('employees_status', [
	'permanent',
	'contract',
	'probation',
	'internship',
	'resigned',
	'terminated'
]);

export const employees = pgTable('employees', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	idCard: varchar('id_card', { length: 50 }), // NIP/NIK Pegawai
	nik: varchar('nik', { length: 20 }), // KTP
	positionId: varchar('position_id', { length: 36 }).references(() => positions.id),
	roleId: varchar('role_id', { length: 36 }).references(() => roles.id),
	shiftId: varchar('shift_id', { length: 36 }).references(() => shifts.id),
	bankName: varchar('bank_name', { length: 100 }),
	bankAccountNumber: varchar('bank_account_number', { length: 50 }),
	enhancer: varchar('enhancer', { length: 36 }).references(() => users.id), // User ID reference as requested
	status: employeesStatusEnum('status').default('probation'),
	joinDate: date('join_date'),
	taxNumber: varchar('tax_number', { length: 50 }), // NPWP
	biometricImage: varchar('biometric_image', { length: 255 }),
	isPublic: boolean('is_public').default(true), // Team hide/show
	reportsTo: varchar('reports_to', { length: 36 }), // Hierarchy
	division: varchar('division', { length: 255 }), // Division grouping
	workPhone: varchar('work_phone', { length: 20 }),
	workEmail: varchar('work_email', { length: 255 }),
	hourlyRate: decimal('hourly_rate', { precision: 15, scale: 2 }).default('0'),
	deletedAt: timestamp('deleted_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
	user: one(users, { fields: [employees.userId], references: [users.id] }),
	company: one(companies, { fields: [employees.companyId], references: [companies.id] }),
	position: one(positions, { fields: [employees.positionId], references: [positions.id] }),
	shift: one(shifts, { fields: [employees.shiftId], references: [shifts.id] }),
	salaries: many(employeeSalaries)
}));
