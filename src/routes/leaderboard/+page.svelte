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

<div class="container mx-auto px-4 py-12 max-w-4xl">
  <!-- Header -->
  <header class="flex items-center justify-between mb-16 border-b border-theme-border pb-6">
    <h1 class="text-2xl font-semibold tracking-tight theme-heading uppercase">
      Рейтинг
    </h1>
    <button
      onclick={() => goto('/')}
      class="btn-secondary text-xs py-2 px-4"
    >
      На главную
    </button>
  </header>

  <!-- Mode Filter -->
  <div class="mb-12">
    <div class="flex gap-4 border-b border-theme-border">
      <button
        onclick={() => selectedMode = 'FIXED_10'}
        class="pb-4 px-2 text-xs uppercase tracking-widest font-medium transition-colors relative {selectedMode === 'FIXED_10' ? 'text-theme-text' : 'theme-muted hover:text-theme-text'}"
      >
        10 вопросов
        {#if selectedMode === 'FIXED_10'}
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
        {/if}
      </button>
      <button
        onclick={() => selectedMode = 'ENDLESS'}
        class="pb-4 px-2 text-xs uppercase tracking-widest font-medium transition-colors relative {selectedMode === 'ENDLESS' ? 'text-theme-text' : 'theme-muted hover:text-theme-text'}"
      >
        Бесконечный
        {#if selectedMode === 'ENDLESS'}
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
        {/if}
      </button>
    </div>
  </div>

  {#if selectedMode === 'FIXED_10'}
    <div class="mb-12">
      <div class="flex flex-wrap gap-4">
        {#each categories as category (category.value)}
          <button
            onclick={() => selectedCategory = category.value}
            class="px-4 py-2 border transition-all text-xs uppercase tracking-widest {selectedCategory === category.value ? 'border-theme-text-strong bg-theme-text-strong text-theme-bg' : 'border-theme-border theme-muted hover:border-theme-text-muted hover:text-theme-text'}"
          >
            {category.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Leaderboard -->
  {#if isLoading}
    <div class="text-center py-24">
      <div class="text-sm tracking-widest uppercase theme-muted animate-pulse">Загрузка...</div>
    </div>
  {:else if errorMessage}
    <div class="text-center py-24 theme-soft text-sm tracking-widest uppercase">
      {errorMessage}
    </div>
  {:else}
    <Leaderboard entries={entries} title={leaderboardTitle} />
  {/if}
</div>
