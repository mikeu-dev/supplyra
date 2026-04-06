import { pgTable, varchar, timestamp, decimal, integer, text, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';
import { positions } from './positions';

// TABEL PRESENCES
export const presencesTypeEnum = pgEnum('presences_type', ['offline', 'online']);
export const presencesCategoryEnum = pgEnum('presences_category', ['in', 'out']);

export const presences = pgTable('presences', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 }).references(() => users.id),
	companyId: varchar('company_id', { length: 36 }).references(() => companies.id),
	positionId: varchar('position_id', { length: 36 }).references(() => positions.id),
	enhancer: varchar('enhancer', { length: 36 }).references(() => users.id),
	fingerprint: varchar('fingerprint', { length: 50 }), // Matches employee.idCard
	time: timestamp('time').notNull(),
	piece: decimal('piece', { precision: 5, scale: 2 }).default('0.00'),
	price: decimal('price', { precision: 15, scale: 2 }).default('0.00'),
	late: integer('late').default(0), // Minutes
	overtime: integer('overtime').default(0), // Minutes
	earlier: integer('earlier').default(0), // Minutes
	type: presencesTypeEnum('type').default('offline'),
	category: presencesCategoryEnum('category').notNull(),
	coordinate: text('coordinate'),
	biometric: text('biometric'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const presencesRelations = relations(presences, ({ one }) => ({
	user: one(users, { fields: [presences.userId], references: [users.id] }),
	company: one(companies, { fields: [presences.companyId], references: [companies.id] }),
	position: one(positions, { fields: [presences.positionId], references: [positions.id] }),
	enhancerUser: one(users, { fields: [presences.enhancer], references: [users.id] })
}));
