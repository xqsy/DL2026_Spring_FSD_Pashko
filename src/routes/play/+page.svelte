<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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
  let unsubscribe: (() => void) | null = null;

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

    try {
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
    } catch (e) {
      console.error(e);
      goto('/');
    } finally {
      isLoading = false;
    }
  }

  async function submitAnswer() {
    if (!clickedPosition || !gameState.currentQuestion || isSubmitting) return;

    isSubmitting = true;

    try {
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

      if (!res.ok) throw new Error(`Failed to submit answer: ${res.status}`);
      const result = await res.json();

      game.setAnswer(result);
      showResult = true;

      if (gameState.currentQuestion.category === 'COUNTRY') {
        const lat = gameState.lastAnswer?.correctLat;
        const lng = gameState.lastAnswer?.correctLng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          const borderRes = await fetch(`/api/countries/border?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`);
          if (borderRes.ok) {
            const borderJson = await borderRes.json();
            countryBorder = borderJson?.feature ?? null;
          } else {
            countryBorder = null;
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      isSubmitting = false;
    }
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
  }

  onMount(() => {
    unsubscribe = game.subscribe((s) => {
      gameState = s;
    });
    loadQuestion();
  });

  onDestroy(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  const handleMapClick = (lat: number, lng: number) => {
    if (!showResult) {
      clickedPosition = { lat, lng };
    }
  };

  const isLastQuestion = $derived(gameState.questionNumber >= gameState.totalQuestions);

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

  const isCountryQuestion = $derived(gameState.currentQuestion?.category === 'COUNTRY');
</script>

<svelte:head>
  <title>Игра - GeoHoot</title>
</svelte:head>

{#if isLoading}
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <div class="w-12 h-12 mx-auto mb-4 border-3 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
      <div class="text-lg theme-muted font-medium">Загрузка вопроса...</div>
    </div>
  </div>
{:else if gameState.currentQuestion}
  <div class="container mx-auto px-4 py-4 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <button
          onclick={handleExit}
          class="flex items-center gap-2 px-3 py-2 glass rounded-lg hover:bg-white/10 transition-colors theme-muted hover:theme-heading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">Выход</span>
        </button>
        <span class="text-xl font-black tracking-tight theme-heading">
          <span class="text-teal-400">Geo</span><span>Hoot</span>
        </span>
      </div>
      <div class="flex items-center gap-3">
        <div class="glass px-4 py-2 rounded-lg flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span class="font-bold text-amber-300 text-glow-amber">{gameState.score}</span>
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
        class="mb-4 px-4 py-2 bg-amber-500/10 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-colors border border-amber-500/20 text-sm font-semibold"
      >
        💡 Подсказка (-100 очков)
      </button>
    {:else if gameState.usedHint && gameState.currentQuestion.hint}
      <div class="mb-4 px-4 py-3 glass-teal rounded-lg text-teal-300 text-sm">
        💡 {gameState.currentQuestion.hint}
      </div>
    {/if}

    <!-- Map -->
    <div class="relative h-[50vh] mb-4 rounded-xl overflow-hidden border theme-border glow-teal">
      <GameMap
        onMapClick={handleMapClick}
        clickedMarker={clickedPosition}
        correctMarker={showResult && gameState.lastAnswer ? { lat: gameState.lastAnswer.correctLat, lng: gameState.lastAnswer.correctLng } : null}
        showLine={showResult && !isCountryQuestion}
        showCorrectMarker={!isCountryQuestion}
        disabled={showResult}
        countryBorder={showResult ? countryBorder : null}
        hideLabels={isCountryQuestion}
      />
      
      <!-- Click indicator -->
      {#if clickedPosition && !showResult}
        <div class="absolute top-4 left-4 glass px-3 py-2 rounded-lg text-sm text-teal-300 font-medium flex items-center gap-2">
          <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
          Точка выбрана
        </div>
      {/if}
    </div>

    <!-- Result -->
    {#if showResult && gameState.lastAnswer}
      <div class="mb-4 animate-slide-up">
        <ScoreDisplay
          points={gameState.lastAnswer.points}
          distanceKm={gameState.lastAnswer.distanceKm}
        />
      </div>
      <div class="animate-slide-up" style="animation-delay: 0.05s">
        <button
          onclick={nextQuestion}
          class="w-full py-4 btn-primary text-lg tracking-wide glow-teal"
        >
          {isLastQuestion ? 'Результаты' : 'Следующий вопрос →'}
        </button>
      </div>
    {:else}
      <button
        onclick={submitAnswer}
        disabled={!clickedPosition || isSubmitting}
        class="w-full py-4 btn-success text-lg tracking-wide"
      >
        {isSubmitting ? 'Проверка...' : 'Ответить'}
      </button>
    {/if}
  </div>

{/if}

<!-- Exit Modal -->
{#if showExitModal}
  <div class="fixed inset-0 theme-overlay backdrop-blur-sm flex items-center justify-center z-[2000] px-4">
    <div class="glass rounded-2xl p-6 w-full max-w-sm text-center glow-teal animate-slide-up">
      <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
        <svg class="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2 class="text-xl font-bold theme-heading mb-2">Выйти из игры?</h2>
      <p class="theme-muted mb-5 text-sm">
        У вас <span class="text-amber-300 font-bold">{gameState.score}</span> очков. Сохранить результат?
      </p>
      <div class="flex flex-col gap-3">
        <button
          onclick={() => confirmExit(true)}
          class="w-full py-3 btn-primary"
        >
          Сохранить результат
        </button>
        <button
          onclick={() => confirmExit(false)}
          class="w-full py-3 btn-secondary"
        >
          Выйти без сохранения
        </button>
        <button
          onclick={() => showExitModal = false}
          class="w-full py-2 theme-soft hover:text-teal-300 transition-colors text-sm"
        >
          Продолжить игру
        </button>
      </div>
    </div>
  </div>
{/if}
