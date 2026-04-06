import { pgTable, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { accounts } from './accounts';

// ACCOUNTING JOURNALS (Tipe Jurnal)
// e.g. Customer Invoices, Vendor Bills, Bank, Cash, General Operations
export const accountingJournalsTypeEnum = pgEnum('accounting_journals_type', [
	'sale', // Customer Invoices
	'purchase', // Vendor Bills
	'cash', // Cash transactions
	'bank', // Bank transactions
	'general' // Miscellaneous
]);

export const journals = pgTable('accounting_journals', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "Vendor Bills"
	code: varchar('code', { length: 10 }).notNull(), // e.g. "BILL"
	type: accountingJournalsTypeEnum('type').notNull(),
	defaultAccountId: varchar('default_account_id', { length: 36 }).references(() => accounts.id), // Default debit/credit account
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const journalsRelations = relations(journals, ({ one }) => ({
	company: one(companies, { fields: [journals.companyId], references: [companies.id] }),
	defaultAccount: one(accounts, { fields: [journals.defaultAccountId], references: [accounts.id] })
}));

export type Journal = typeof journals.$inferSelect;
export type NewJournal = typeof journals.$inferInsert;
