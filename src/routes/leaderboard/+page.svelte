<script lang="ts">
  import { goto } from '$app/navigation';
  import Leaderboard from '$lib/components/Leaderboard.svelte';

  type GameMode = 'FIXED_10' | 'ENDLESS';
  type QuestionCategory = 'CAPITAL' | 'LANDMARK' | 'CITY' | 'COUNTRY';

  interface Entry {
    id: string;
    playerName: string;
    score: number;
    mode: string;
    category: string | null;
    createdAt: string;
  }

  const categories: { value: QuestionCategory; label: string }[] = [
    { value: 'CAPITAL', label: 'Столицы' },
    { value: 'LANDMARK', label: 'Достопримечательности' },
    { value: 'CITY', label: 'Города' },
    { value: 'COUNTRY', label: 'Страны' },
  ];

  let entries = $state<Entry[]>([]);
  let isLoading = $state(true);
  let selectedMode = $state<GameMode>('FIXED_10');
  let selectedCategory = $state<QuestionCategory>('CAPITAL');
  let errorMessage = $state<string | null>(null);

  async function loadLeaderboard() {
    isLoading = true;
    errorMessage = null;

    const params = new URLSearchParams({
      mode: selectedMode,
      limit: '20',
    });

    if (selectedMode === 'FIXED_10') {
      params.set('category', selectedCategory);
    }

    const url = `/api/leaderboard?${params.toString()}`;

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

  const leaderboardTitle = $derived(
    selectedMode === 'ENDLESS'
      ? 'Бесконечный режим'
      : `10 вопросов · ${categories.find((category) => category.value === selectedCategory)?.label ?? ''}`
  );
</script>

<svelte:head>
  <title>Таблица лидеров - GeoHoot</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black theme-heading flex items-center gap-3">
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
        onclick={() => selectedMode = 'FIXED_10'}
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedMode === 'FIXED_10' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
      >
        10 вопросов
      </button>
      <button
        onclick={() => selectedMode = 'ENDLESS'}
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedMode === 'ENDLESS' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
      >
        Бесконечный
      </button>
    </div>
  </div>

  {#if selectedMode === 'FIXED_10'}
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        {#each categories as category (category.value)}
          <button
            onclick={() => selectedCategory = category.value}
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {selectedCategory === category.value ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
          >
            {category.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Leaderboard -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="w-10 h-10 mx-auto mb-3 border-3 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
      <div class="theme-soft">Загрузка...</div>
    </div>
  {:else if errorMessage}
    <div class="text-center py-12 theme-soft">
      {errorMessage}
    </div>
  {:else}
    <Leaderboard entries={entries} title={leaderboardTitle} />
  {/if}
</div>
