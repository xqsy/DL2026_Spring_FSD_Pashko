import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { haversineDistance, calculatePoints } from '$lib/utils/haversine';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { questionId, clickedLat, clickedLng, sessionId, usedHint = false } = body;

  if (!questionId || clickedLat === undefined || clickedLng === undefined || !sessionId) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get the question
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return json({ error: 'Question not found' }, { status: 404 });
  }

  // Calculate distance and points
  const distanceKm = haversineDistance(
    clickedLat,
    clickedLng,
    question.correctLat,
    question.correctLng
  );
  const points = calculatePoints(distanceKm, usedHint);

  // Save the answer
  const answer = await prisma.answer.create({
    data: {
      sessionId,
      questionId,
      clickedLat,
      clickedLng,
      distanceKm,
      points,
      usedHint,
    },
  });

  // Update session score
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      score: { increment: points },
      questionsAnswered: { increment: 1 },
    },
  });

  return json({
    answerId: answer.id,
    distanceKm,
    points,
    correctLat: question.correctLat,
    correctLng: question.correctLng,
    maxPoints: 1000,
  });
};
