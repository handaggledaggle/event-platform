import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  time: varchar('time', { length: 10 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  capacity: integer('capacity').notNull(),
  registeredCount: integer('registered_count').notNull().default(0),
  description: text('description').notNull().default(''),
  category: varchar('category', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  attended: boolean('attended').notNull().default(false),
  canceled: boolean('canceled').notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, { fields: [registrations.userId], references: [users.id] }),
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
}));
