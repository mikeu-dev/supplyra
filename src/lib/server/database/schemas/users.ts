import { pgTable, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { roles } from './roles';
import { sessions } from './sessions';
import { schools } from './schools';
import { stages } from './stages';
import { units } from './units';
import { activityLogs } from './activity-logs';
import { comments } from './comments';
import { notifications } from './notifications';
import { tasks } from './tasks';
import { passwordResetTokens } from './password-reset-tokens';
import { userProfiles } from './user-profiles';
import { projectUsers } from './project-users';
import { employees } from './employees';
import { userPermissions } from './user-permissions';

// TABEL USERS
export const users = pgTable(
	'users',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		roleId: varchar('role_id', { length: 36 })
			.references(() => roles.id)
			.notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull().unique(),
		username: varchar('username', { length: 80 }).notNull().unique(),
		passwordHash: varchar('password_hash', { length: 255 }).notNull(),
		emailVerified: boolean('email_verified').default(false),
		verificationToken: varchar('verification_token', { length: 255 }),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_users_role_id').on(table.roleId),
		index('idx_users_email').on(table.email),
		index('idx_users_username').on(table.username)
	]
);

export const usersRelations = relations(users, ({ one, many }) => ({
	role: one(roles, { fields: [users.roleId], references: [roles.id] }),
	sessions: many(sessions),
	schools: many(schools),
	stages: many(stages),
	units: many(units),
	activityLogs: many(activityLogs),
	comments: many(comments),
	notifications: many(notifications),
	tasks: many(tasks),
	passwordResetTokens: many(passwordResetTokens),
	userProfiles: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
	projectUsers: many(projectUsers),
	employees: many(employees),
	userPermissions: many(userPermissions)
}));
