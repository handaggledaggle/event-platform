'use server';

import { db } from '@/db';
import { registrations, events, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export type RegWithEvent = {
  id: string;
  eventId: string;
  appliedAt: Date;
  attended: boolean;
  canceled: boolean;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    status: string;
    capacity: number;
    registeredCount: number;
    description: string;
  };
};

export type RegWithEventAndUser = RegWithEvent & {
  user: { id: string; name: string; email: string };
};

export async function getMyRegistrations(): Promise<RegWithEvent[]> {
  const session = await getSession();
  if (!session) return [];

  return db
    .select({
      id: registrations.id,
      eventId: registrations.eventId,
      appliedAt: registrations.appliedAt,
      attended: registrations.attended,
      canceled: registrations.canceled,
      event: {
        id: events.id,
        title: events.title,
        date: events.date,
        time: events.time,
        location: events.location,
        category: events.category,
        status: events.status,
        capacity: events.capacity,
        registeredCount: events.registeredCount,
        description: events.description,
      },
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        eq(registrations.userId, session.userId),
        eq(registrations.canceled, false)
      )
    );
}

export async function applyToEvent(
  eventId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };

  const existing = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, session.userId),
        eq(registrations.eventId, eventId),
        eq(registrations.canceled, false)
      )
    )
    .limit(1);
  if (existing.length > 0) return { error: '이미 신청한 행사입니다.' };

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return { error: '행사를 찾을 수 없습니다.' };
  if (event.status !== 'open') return { error: '신청이 불가한 행사입니다.' };
  if (event.registeredCount >= event.capacity)
    return { error: '정원이 마감되었습니다.' };

  await db.insert(registrations).values({
    userId: session.userId,
    eventId,
    attended: false,
    canceled: false,
  });

  await db
    .update(events)
    .set({ registeredCount: event.registeredCount + 1 })
    .where(eq(events.id, eventId));

  revalidatePath('/page-1');
  revalidatePath('/page-3');
  return { success: true };
}

export async function cancelRegistration(
  registrationId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };

  const [reg] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.id, registrationId),
        eq(registrations.userId, session.userId)
      )
    )
    .limit(1);
  if (!reg) return { error: '신청 내역을 찾을 수 없습니다.' };

  await db
    .update(registrations)
    .set({ canceled: true })
    .where(eq(registrations.id, registrationId));

  const [ev] = await db
    .select({ registeredCount: events.registeredCount })
    .from(events)
    .where(eq(events.id, reg.eventId))
    .limit(1);
  if (ev && ev.registeredCount > 0) {
    await db
      .update(events)
      .set({ registeredCount: ev.registeredCount - 1 })
      .where(eq(events.id, reg.eventId));
  }

  revalidatePath('/page-1');
  revalidatePath('/page-3');
  return { success: true };
}

export async function getAllRegistrations(): Promise<RegWithEventAndUser[]> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return [];

  return db
    .select({
      id: registrations.id,
      eventId: registrations.eventId,
      appliedAt: registrations.appliedAt,
      attended: registrations.attended,
      canceled: registrations.canceled,
      event: {
        id: events.id,
        title: events.title,
        date: events.date,
        time: events.time,
        location: events.location,
        category: events.category,
        status: events.status,
        capacity: events.capacity,
        registeredCount: events.registeredCount,
        description: events.description,
      },
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.canceled, false));
}

export async function toggleAttendance(
  registrationId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return { error: '관리자 권한이 필요합니다.' };

  const [reg] = await db
    .select({ attended: registrations.attended })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  if (!reg) return { error: '신청 내역을 찾을 수 없습니다.' };

  await db
    .update(registrations)
    .set({ attended: !reg.attended })
    .where(eq(registrations.id, registrationId));

  revalidatePath('/page-5');
  return { success: true };
}
