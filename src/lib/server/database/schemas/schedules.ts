import { pgTable, varchar, timestamp, text, index, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL SCHEDULES (Personal/General Calendar Agendas)
export const schedules = pgTable(
	'schedules',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		location: varchar('location', { length: 255 }),
		link: varchar('link', { length: 255 }),
		isAllDay: boolean('is_all_day').default(false),
		recurrence: varchar('recurrence', { length: 50 }).default('none'),
		startDate: timestamp('start_date').notNull(),
		endDate: timestamp('end_date'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_schedules_user_id').on(table.userId),
		index('idx_schedules_start_date').on(table.startDate)
	]
);

export const schedulesRelations = relations(schedules, ({ one }) => ({
	user: one(users, { fields: [schedules.userId], references: [users.id] })
}));

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
