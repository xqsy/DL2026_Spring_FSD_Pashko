import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  const category = url.searchParams.get('category');
  const excludeIds = url.searchParams.get('exclude')?.split(',').filter(Boolean) || [];

  const where: Record<string, unknown> = {};
  
  if (category) {
    where.category = category;
  }
  
  if (excludeIds.length > 0) {
    where.id = { notIn: excludeIds };
  }

  const count = await prisma.question.count({ where });
  const skip = Math.floor(Math.random() * count);

  const questions = await prisma.question.findMany({
    where,
    skip,
    take: 1,
    select: {
      id: true,
      text: true,
      category: true,
      hint: true,
      difficulty: true,
    },
  });

  if (questions.length === 0) {
    return json({ error: 'No questions available' }, { status: 404 });
  }

  return json(questions[0]);
};
