<script lang="ts">
  import { goto } from '$app/navigation';
  import { game } from '$lib/stores/game';

  let selectedMode = $state<'FIXED_10' | 'ENDLESS'>('FIXED_10');
  let selectedCategory = $state<string>('');
  let isStarting = $state(false);

  const categories = [
    { value: '', label: 'Все категории' },
    { value: 'CAPITAL', label: 'Столицы' },
    { value: 'LANDMARK', label: 'Достопримечательности' },
    { value: 'CITY', label: 'Города' },
    { value: 'COUNTRY', label: 'Страны' },
  ];

  async function startGame() {
    isStarting = true;
    game.reset();

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          category: selectedCategory || null,
        }),
      });
      const session = await res.json();
      
      game.setSession(
        session.id,
        selectedMode,
        selectedCategory || null,
        selectedMode === 'FIXED_10' ? 10 : 999
      );
      
      goto('/play');
    } catch (e) {
      console.error('Failed to start game:', e);
      isStarting = false;
    }
  }
</script>

<svelte:head>
  <title>GeoHoot - Географическая викторина</title>
</svelte:head>

<div class="min-h-[80vh] flex flex-col items-center justify-center px-4">
  <div class="text-center mb-12">
    <h1 class="text-6xl font-bold text-indigo-600 mb-4">
      🌍 GeoHoot
    </h1>
    <p class="text-xl text-gray-600 max-w-md">
      Проверь свои знания географии! Найди города, достопримечательности и страны на карте мира.
    </p>
  </div>

  <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Начать игру</h2>
    
    <!-- Mode Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Режим игры</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          class="p-4 rounded-xl border-2 transition-all {selectedMode === 'FIXED_10' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}"
          onclick={() => selectedMode = 'FIXED_10'}
        >
          <div class="font-bold">10 вопросов</div>
          <div class="text-sm opacity-75">Классический режим</div>
        </button>
        <button
          class="p-4 rounded-xl border-2 transition-all {selectedMode === 'ENDLESS' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}"
          onclick={() => selectedMode = 'ENDLESS'}
        >
          <div class="font-bold">Бесконечный</div>
          <div class="text-sm opacity-75">Играй сколько хочешь</div>
        </button>
      </div>
    </div>

    <!-- Category Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Категория</label>
      <select
        bind:value={selectedCategory}
        class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
    </div>

    <!-- Start Button -->
    <button
      onclick={startGame}
      disabled={isStarting}
      class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isStarting ? 'Загрузка...' : '🎮 Играть!'}
    </button>
  </div>

  <!-- Quick Links -->
  <div class="mt-8 flex gap-4">
    <a
      href="/leaderboard"
      class="px-6 py-3 bg-white rounded-xl shadow hover:shadow-md transition-all text-gray-700"
    >
      🏆 Таблица лидеров
    </a>
  </div>
</div>
