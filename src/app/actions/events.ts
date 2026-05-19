'use server';

import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export type DbEvent = typeof events.$inferSelect;

export async function getEvents(): Promise<DbEvent[]> {
  return db.select().from(events).orderBy(events.createdAt);
}

export async function createEvent(data: {
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  description: string;
  category: string;
  status: string;
}): Promise<{ error?: string; event?: DbEvent }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return { error: '관리자 권한이 필요합니다.' };

  const [event] = await db
    .insert(events)
    .values({ ...data, registeredCount: 0 })
    .returning();
  revalidatePath('/page-1');
  revalidatePath('/page-4');
  return { event };
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<DbEvent, 'id' | 'registeredCount' | 'createdAt'>>
): Promise<{ error?: string; event?: DbEvent }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return { error: '관리자 권한이 필요합니다.' };

  const [event] = await db
    .update(events)
    .set(data)
    .where(eq(events.id, id))
    .returning();
  revalidatePath('/page-1');
  revalidatePath('/page-4');
  return { event };
}

export async function deleteEvent(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return { error: '관리자 권한이 필요합니다.' };

  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/page-1');
  revalidatePath('/page-4');
  return { success: true };
}
