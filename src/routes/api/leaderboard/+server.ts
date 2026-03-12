import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { GameMode, QuestionCategory } from '../../../../generated/prisma/enums.ts';

export async function GET({ url }: RequestEvent) {
  const mode = url.searchParams.get('mode');
  const category = url.searchParams.get('category');
  const parsedLimit = parseInt(url.searchParams.get('limit') || '10');
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 10;

  const where: Record<string, unknown> = {};
  if (mode === 'FIXED_10' || mode === 'ENDLESS') {
    where.mode = mode as GameMode;
  }

  if (category === 'CAPITAL' || category === 'LANDMARK' || category === 'CITY' || category === 'COUNTRY') {
    where.category = category as QuestionCategory;
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
  const normalizedCategory =
    category === 'CAPITAL' || category === 'LANDMARK' || category === 'CITY' || category === 'COUNTRY'
      ? (category as QuestionCategory)
      : null;

  if (
    typeof playerName !== 'string' ||
    !playerName.trim() ||
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    (mode !== 'FIXED_10' && mode !== 'ENDLESS')
  ) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Mark session as completed
  if (typeof sessionId === 'string' && sessionId) {
    await prisma.gameSession.updateMany({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  const entry = await prisma.leaderboardEntry.create({
    data: {
      playerName: playerName.trim(),
      score,
      mode: mode as GameMode,
      category: mode === 'FIXED_10' ? normalizedCategory : normalizedCategory,
      sessionId: typeof sessionId === 'string' && sessionId ? sessionId : null,
    },
  });

  return json(entry);
};
