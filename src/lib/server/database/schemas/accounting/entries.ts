import {
	pgTable,
	varchar,
	timestamp,
	date,
	decimal,
	index,
	foreignKey,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { journals } from './journals';
import { accounts } from './accounts';
// import { invoices } from '../invoices'; // Link back to invoicing if needed (optional direct link)

// JOURNAL ENTRIES (Header Transaksi)
export const accountingJournalEntriesStateEnum = pgEnum('accounting_journal_entries_state', [
	'draft',
	'posted',
	'cancelled'
]);

export const journalEntries = pgTable('accounting_journal_entries', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	journalId: varchar('journal_id', { length: 36 })
		.notNull()
		.references(() => journals.id),
	number: varchar('number', { length: 50 }).notNull(), // e.g. "INV/2023/001" or "BILL/2023/001"
	date: date('date').notNull(),
	reference: varchar('reference', { length: 255 }), // External reference
	state: accountingJournalEntriesStateEnum('state').default('draft'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// JOURNAL ITEMS (Baris Debit/Kredit)
export const journalItems = pgTable(
	'accounting_journal_items',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),
		journalEntryId: varchar('journal_entry_id', { length: 36 }).notNull(),
		accountId: varchar('account_id', { length: 36 })
			.notNull()
			.references(() => accounts.id),
		partnerId: varchar('partner_id', { length: 36 }), // Can be Client ID, Supplier ID, or Employee ID (generic link)

		name: varchar('name', { length: 255 }), // Label/Description line

		debit: decimal('debit', { precision: 15, scale: 2 }).default('0'),
		credit: decimal('credit', { precision: 15, scale: 2 }).default('0'),

		date: date('date').notNull(), // Denormalized for easier querying

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [
		index('idx_journal_items_account').on(t.accountId),
		index('idx_journal_items_entry').on(t.journalEntryId),
		index('idx_journal_items_date').on(t.date),
		foreignKey({
			name: 'fk_journal_items_entry',
			columns: [t.journalEntryId],
			foreignColumns: [journalEntries.id]
		}).onDelete('cascade')
	]
);

// RELATIONS
export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
	company: one(companies, { fields: [journalEntries.companyId], references: [companies.id] }),
	journal: one(journals, { fields: [journalEntries.journalId], references: [journals.id] }),
	items: many(journalItems)
}));

export const journalItemsRelations = relations(journalItems, ({ one }) => ({
	entry: one(journalEntries, {
		fields: [journalItems.journalEntryId],
		references: [journalEntries.id]
	}),
	account: one(accounts, { fields: [journalItems.accountId], references: [accounts.id] }),
	company: one(companies, { fields: [journalItems.companyId], references: [companies.id] })
}));

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

export type JournalItem = typeof journalItems.$inferSelect;
export type NewJournalItem = typeof journalItems.$inferInsert;
