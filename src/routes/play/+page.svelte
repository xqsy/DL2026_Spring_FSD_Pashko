<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { game, getGame } from '$lib/stores/game';
  import GameMap from '$lib/components/GameMap.svelte';
  import QuestionCard from '$lib/components/QuestionCard.svelte';
  import ScoreDisplay from '$lib/components/ScoreDisplay.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';

  let clickedPosition = $state<{ lat: number; lng: number } | null>(null);
  let showResult = $state(false);
  let isLoading = $state(true);
  let isSubmitting = $state(false);

  // Subscribe to game store
  let gameState = $state(getGame());
  
  // Sync after each action
  function sync() {
    gameState = getGame();
  }

  async function loadQuestion() {
    if (!gameState.sessionId) {
      goto('/');
      return;
    }

    isLoading = true;
    clickedPosition = null;
    showResult = false;

    const excludeIds = gameState.answeredIds.join(',');
    const url = `/api/questions/random?${gameState.category ? `category=${gameState.category}&` : ''}exclude=${excludeIds}`;

    const res = await fetch(url);
    const question = await res.json();

    game.setQuestion(question);
    sync();
    isLoading = false;
  }

  async function submitAnswer() {
    if (!clickedPosition || !gameState.currentQuestion || isSubmitting) return;

    isSubmitting = true;

    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: gameState.currentQuestion.id,
        clickedLat: clickedPosition.lat,
        clickedLng: clickedPosition.lng,
        sessionId: gameState.sessionId,
        usedHint: gameState.usedHint,
      }),
    });

    const result = await res.json();
    game.setAnswer(result);
    sync();
    showResult = true;
    isSubmitting = false;
  }

  async function nextQuestion() {
    const lastQuestion = gameState.questionNumber >= gameState.totalQuestions;

    if (lastQuestion) {
      game.finish();
      goto('/results');
    } else {
      await loadQuestion();
    }
  }

  function useHint() {
    game.useHint();
    sync();
  }

  onMount(() => {
    loadQuestion();
  });

  const handleMapClick = (lat: number, lng: number) => {
    if (!showResult) {
      clickedPosition = { lat, lng };
    }
  };

  const isLastQuestion = gameState.questionNumber >= gameState.totalQuestions;
</script>

<svelte:head>
  <title>Игра - GeoHoot</title>
</svelte:head>

{#if isLoading}
  <div class="flex items-center justify-center h-[80vh]">
    <div class="text-xl text-gray-600">Загрузка вопроса...</div>
  </div>
{:else if gameState.currentQuestion}
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <span class="text-2xl font-bold text-indigo-600">🌍 GeoHoot</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="bg-white px-4 py-2 rounded-lg shadow">
          <span class="text-gray-500">Очки:</span>
          <span class="font-bold text-indigo-600 ml-1">{gameState.score}</span>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="mb-4">
      <ProgressBar current={gameState.questionNumber} total={gameState.totalQuestions} />
    </div>

    <!-- Question -->
    <QuestionCard
      text={gameState.currentQuestion.text}
      category={gameState.currentQuestion.category}
      questionNumber={gameState.questionNumber}
      totalQuestions={gameState.totalQuestions}
    />

    <!-- Hint Button -->
    {#if !showResult && gameState.currentQuestion.hint && !gameState.usedHint}
      <button
        onclick={useHint}
        class="mb-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
      >
        💡 Подсказка (-100 очков)
      </button>
    {:else if gameState.usedHint && gameState.currentQuestion.hint}
      <div class="mb-4 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
        💡 {gameState.currentQuestion.hint}
      </div>
    {/if}

    <!-- Map -->
    <div class="relative h-[50vh] mb-4 rounded-xl overflow-hidden shadow-lg">
      <GameMap
        onMapClick={handleMapClick}
        clickedMarker={clickedPosition}
        correctMarker={showResult && gameState.lastAnswer ? { lat: gameState.lastAnswer.correctLat, lng: gameState.lastAnswer.correctLng } : null}
        showLine={showResult}
        disabled={showResult}
      />
      
      <!-- Click indicator -->
      {#if clickedPosition && !showResult}
        <div class="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow">
          ✅ Точка выбрана
        </div>
      {/if}
    </div>

    <!-- Result -->
    {#if showResult && gameState.lastAnswer}
      <div class="mb-4">
        <ScoreDisplay
          points={gameState.lastAnswer.points}
          distanceKm={gameState.lastAnswer.distanceKm}
        />
      </div>

      <button
        onclick={nextQuestion}
        class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
      >
        {isLastQuestion ? '🏁 Результаты' : '➡️ Следующий вопрос'}
      </button>
    {:else}
      <button
        onclick={submitAnswer}
        disabled={!clickedPosition || isSubmitting}
        class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Проверка...' : '✓ Ответить'}
      </button>
    {/if}
  </div>
{/if}
