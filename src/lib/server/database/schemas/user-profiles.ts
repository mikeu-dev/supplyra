import { pgTable, varchar, timestamp, text, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL USER PROFILES (untuk menyimpan informasi tambahan pengguna)
export const userProfilesGenderEnum = pgEnum('user_profiles_gender', ['male', 'female', 'other']);

export const userProfiles = pgTable('user_profiles', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.unique()
		.references(() => users.id),
	address: text('address'),
	birthDate: date('birth_date'),
	gender: userProfilesGenderEnum('gender'),
	phone: varchar('phone', { length: 20 }),
	bio: text('bio'),
	avatar: varchar('avatar', { length: 255 }),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	user: one(users, { fields: [userProfiles.userId], references: [users.id] })
}));

export type UserProfiles = typeof userProfiles.$inferSelect;
export type NewUserProfiles = typeof userProfiles.$inferInsert;
