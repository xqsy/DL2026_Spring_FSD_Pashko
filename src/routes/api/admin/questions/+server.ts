import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { requireAdmin } from '$lib/server/adminAuth';
import { QuestionCategory } from '../../../../../generated/prisma/enums.ts';

const allowedCategories = ['CAPITAL', 'LANDMARK', 'CITY', 'COUNTRY'] as const;

function isValidCategory(value: unknown): value is QuestionCategory {
  return typeof value === 'string' && allowedCategories.includes(value as (typeof allowedCategories)[number]);
}

export async function GET(event: RequestEvent) {
  requireAdmin(event);

  const category = event.url.searchParams.get('category');
  const q = event.url.searchParams.get('q');
  const take = Math.min(parseInt(event.url.searchParams.get('take') || '200'), 500);

  const where: Record<string, unknown> = {};
  if (category && isValidCategory(category)) {
    where.category = category;
  }
  if (q && q.trim()) {
    where.text = { contains: q.trim() };
  }

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  return json({ questions });
}

export async function POST(event: RequestEvent) {
  requireAdmin(event);

  const body = await event.request.json();
  const { text, correctLat, correctLng, category, difficulty, hint } = body ?? {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return json({ error: 'text is required' }, { status: 400 });
  }
  if (typeof correctLat !== 'number' || typeof correctLng !== 'number') {
    return json({ error: 'correctLat/correctLng are required' }, { status: 400 });
  }
  if (!isValidCategory(category)) {
    return json({ error: 'category is invalid' }, { status: 400 });
  }

  const diff = typeof difficulty === 'number' ? difficulty : 1;

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      correctLat,
      correctLng,
      category,
      difficulty: diff,
      hint: typeof hint === 'string' && hint.trim() ? hint.trim() : null,
    },
  });

  return json({ question });
}

export async function PATCH(event: RequestEvent) {
  requireAdmin(event);

  const body = await event.request.json();
  const { id, text, correctLat, correctLng, category, difficulty, hint } = body ?? {};

  if (!id || typeof id !== 'string') {
    return json({ error: 'id is required' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof text === 'string' && text.trim()) data.text = text.trim();
  if (typeof correctLat === 'number') data.correctLat = correctLat;
  if (typeof correctLng === 'number') data.correctLng = correctLng;
  if (typeof difficulty === 'number') data.difficulty = difficulty;
  if (typeof hint === 'string') data.hint = hint.trim() ? hint.trim() : null;
  if (category !== undefined) {
    if (!isValidCategory(category)) return json({ error: 'category is invalid' }, { status: 400 });
    data.category = category;
  }

  const updated = await prisma.question.update({
    where: { id },
    data,
  });

  return json({ question: updated });
}

export async function DELETE(event: RequestEvent) {
  requireAdmin(event);

  const body = await event.request.json().catch(() => null);
  const { id } = body ?? {};

  if (!id || typeof id !== 'string') {
    return json({ error: 'id is required' }, { status: 400 });
  }

  await prisma.answer.deleteMany({ where: { questionId: id } });
  await prisma.question.delete({ where: { id } });

  return json({ ok: true });
}
