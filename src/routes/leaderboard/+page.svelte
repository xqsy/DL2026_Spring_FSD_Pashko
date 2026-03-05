<script lang="ts">
  import { goto } from '$app/navigation';
  import Leaderboard from '$lib/components/Leaderboard.svelte';

  interface Entry {
    id: string;
    playerName: string;
    score: number;
    mode: string;
    category: string | null;
    createdAt: string;
  }

  let entries = $state<Entry[]>([]);
  let isLoading = $state(true);
  let selectedMode = $state<string>('');
  let errorMessage = $state<string | null>(null);

  async function loadLeaderboard() {
    isLoading = true;
    errorMessage = null;
    const url = `/api/leaderboard?${selectedMode ? `mode=${selectedMode}&` : ''}limit=20`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load leaderboard: ${res.status}`);
      entries = await res.json();
    } catch (e) {
      console.error(e);
      entries = [];
      errorMessage = 'Не удалось загрузить таблицу лидеров';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    loadLeaderboard();
  });
</script>

<svelte:head>
  <title>Таблица лидеров - GeoHoot</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold text-gray-800">🏆 Таблица лидеров</h1>
    <button
      onclick={() => goto('/')}
      class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
    >
      ← На главную
    </button>
  </div>

  <!-- Mode Filter -->
  <div class="mb-6">
    <div class="flex gap-2">
      <button
        onclick={() => selectedMode = ''}
        class="px-4 py-2 rounded-lg transition-colors {selectedMode === '' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      >
        Все режимы
      </button>
      <button
        onclick={() => selectedMode = 'FIXED_10'}
        class="px-4 py-2 rounded-lg transition-colors {selectedMode === 'FIXED_10' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      >
        10 вопросов
      </button>
      <button
        onclick={() => selectedMode = 'ENDLESS'}
        class="px-4 py-2 rounded-lg transition-colors {selectedMode === 'ENDLESS' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      >
        Бесконечный
      </button>
    </div>
  </div>

  <!-- Leaderboard -->
  {#if isLoading}
    <div class="text-center py-12 text-gray-500">
      Загрузка...
    </div>
  {:else if errorMessage}
    <div class="text-center py-12 text-gray-500">
      {errorMessage}
    </div>
  {:else}
    <Leaderboard entries={entries} />
  {/if}
</div>
