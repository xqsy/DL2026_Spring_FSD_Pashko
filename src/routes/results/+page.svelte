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
    if (score >= 9000) return 'Невероятно! Вы географический гений! 🏆';
    if (score >= 7000) return 'Отличный результат! Вы отлично знаете географию! 🌟';
    if (score >= 5000) return 'Хороший результат! Есть куда расти! 👍';
    if (score >= 3000) return 'Неплохо! Продолжайте изучать мир! 📚';
    return 'Не сдавайтесь! Практика делает совершенным! 💪';
  };
</script>

<svelte:head>
  <title>Результаты - GeoHoot</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
  <div class="glass rounded-2xl p-8 w-full max-w-md text-center glow-teal animate-slide-up">
    <!-- Score -->
    <div class="mb-6">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center">
        <span class="text-4xl">🎉</span>
      </div>
      <h1 class="text-3xl font-black text-white mb-2">Игра окончена!</h1>
      <p class="text-slate-400 text-sm">{getScoreMessage(gameState.score)}</p>
    </div>

    <!-- Stats -->
    <div class="bg-gradient-to-br from-teal-500/15 to-emerald-500/10 rounded-xl p-6 mb-6 border border-teal-500/20">
      <div class="text-5xl font-black text-teal-300 text-glow-teal mb-1">{gameState.score}</div>
      <div class="text-teal-400/60 text-sm font-semibold uppercase tracking-wider">очков</div>
      <div class="mt-4 text-xs text-slate-500">
        {#if gameState.mode === 'FIXED_10'}
          {gameState.questionNumber} вопросов • Режим: 10 вопросов
        {:else}
          Режим: Бесконечный
        {/if}
      </div>
    </div>

    <!-- Submit to leaderboard -->
    {#if !submitted}
      <div class="mb-6 text-left">
        <label for="playerName" class="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Ваше имя для таблицы лидеров
        </label>
        <input
          id="playerName"
          type="text"
          bind:value={playerName}
          placeholder="Введите имя..."
          maxlength="30"
          class="w-full input-dark"
        />
      </div>

      <div class="flex flex-col gap-3">
        <button
          onclick={submitScore}
          disabled={!playerName.trim() || isSubmitting}
          class="w-full py-3 btn-primary"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить результат'}
        </button>
        <button
          onclick={exitToMenu}
          class="w-full py-3 btn-secondary"
        >
          Выйти в меню
        </button>
        <button
          onclick={playAgain}
          class="w-full py-3 btn-secondary"
        >
          Играть снова
        </button>
      </div>
    {:else}
      <div class="mb-6 p-4 glass-teal rounded-xl text-teal-300 flex items-center justify-center gap-2 text-sm font-semibold">
        <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
        Результат сохранён!
      </div>
      <div class="flex flex-col gap-3">
        <button
          onclick={viewLeaderboard}
          class="w-full py-3 btn-amber flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Таблица лидеров
        </button>
        <button
          onclick={exitToMenu}
          class="w-full py-3 btn-secondary"
        >
          Выйти в меню
        </button>
        <button
          onclick={playAgain}
          class="w-full py-3 btn-primary"
        >
          Играть снова
        </button>
      </div>
    {/if}
  </div>
</div>
