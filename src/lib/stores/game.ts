import { writable, derived, get } from 'svelte/store';

export type Question = {
  id: string;
  text: string;
  category: string;
  hint: string | null;
  difficulty: number;
};

export type AnswerResult = {
  answerId: string;
  distanceKm: number;
  points: number;
  correctLat: number;
  correctLng: number;
  maxPoints: number;
};

export type GameMode = 'FIXED_10' | 'ENDLESS';

export type GameState = {
  sessionId: string | null;
  mode: GameMode;
  category: string | null;
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  answeredIds: string[];
  usedHint: boolean;
  lastAnswer: AnswerResult | null;
  isFinished: boolean;
  playerName: string;
};

const initialState: GameState = {
  sessionId: null,
  mode: 'FIXED_10',
  category: null,
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 10,
  score: 0,
  answeredIds: [],
  usedHint: false,
  lastAnswer: null,
  isFinished: false,
  playerName: '',
};

function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(initialState);

  return {
    subscribe,
    reset: () => set(initialState),
    setSession: (sessionId: string, mode: GameMode, category: string | null, totalQuestions: number) =>
      update((s) => ({ ...s, sessionId, mode, category, totalQuestions })),
    setQuestion: (question: Question) =>
      update((s) => ({
        ...s,
        currentQuestion: question,
        questionNumber: s.questionNumber + 1,
        usedHint: false,
        lastAnswer: null,
      })),
    useHint: () => update((s) => ({ ...s, usedHint: true })),
    setAnswer: (result: AnswerResult) =>
      update((s) => ({
        ...s,
        score: s.score + result.points,
        answeredIds: [...s.answeredIds, s.currentQuestion!.id],
        lastAnswer: result,
      })),
    finish: () => update((s) => ({ ...s, isFinished: true })),
    setPlayerName: (name: string) => update((s) => ({ ...s, playerName: name })),
  };
}

export const game = createGameStore();

export const progress = derived(game, ($game) => ({
  current: $game.questionNumber,
  total: $game.totalQuestions,
  percentage: Math.round(($game.questionNumber / $game.totalQuestions) * 100),
}));

export const isLastQuestion = derived(game, ($game) => $game.questionNumber >= $game.totalQuestions);

// Helper to get current state
export function getGame(): GameState {
  return get(game);
}
