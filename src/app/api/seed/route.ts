export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const { db } = await import('@/db');
    const { users, events } = await import('@/db/schema');

    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: '이미 시드 데이터가 존재합니다.' });
    }

    const adminHash = await hash('admin1234', 10);
    await db.insert(users).values({
      name: '관리자',
      email: 'admin@university.ac.kr',
      passwordHash: adminHash,
      role: 'admin',
      emailVerified: true,
    });

    await db.insert(events).values([
      {
        title: '2026 봄학기 오리엔테이션',
        date: '2026-06-01',
        time: '10:00',
        location: '대학 본관 1층 강당',
        capacity: 200,
        registeredCount: 0,
        description: '신입생 및 편입생을 위한 학교 안내 오리엔테이션입니다.',
        category: '학교 행사',
        status: 'open',
      },
      {
        title: '진로 탐색 워크숍',
        date: '2026-06-10',
        time: '14:00',
        location: '공학관 세미나실 A',
        capacity: 50,
        registeredCount: 50,
        description:
          '다양한 분야의 직업인을 초청하여 진로 탐색 기회를 제공하는 워크숍입니다.',
        category: '워크숍',
        status: 'full',
      },
      {
        title: '학생 창업 아이디어 경진대회',
        date: '2026-06-20',
        time: '09:00',
        location: '창업지원센터',
        capacity: 100,
        registeredCount: 32,
        description:
          '학생들이 창의적인 창업 아이디어를 발표하고 심사받는 경진대회입니다.',
        category: '대회',
        status: 'open',
      },
      {
        title: 'AI·머신러닝 특강',
        date: '2026-07-05',
        time: '13:00',
        location: '전산관 102호',
        capacity: 80,
        registeredCount: 67,
        description: '현직 AI 개발자가 강의하는 실무 중심 특강입니다.',
        category: '특강',
        status: 'open',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: '시드 데이터 등록 완료. 관리자: admin@university.ac.kr / admin1234',
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
