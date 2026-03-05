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
  let showExitModal = $state(false);
  let countryBorder = $state<GeoJSON.Feature | null>(null);

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
    countryBorder = null;

    const excludeIds = gameState.answeredIds.join(',');
    const url = `/api/questions/random?${gameState.category ? `category=${gameState.category}&` : ''}exclude=${excludeIds}`;

    const res = await fetch(url);
    if (!res.ok) {
      // No more questions available (e.g. excluded all in this category)
      if (res.status === 404) {
        game.finish();
        goto('/results');
        return;
      }

      throw new Error(`Failed to load question: ${res.status}`);
    }
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
    if (gameState.currentQuestion.category === 'COUNTRY') {
      const name = extractCountryName(gameState.currentQuestion.text);
      if (name) {
        const borderRes = await fetch(`/api/countries/border?name=${encodeURIComponent(name)}`);
        const borderJson = await borderRes.json();
        countryBorder = borderJson?.feature ?? null;
      }
    }
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

  // Extract country name from question text (e.g., "Где находится Франция?" -> "Франция")
  function extractCountryName(text: string): string | null {
    const match = text.match(/Где находится ([^?]+)\?/);
    return match ? match[1] : null;
  }

  const isLastQuestion = gameState.questionNumber >= gameState.totalQuestions;

  function handleExit() {
    // Show modal only if player has score or answered questions
    if (gameState.score > 0 || gameState.questionNumber > 0) {
      showExitModal = true;
    } else {
      game.reset();
      goto('/');
    }
  }

  function confirmExit(saveScore: boolean) {
    showExitModal = false;
    if (saveScore) {
      game.finish();
      goto('/results');
    } else {
      game.reset();
      goto('/');
    }
  }
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
        <button
          onclick={handleExit}
          class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">Выход</span>
        </button>
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
    {#if gameState.mode === 'FIXED_10'}
      <div class="mb-4">
        <ProgressBar current={gameState.questionNumber} total={gameState.totalQuestions} />
      </div>
    {/if}

    <!-- Question -->
    <QuestionCard
      text={gameState.currentQuestion.text}
      category={gameState.currentQuestion.category}
      questionNumber={gameState.mode === 'FIXED_10' ? gameState.questionNumber : undefined}
      totalQuestions={gameState.mode === 'FIXED_10' ? gameState.totalQuestions : undefined}
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
        countryBorder={showResult ? countryBorder : null}
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

<!-- Exit Modal -->
{#if showExitModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] px-4">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
      <div class="text-4xl mb-3">⚠️</div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">Выйти из игры?</h2>
      <p class="text-gray-600 mb-4">
        У вас {gameState.score} очков. Сохранить результат в таблице лидеров?
      </p>
      <div class="flex flex-col gap-3">
        <button
          onclick={() => confirmExit(true)}
          class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          🏆 Сохранить результат
        </button>
        <button
          onclick={() => confirmExit(false)}
          class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Выйти без сохранения
        </button>
        <button
          onclick={() => showExitModal = false}
          class="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Продолжить игру
        </button>
      </div>
    </div>
  </div>
{/if}
