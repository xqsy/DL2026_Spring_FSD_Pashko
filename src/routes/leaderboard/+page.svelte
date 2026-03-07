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
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black text-white flex items-center gap-3">
      <svg class="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Таблица лидеров
    </h1>
    <button
      onclick={() => goto('/')}
      class="btn-secondary text-sm py-2 px-4"
    >
      ← На главную
    </button>
  </div>

  <!-- Mode Filter -->
  <div class="mb-6">
    <div class="flex gap-2">
      <button
        onclick={() => selectedMode = ''}
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedMode === '' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}"
      >
        Все режимы
      </button>
      <button
        onclick={() => selectedMode = 'FIXED_10'}
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedMode === 'FIXED_10' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}"
      >
        10 вопросов
      </button>
      <button
        onclick={() => selectedMode = 'ENDLESS'}
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedMode === 'ENDLESS' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}"
      >
        Бесконечный
      </button>
    </div>
  </div>

  <!-- Leaderboard -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="w-10 h-10 mx-auto mb-3 border-3 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
      <div class="text-slate-500">Загрузка...</div>
    </div>
  {:else if errorMessage}
    <div class="text-center py-12 text-slate-500">
      {errorMessage}
    </div>
  {:else}
    <Leaderboard entries={entries} />
  {/if}
</div>
