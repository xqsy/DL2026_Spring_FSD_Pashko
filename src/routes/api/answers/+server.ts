import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { haversineDistance, calculatePoints } from '$lib/utils/haversine';
import { getDistanceToCountry } from '$lib/utils/countryBorders';
import { getCountryBorderFeatureByPoint } from '$lib/server/countryBordersService';
import { QuestionCategory } from '../../../../generated/prisma/enums.js';

export async function POST({ request }: RequestEvent) {
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

  // Calculate distance based on category
  let distanceKm: number;

  if (question.category === QuestionCategory.COUNTRY) {
    const border = await getCountryBorderFeatureByPoint(question.correctLat, question.correctLng);
    distanceKm = getDistanceToCountry(
      clickedLat,
      clickedLng,
      border,
      question.correctLat,
      question.correctLng
    );
  } else {
    // For other categories, use center point distance
    distanceKm = haversineDistance(
      clickedLat,
      clickedLng,
      question.correctLat,
      question.correctLng
    );
  }

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
}
