import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { GameMode, QuestionCategory } from '../../../../generated/prisma/enums.ts';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  const mode = body.mode === 'ENDLESS' ? GameMode.ENDLESS : GameMode.FIXED_10;
  const category = body.category ? (body.category as QuestionCategory) : null;

  const session = await prisma.gameSession.create({
    data: {
      mode,
      category,
      questionsTotal: mode === GameMode.FIXED_10 ? 10 : 999,
    },
  });

  return json(session);
};

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id');
  
  if (!id) {
    return json({ error: 'Session ID required' }, { status: 400 });
  }

  const session = await prisma.gameSession.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: {
            select: {
              text: true,
              correctLat: true,
              correctLng: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    return json({ error: 'Session not found' }, { status: 404 });
  }

  return json(session);
};
