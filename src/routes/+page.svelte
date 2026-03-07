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

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
  <!-- Hero -->
  <div class="text-center mb-10 animate-slide-up">
    <!-- Animated Globe -->
    <div class="relative inline-block mb-6">
      <div class="w-24 h-24 mx-auto animate-float">
        <svg viewBox="0 0 128 128" class="w-full h-full drop-shadow-[0_0_30px_rgba(20,184,166,0.4)]">
          <defs>
            <linearGradient id="hero-globe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#0f766e"/>
              <stop offset="100%" style="stop-color:#14b8a6"/>
            </linearGradient>
            <linearGradient id="hero-land" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#34d399"/>
              <stop offset="100%" style="stop-color:#10b981"/>
            </linearGradient>
          </defs>
          <circle cx="64" cy="64" r="58" fill="url(#hero-globe)"/>
          <ellipse cx="64" cy="64" rx="28" ry="56" fill="none" stroke="#5eead4" stroke-width="1.5" opacity="0.4"/>
          <ellipse cx="64" cy="64" rx="48" ry="56" fill="none" stroke="#5eead4" stroke-width="1" opacity="0.25"/>
          <line x1="8" y1="64" x2="120" y2="64" stroke="#5eead4" stroke-width="1" opacity="0.3"/>
          <path d="M30 35 Q38 28 50 32 Q55 38 48 45 Q40 48 32 42 Z" fill="url(#hero-land)" opacity="0.9"/>
          <path d="M60 25 Q72 20 82 28 Q88 38 80 48 Q70 52 62 45 Q56 35 60 25Z" fill="url(#hero-land)" opacity="0.9"/>
          <path d="M75 55 Q85 50 95 58 Q98 68 90 75 Q80 78 74 68Z" fill="url(#hero-land)" opacity="0.8"/>
          <path d="M35 60 Q45 55 55 62 Q58 72 50 78 Q40 80 34 70Z" fill="url(#hero-land)" opacity="0.85"/>
          <path d="M55 82 Q65 78 72 85 Q74 92 68 96 Q58 98 54 90Z" fill="url(#hero-land)" opacity="0.8"/>
          <circle cx="64" cy="64" r="58" fill="none" stroke="#14b8a6" stroke-width="2.5" opacity="0.5"/>
        </svg>
      </div>
      <!-- Orbiting dot -->
      <div class="absolute inset-0 animate-spin-slow">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
      </div>
    </div>

    <h1 class="text-5xl sm:text-6xl font-black tracking-tight mb-3">
      <span class="text-teal-400 text-glow-teal">Geo</span><span class="text-white">Hoot</span>
    </h1>
    <p class="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
      Проверь свои знания географии! Найди города, достопримечательности и страны на карте мира.
    </p>
  </div>

  <!-- Game Setup Card -->
  <div class="glass rounded-2xl p-8 w-full max-w-md glow-teal animate-slide-up" style="animation-delay: 0.15s">
    <h2 class="text-xl font-bold text-teal-300 mb-6 text-center tracking-wide uppercase">Начать игру</h2>
    
    <!-- Mode Selection -->
    <div class="mb-6">
      <div class="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Режим игры</div>
      <div class="grid grid-cols-2 gap-3">
        <button
          class="p-4 rounded-xl border transition-all duration-300 text-left {selectedMode === 'FIXED_10' ? 'border-teal-500/50 bg-teal-500/10 glow-teal' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}"
          onclick={() => selectedMode = 'FIXED_10'}
        >
          <div class="text-2xl mb-1">🎯</div>
          <div class="font-bold text-sm {selectedMode === 'FIXED_10' ? 'text-teal-300' : 'text-slate-300'}">10 вопросов</div>
          <div class="text-xs mt-0.5 {selectedMode === 'FIXED_10' ? 'text-teal-400/70' : 'text-slate-500'}">Классический</div>
        </button>
        <button
          class="p-4 rounded-xl border transition-all duration-300 text-left {selectedMode === 'ENDLESS' ? 'border-teal-500/50 bg-teal-500/10 glow-teal' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}"
          onclick={() => selectedMode = 'ENDLESS'}
        >
          <div class="text-2xl mb-1">♾️</div>
          <div class="font-bold text-sm {selectedMode === 'ENDLESS' ? 'text-teal-300' : 'text-slate-300'}">Бесконечный</div>
          <div class="text-xs mt-0.5 {selectedMode === 'ENDLESS' ? 'text-teal-400/70' : 'text-slate-500'}">Без лимита</div>
        </button>
      </div>
    </div>

    <!-- Category Selection -->
    <div class="mb-8">
      <label for="game-category" class="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Категория</label>
      <select
        id="game-category"
        bind:value={selectedCategory}
        class="w-full input-dark"
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
      class="w-full py-4 btn-primary text-lg tracking-wide"
    >
      {isStarting ? 'Загрузка...' : 'Играть'}
    </button>
  </div>

  <!-- Quick Links -->
  <div class="mt-8 flex gap-4 animate-slide-up" style="animation-delay: 0.3s">
    <a
      href="/leaderboard"
      class="btn-secondary flex items-center gap-2 text-sm"
    >
      <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Таблица лидеров
    </a>
    <a
      href="/suggest"
      class="btn-secondary flex items-center gap-2 text-sm"
    >
      <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      Предложить вопрос
    </a>
  </div>
</div>
