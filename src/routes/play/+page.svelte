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
      <div class="text-sm tracking-widest uppercase theme-muted animate-pulse">Загрузка...</div>
    </div>
  </div>
{:else if gameState.currentQuestion}
  <div class="container mx-auto px-4 py-6 max-w-6xl h-[100dvh] flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8 shrink-0">
      <div class="flex items-center gap-6">
        <button
          onclick={handleExit}
          class="btn-secondary text-xs py-2 px-4"
        >
          Выход
        </button>
        <span class="text-xl font-semibold tracking-tight theme-heading">
          GEO<span class="text-teal-500 font-light">HOOT</span>
        </span>
      </div>
      <div class="text-sm font-medium tracking-wider">
        <span class="theme-muted">СЧЕТ</span>
        <span class="ml-2 text-theme-text">{gameState.score}</span>
      </div>
    </header>

    <!-- Progress -->
    {#if gameState.mode === 'FIXED_10'}
      <div class="mb-8 shrink-0">
        <ProgressBar current={gameState.questionNumber} total={gameState.totalQuestions} />
      </div>
    {/if}

    <!-- Content Area -->
    <div class="flex-1 flex flex-col gap-6 lg:flex-row min-h-0">
      <!-- Left Column: Question & Actions -->
      <div class="shrink-0 lg:w-1/3 flex flex-col gap-6">
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
            class="py-3 border border-theme-border text-xs uppercase tracking-widest hover:bg-theme-card-hover transition-colors"
          >
            Подсказка (-100 очков)
          </button>
        {:else if gameState.usedHint && gameState.currentQuestion.hint}
          <div class="py-3 px-4 border border-theme-border bg-theme-card-hover text-sm">
            {gameState.currentQuestion.hint}
          </div>
        {/if}

        <div class="mt-auto pt-4 border-t border-theme-border">
          {#if showResult && gameState.lastAnswer}
            <div class="space-y-6">
              <ScoreDisplay
                points={gameState.lastAnswer.points}
                distanceKm={gameState.lastAnswer.distanceKm}
              />
              <button
                onclick={nextQuestion}
                class="w-full btn-primary py-4 text-sm tracking-widest"
              >
                {isLastQuestion ? 'Результаты' : 'Далее'}
              </button>
            </div>
          {:else}
            <button
              onclick={submitAnswer}
              disabled={!clickedPosition || isSubmitting}
              class="w-full btn-success py-4 text-sm tracking-widest"
            >
              {isSubmitting ? 'Проверка...' : 'Ответить'}
            </button>
          {/if}
        </div>
      </div>

      <!-- Right Column: Map -->
      <div class="flex-1 min-h-[300px] border border-theme-border relative">
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
          <div class="absolute top-4 left-4 bg-theme-bg px-3 py-1 text-xs uppercase tracking-widest border border-theme-border flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
            Метка
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Exit Modal -->
{#if showExitModal}
  <div class="fixed inset-0 bg-theme-bg/90 flex items-center justify-center z-[2000] px-4 backdrop-blur-sm">
    <div class="theme-panel p-8 w-full max-w-sm border border-theme-border">
      <h2 class="text-lg font-semibold theme-heading mb-6 text-center uppercase tracking-widest">Выйти?</h2>
      
      <div class="flex flex-col gap-4">
        <button
          onclick={() => confirmExit(true)}
          class="w-full py-3 btn-primary text-xs"
        >
          Сохранить и выйти
        </button>
        <button
          onclick={() => confirmExit(false)}
          class="w-full btn-secondary py-3 text-xs"
        >
          Выйти без сохранения
        </button>
        <button
          onclick={() => showExitModal = false}
          class="w-full btn-secondary py-3 text-xs mt-2"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
{/if}
