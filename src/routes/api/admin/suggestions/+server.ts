import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { requireAdmin } from '$lib/server/adminAuth';
import { QuestionCategory, SuggestionStatus } from '../../../../../generated/prisma/enums.ts';

export async function GET(event: RequestEvent) {
  requireAdmin(event);

  const status = event.url.searchParams.get('status') as SuggestionStatus | null;

  const where: Record<string, unknown> = {};
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }

  const suggestions = await prisma.questionSuggestion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return json({ suggestions });
}

export async function PATCH(event: RequestEvent) {
  requireAdmin(event);

  const body = await event.request.json();
  const { id, action, adminNote, category } = body ?? {};

  if (!id || typeof id !== 'string') {
    return json({ error: 'id is required' }, { status: 400 });
  }

  if (action !== 'APPROVE' && action !== 'REJECT') {
    return json({ error: 'action must be APPROVE or REJECT' }, { status: 400 });
  }

  const suggestion = await prisma.questionSuggestion.findUnique({ where: { id } });
  if (!suggestion) return json({ error: 'Suggestion not found' }, { status: 404 });

  if (suggestion.status !== SuggestionStatus.PENDING) {
    return json({ error: 'Suggestion already reviewed' }, { status: 409 });
  }

  if (action === 'REJECT') {
    const updated = await prisma.questionSuggestion.update({
      where: { id },
      data: {
        status: SuggestionStatus.REJECTED,
        adminNote: typeof adminNote === 'string' && adminNote.trim() ? adminNote.trim() : null,
        reviewedAt: new Date(),
        rejectedAt: new Date(),
        rejectedBy: 'admin',
      },
    });

    return json({ suggestion: updated });
  }

  // APPROVE
  if (!category || typeof category !== 'string') {
    return json({ error: 'category is required for approve' }, { status: 400 });
  }

  const allowedCategories = ['CAPITAL', 'LANDMARK', 'CITY', 'COUNTRY'] as const;
  if (!allowedCategories.includes(category as (typeof allowedCategories)[number])) {
    return json({ error: 'Invalid category' }, { status: 400 });
  }

  const q = await prisma.question.create({
    data: {
      text: suggestion.questionText,
      correctLat: suggestion.lat,
      correctLng: suggestion.lng,
      category: category as QuestionCategory,
      difficulty: 1,
      hint: null,
    },
  });

  const updated = await prisma.questionSuggestion.update({
    where: { id },
    data: {
      status: SuggestionStatus.APPROVED,
      adminNote: typeof adminNote === 'string' && adminNote.trim() ? adminNote.trim() : null,
      reviewedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: 'admin',
      createdQuestionId: q.id,
    },
  });

  return json({ suggestion: updated, createdQuestionId: q.id });
}
