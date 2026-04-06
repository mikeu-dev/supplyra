import { pgTable, varchar, timestamp, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';

// CHART OF ACCOUNTS
export const accountingAccountsTypeEnum = pgEnum('accounting_accounts_type', [
	'receivable', // Piutang
	'payable', // Hutang
	'liquidity', // Kas & Bank (Bank and Cash)
	'current_assets', // Aset Lancar Lainnya
	'bank', // Bank (specific)
	'cash', // Cash (specific)
	'assets', // Aset Tetap
	'liability', // Kewajiban Jangka Panjang/Pendek
	'equity', // Modal
	'income', // Pendapatan
	'expense', // Beban
	'cost_of_revenue', // HPP
	'other_income', // Pendapatan Lain
	'other_expense' // Beban Lain
]);

export const accounts = pgTable('accounting_accounts', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	code: varchar('code', { length: 20 }).notNull(), // e.g. "10100"
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Bank BCA"
	type: accountingAccountsTypeEnum('type').notNull(),
	reconcile: boolean('reconcile').default(false), // Reconcilable? (e.g. Receivable/Payable)
	description: text('description'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const accountsRelations = relations(accounts, ({ one }) => ({
	company: one(companies, { fields: [accounts.companyId], references: [companies.id] })
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
