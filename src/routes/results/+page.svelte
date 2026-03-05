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

<div class="min-h-[80vh] flex flex-col items-center justify-center px-4">
  <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
    <!-- Score -->
    <div class="mb-6">
      <div class="text-6xl mb-2">🎉</div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Игра окончена!</h1>
      <p class="text-gray-600">{getScoreMessage(gameState.score)}</p>
    </div>

    <!-- Stats -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-6 text-white">
      <div class="text-5xl font-bold mb-2">{gameState.score}</div>
      <div class="text-indigo-100">очков</div>
      <div class="mt-4 text-sm text-indigo-200">
        {gameState.questionNumber} вопросов • {gameState.mode === 'FIXED_10' ? 'Режим: 10 вопросов' : 'Режим: Бесконечный'}
      </div>
    </div>

    <!-- Submit to leaderboard -->
    {#if !submitted}
      <div class="mb-6">
        <label for="playerName" class="block text-sm font-medium text-gray-700 mb-2">
          Ваше имя для таблицы лидеров
        </label>
        <input
          id="playerName"
          type="text"
          bind:value={playerName}
          placeholder="Введите имя..."
          maxlength="30"
          class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div class="flex flex-col gap-3">
        <button
          onclick={submitScore}
          disabled={!playerName.trim() || isSubmitting}
          class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить результат'}
        </button>
        <button
          onclick={playAgain}
          class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Играть снова
        </button>
      </div>
    {:else}
      <div class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl">
        ✅ Результат сохранён!
      </div>
      <div class="flex flex-col gap-3">
        <button
          onclick={viewLeaderboard}
          class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          🏆 Таблица лидеров
        </button>
        <button
          onclick={playAgain}
          class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Играть снова
        </button>
      </div>
    {/if}
  </div>
</div>
