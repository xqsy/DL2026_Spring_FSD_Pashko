import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { GameMode } from '../../../../generated/prisma/enums.ts';

export async function GET({ url }: RequestEvent) {
  const mode = url.searchParams.get('mode');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const where: Record<string, unknown> = {};
  if (mode === 'FIXED_10' || mode === 'ENDLESS') {
    where.mode = mode as GameMode;
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where,
    orderBy: [
      { score: 'desc' },
      { createdAt: 'asc' },
    ],
    take: limit,
  });

  return json(entries);
};

export async function POST({ request }: RequestEvent) {
  const body = await request.json();
  const { playerName, score, mode, category, sessionId } = body;

  if (!playerName || score === undefined || !mode) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Mark session as completed
  if (sessionId) {
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  const entry = await prisma.leaderboardEntry.create({
    data: {
      playerName,
      score,
      mode: mode as GameMode,
      category,
      sessionId,
    },
  });

  return json(entry);
};
