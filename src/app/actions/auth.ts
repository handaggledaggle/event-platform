'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { createSession, getSession, clearSession } from '@/lib/session';
import type { SessionUser } from '@/lib/session';

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ error?: string; success?: boolean }> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (existing.length > 0) return { error: '이미 가입된 이메일입니다.' };

  const passwordHash = await hash(data.password, 10);
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    role: 'user',
    emailVerified: true,
  });
  return { success: true };
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ error?: string; success?: boolean }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (!user) return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };

  const valid = await compare(data.password, user.passwordHash);
  if (!valid) return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return { success: true };
}

export async function logout(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}
