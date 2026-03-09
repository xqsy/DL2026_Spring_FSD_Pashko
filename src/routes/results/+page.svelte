<script lang="ts">
  import { goto } from '$app/navigation';
  import { game, getGame } from '$lib/stores/game';

  let playerName = $state('');
  let isSubmitting = $state(false);
  let submitted = $state(false);

  let gameState = $state(getGame());

  async function submitScore() {
    if (!playerName.trim() || isSubmitting) return;

    isSubmitting = true;

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          score: gameState.score,
          mode: gameState.mode,
          category: gameState.category,
          sessionId: gameState.sessionId,
        }),
      });

      game.setPlayerName(playerName.trim());
      submitted = true;
    } catch (e) {
      console.error('Failed to submit score:', e);
    } finally {
      isSubmitting = false;
    }
  }

  function playAgain() {
    game.reset();
    goto('/');
  }

  function exitToMenu() {
    game.reset();
    goto('/');
  }

  function viewLeaderboard() {
    goto('/leaderboard');
  }

  const getScoreMessage = (score: number) => {
    if (score >= 9000) return 'Идеальный результат';
    if (score >= 7000) return 'Отличный результат';
    if (score >= 5000) return 'Хороший результат';
    if (score >= 3000) return 'Неплохо';
    return 'Попробуйте еще раз';
  };
</script>

<svelte:head>
  <title>Результаты - GeoHoot</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center py-16 px-4">
  <div class="theme-panel p-8 md:p-16 w-full max-w-xl border-x-0 sm:border-x">
    <!-- Header -->
    <header class="text-center mb-12">
      <h1 class="text-sm tracking-widest uppercase theme-muted mb-4">Игра окончена</h1>
      <p class="text-xl md:text-2xl font-light theme-heading">{getScoreMessage(gameState.score)}</p>
    </header>

    <!-- Stats -->
    <div class="border-y border-theme-border py-12 mb-12 text-center">
      <div class="text-6xl md:text-7xl font-light text-teal-500 mb-4">{gameState.score}</div>
      <div class="text-xs tracking-widest uppercase theme-muted">Итоговый счет</div>
      <div class="mt-6 text-xs uppercase tracking-widest theme-soft flex justify-center gap-4">
        <span>Режим: {gameState.mode === 'FIXED_10' ? '10 Вопросов' : 'Бесконечный'}</span>
        {#if gameState.mode === 'FIXED_10'}
          <span>•</span>
          <span>Вопросов: {gameState.questionNumber}</span>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="max-w-sm mx-auto">
      {#if !submitted}
        <div class="mb-8">
          <label for="playerName" class="block text-xs font-medium theme-muted mb-3 uppercase tracking-widest text-center">
            Имя для рейтинга
          </label>
          <input
            id="playerName"
            type="text"
            bind:value={playerName}
            placeholder="Введите имя"
            maxlength="30"
            class="w-full input-dark text-center"
          />
        </div>

        <div class="flex flex-col gap-4">
          <button
            onclick={submitScore}
            disabled={!playerName.trim() || isSubmitting}
            class="w-full py-4 btn-primary text-xs"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          <div class="flex gap-4">
            <button
              onclick={playAgain}
              class="flex-1 py-4 border border-theme-border hover:bg-theme-card-hover transition-colors text-xs uppercase tracking-widest"
            >
              Еще раз
            </button>
            <button
              onclick={exitToMenu}
              class="flex-1 py-4 border border-theme-border hover:bg-theme-card-hover transition-colors text-xs uppercase tracking-widest"
            >
              В меню
            </button>
          </div>
        </div>
      {:else}
        <div class="mb-8 p-4 border border-teal-500 text-teal-500 text-center text-xs uppercase tracking-widest">
          Результат сохранён
        </div>
        <div class="flex flex-col gap-4">
          <button
            onclick={viewLeaderboard}
            class="w-full py-4 btn-primary text-xs"
          >
            Рейтинг
          </button>
          <div class="flex gap-4">
            <button
              onclick={playAgain}
              class="flex-1 py-4 border border-theme-border hover:bg-theme-card-hover transition-colors text-xs uppercase tracking-widest"
            >
              Еще раз
            </button>
            <button
              onclick={exitToMenu}
              class="flex-1 py-4 border border-theme-border hover:bg-theme-card-hover transition-colors text-xs uppercase tracking-widest"
            >
              В меню
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
