import { pgTable, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { companies } from './companies';

// TABEL DEVICES (Hikvision Terminals)
export const devices = pgTable('devices', {
	id: varchar('id', { length: 36 }).primaryKey(),
	companyId: varchar('company_id', { length: 36 })
		.notNull()
		.references(() => companies.id),
	name: varchar('name', { length: 100 }),
	ipAddress: varchar('ip_address', { length: 50 }),
	port: integer('port').default(80),
	username: varchar('username', { length: 50 }),
	password: varchar('password', { length: 100 }), // Plaintext or Encrypted? For simplicity now plaintext, but should be encrypted.
	isActive: boolean('is_active').default(true),
	lastSeen: timestamp('last_seen'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const devicesRelations = relations(devices, ({ one }) => ({
	company: one(companies, { fields: [devices.companyId], references: [companies.id] })
}));
