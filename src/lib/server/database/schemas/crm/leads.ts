import { pgTable, varchar, timestamp, text, decimal, index, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from '../companies';
import { users } from '../users';
import { clients } from '../clients';

// LEADS & OPPORTUNITIES (Prospek Penjualan)
export const crmLeadsTypeEnum = pgEnum('crm_leads_type', ['lead', 'opportunity']);
export const crmLeadsStageEnum = pgEnum('crm_leads_stage', [
	'new',
	'qualified',
	'proposition',
	'negotiation',
	'won',
	'lost'
]);
export const crmLeadsPriorityEnum = pgEnum('crm_leads_priority', ['low', 'medium', 'high']);

export const leads = pgTable(
	'crm_leads',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		companyId: varchar('company_id', { length: 36 })
			.notNull()
			.references(() => companies.id),

		name: varchar('name', { length: 255 }).notNull(), // Opportunity Name / Subject

		contactName: varchar('contact_name', { length: 255 }),
		email: varchar('email', { length: 255 }),
		phone: varchar('phone', { length: 50 }),

		clientId: varchar('client_id', { length: 36 }).references(() => clients.id), // If converted to existing client

		salespersonId: varchar('salesperson_id', { length: 36 }).references(() => users.id),

		type: crmLeadsTypeEnum('type').default('lead'),

		stage: crmLeadsStageEnum('stage').default('new'),

		expectedRevenue: decimal('expected_revenue', { precision: 15, scale: 2 }).default('0'),
		probability: decimal('probability', { precision: 5, scale: 2 }).default('0'), // Percentage

		priority: crmLeadsPriorityEnum('priority').default('medium'),

		notes: text('notes'),

		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [index('idx_leads_salesperson').on(t.salespersonId), index('idx_leads_stage').on(t.stage)]
);

export const leadsRelations = relations(leads, ({ one }) => ({
	company: one(companies, { fields: [leads.companyId], references: [companies.id] }),
	client: one(clients, { fields: [leads.clientId], references: [clients.id] }),
	salesperson: one(users, { fields: [leads.salespersonId], references: [users.id] })
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
