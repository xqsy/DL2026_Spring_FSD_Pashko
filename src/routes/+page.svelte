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

<div class="min-h-screen flex flex-col items-center justify-center py-16">
  <div class="w-full max-w-2xl">
    <!-- Header -->
    <header class="mb-16 text-center">
      <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4 theme-heading">
        GEO<span class="text-teal-500 font-light">HOOT</span>
      </h1>
      <p class="text-sm theme-muted uppercase tracking-widest">
        Географическая викторина
      </p>
    </header>

    <!-- Game Setup Card -->
    <div class="theme-panel p-8 md:p-12 border-x-0 sm:border-x">
      <!-- Mode Selection -->
      <div class="mb-10">
        <h2 class="text-xs font-semibold theme-muted mb-4 uppercase tracking-widest">Режим</h2>
        <div class="grid grid-cols-2 gap-4">
          <button
            class="p-5 border transition-all duration-200 text-left relative {selectedMode === 'FIXED_10' ? 'border-emerald-500 bg-emerald-500/10 text-theme-text' : 'border-theme-border theme-text hover:border-theme-text-muted'}"
            onclick={() => selectedMode = 'FIXED_10'}
          >
            <div class="font-medium text-sm mb-1">10 Вопросов</div>
            <div class="text-xs opacity-70">Классический</div>
            {#if selectedMode === 'FIXED_10'}
              <div class="absolute top-4 right-4 w-2 h-2 bg-emerald-500"></div>
            {/if}
          </button>
          
          <button
            class="p-5 border transition-all duration-200 text-left relative {selectedMode === 'ENDLESS' ? 'border-emerald-500 bg-emerald-500/10 text-theme-text' : 'border-theme-border theme-text hover:border-theme-text-muted'}"
            onclick={() => selectedMode = 'ENDLESS'}
          >
            <div class="font-medium text-sm mb-1">Бесконечный</div>
            <div class="text-xs opacity-70">Без лимита</div>
            {#if selectedMode === 'ENDLESS'}
              <div class="absolute top-4 right-4 w-2 h-2 bg-emerald-500"></div>
            {/if}
          </button>
        </div>
      </div>

      <!-- Category Selection -->
      <div class="mb-12">
        <label for="game-category" class="block text-xs font-semibold theme-muted mb-4 uppercase tracking-widest">Категория</label>
        <div class="relative">
          <select
            id="game-category"
            bind:value={selectedCategory}
            class="w-full input-dark appearance-none bg-transparent"
          >
            {#each categories as cat}
              <option value={cat.value} class="bg-theme-bg">{cat.label}</option>
            {/each}
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-theme-muted">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <button
        onclick={startGame}
        disabled={isStarting}
        class="w-full btn-primary py-5 text-sm tracking-widest"
      >
        {isStarting ? 'Загрузка...' : 'Начать'}
      </button>
    </div>

    <!-- Navigation -->
    <nav class="mt-12 flex justify-center gap-4">
      <a href="/leaderboard" class="btn-secondary text-xs flex items-center justify-center min-w-[140px]">
        Рейтинг
      </a>
      <a href="/suggest" class="btn-secondary text-xs flex items-center justify-center min-w-[140px]">
        Предложить
      </a>
    </nav>
  </div>
</div>
