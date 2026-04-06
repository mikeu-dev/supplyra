import { pgTable, varchar, timestamp, time, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { shifts } from './shifts';

// TABEL SHIFT SCHEDULES
export const shiftSchedulesDayEnum = pgEnum('shift_schedules_day', [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6'
]);

export const shiftSchedules = pgTable('shift_schedules', {
	id: varchar('id', { length: 36 }).primaryKey(),
	shiftId: varchar('shift_id', { length: 36 })
		.notNull()
		.references(() => shifts.id, { onDelete: 'cascade' }),
	day: shiftSchedulesDayEnum('day').notNull(), // 0=Sunday, 6=Saturday
	startTime: time('in').notNull(),
	endTime: time('out').notNull(),
	breakTime: time('break').notNull(),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp('deleted_at')
});

export const shiftSchedulesRelations = relations(shiftSchedules, ({ one }) => ({
	shift: one(shifts, { fields: [shiftSchedules.shiftId], references: [shifts.id] })
}));
