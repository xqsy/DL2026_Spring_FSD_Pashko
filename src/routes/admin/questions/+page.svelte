<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import GameMap from '$lib/components/GameMap.svelte';

  type QuestionCategory = 'CAPITAL' | 'LANDMARK' | 'CITY' | 'COUNTRY';

  type Question = {
    id: string;
    text: string;
    correctLat: number;
    correctLng: number;
    category: QuestionCategory;
    difficulty: number;
    hint: string | null;
    createdAt: string;
    updatedAt: string;
  };

  const categories: { value: QuestionCategory | ''; label: string }[] = [
    { value: '', label: 'Все категории' },
    { value: 'CAPITAL', label: 'Столица' },
    { value: 'LANDMARK', label: 'Достопримечательность' },
    { value: 'CITY', label: 'Город' },
    { value: 'COUNTRY', label: 'Страна' },
  ];

  let questions = $state<Question[]>([]);
  let selectedId = $state<string | null>(null);

  let q = $state('');
  let category = $state<QuestionCategory | ''>('');

  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  let isSaving = $state(false);
  let isDeleting = $state(false);
  let successTimer: ReturnType<typeof setTimeout> | null = null;

  let mode = $state<'EDIT' | 'CREATE'>('EDIT');

  let draftText = $state('');
  let draftCategory = $state<QuestionCategory>('CITY');
  let draftDifficulty = $state(1);
  let draftHint = $state('');
  let draftLat = $state<number | null>(null);
  let draftLng = $state<number | null>(null);

  const selected = $derived(questions.find((x) => x.id === selectedId) ?? null);

  function showSuccess(message: string) {
    successMessage = message;
    if (successTimer) clearTimeout(successTimer);
    successTimer = setTimeout(() => {
      successMessage = null;
      successTimer = null;
    }, 3000);
  }

  function syncDraftFromSelected() {
    if (!selected) return;
    draftText = selected.text;
    draftCategory = selected.category;
    draftDifficulty = selected.difficulty;
    draftHint = selected.hint ?? '';
    draftLat = selected.correctLat;
    draftLng = selected.correctLng;
  }

  async function load() {
    isLoading = true;
    errorMessage = null;

    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (category) params.set('category', category);
      params.set('take', '300');

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (res.status === 401) {
        goto('/admin');
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      const body = await res.json();
      questions = body.questions ?? [];

      if (mode === 'EDIT') {
        if (questions.length === 0) {
          selectedId = null;
        } else if (!selectedId || !questions.some((x) => x.id === selectedId)) {
          selectedId = questions[0].id;
        }
      }
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось загрузить вопросы';
    } finally {
      isLoading = false;
    }
  }

  function startCreate() {
    mode = 'CREATE';
    selectedId = null;
    draftText = '';
    draftCategory = 'CITY';
    draftDifficulty = 1;
    draftHint = '';
    draftLat = null;
    draftLng = null;
  }

  function startEdit(id: string) {
    mode = 'EDIT';
    selectedId = id;
  }

  async function save() {
    if (isSaving) return;
    if (!draftText.trim()) {
      errorMessage = 'Текст вопроса обязателен';
      return;
    }
    if (draftLat === null || draftLng === null) {
      errorMessage = 'Нужно выбрать точку на карте';
      return;
    }

    isSaving = true;
    errorMessage = null;

    try {
      if (mode === 'CREATE') {
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: draftText.trim(),
            correctLat: draftLat,
            correctLng: draftLng,
            category: draftCategory,
            difficulty: draftDifficulty,
            hint: draftHint.trim() ? draftHint.trim() : null,
          }),
        });

        if (res.status === 401) {
          goto('/admin');
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Failed: ${res.status}`);
        }

        const body = await res.json();
        const created: Question | null = body.question ?? null;
        await load();
        if (created) {
          mode = 'EDIT';
          selectedId = created.id;
        }
        showSuccess('Вопрос успешно создан');
      } else {
        if (!selected) return;
        const res = await fetch('/api/admin/questions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selected.id,
            text: draftText.trim(),
            correctLat: draftLat,
            correctLng: draftLng,
            category: draftCategory,
            difficulty: draftDifficulty,
            hint: draftHint.trim() ? draftHint.trim() : null,
          }),
        });

        if (res.status === 401) {
          goto('/admin');
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Failed: ${res.status}`);
        }

        await load();
        showSuccess('Изменения успешно сохранены');
      }
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось сохранить вопрос';
    } finally {
      isSaving = false;
    }
  }

  async function remove() {
    if (!selected || isDeleting) return;

    const ok = confirm('Удалить вопрос? Это удалит также ответы пользователей на него.');
    if (!ok) return;

    isDeleting = true;
    errorMessage = null;

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id }),
      });

      if (res.status === 401) {
        goto('/admin');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed: ${res.status}`);
      }

      await load();
      showSuccess('Вопрос успешно удалён');
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось удалить вопрос';
    } finally {
      isDeleting = false;
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    goto('/');
  }

  onDestroy(() => {
    if (successTimer) clearTimeout(successTimer);
  });

  $effect(() => {
    load();
  });

  $effect(() => {
    if (mode !== 'EDIT') return;
    syncDraftFromSelected();
  });

  $effect(() => {
    if (mode !== 'EDIT') return;
    if (!selectedId) return;
    if (!questions.some((x) => x.id === selectedId)) return;
  });
</script>

<svelte:head>
  <title>Admin: questions - GeoHoot</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-black text-white">Вопросы</h1>
    <div class="flex gap-2">
      <button
        onclick={() => goto('/admin/suggestions')}
        class="btn-secondary text-sm py-2 px-4"
      >
        ← Предложения
      </button>
      <button
        onclick={() => goto('/')}
        class="btn-secondary text-sm py-2 px-4"
      >
        ← На главную
      </button>
      <button
        onclick={logout}
        class="btn-secondary text-sm py-2 px-4 !text-red-400 !border-red-500/20"
      >
        Выйти
      </button>
    </div>
  </div>

  <div class="glass rounded-2xl p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      <div class="md:col-span-6">
        <label for="questions-search" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Поиск</label>
        <input
          id="questions-search"
          bind:value={q}
          class="w-full input-dark"
          placeholder="Текст вопроса..."
        />
      </div>
      <div class="md:col-span-3">
        <label for="questions-filter-category" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Категория</label>
        <select
          id="questions-filter-category"
          bind:value={category}
          class="w-full input-dark"
        >
          {#each categories as c (c.value)}
            <option value={c.value}>{c.label}</option>
          {/each}
        </select>
      </div>
      <div class="md:col-span-3 flex gap-2">
        <button
          onclick={load}
          class="flex-1 px-4 py-3 btn-secondary"
        >
          Обновить
        </button>
        <button
          onclick={startCreate}
          class="flex-1 px-4 py-3 btn-primary"
        >
          + Создать
        </button>
      </div>
    </div>
  </div>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-sm">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="mb-4 p-3 glass-teal text-teal-300 rounded-xl text-sm">{successMessage}</div>
  {/if}

  {#if isLoading}
    <div class="text-center py-12 text-slate-500">Загрузка...</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="glass rounded-2xl overflow-hidden">
        <div class="px-4 py-3 border-b border-white/5 text-sm text-slate-500 flex items-center justify-between">
          <div>Всего: {questions.length}</div>
          <span class="badge-teal text-xs">{mode === 'CREATE' ? 'Создание' : 'Редактирование'}</span>
        </div>
        <div class="divide-y divide-white/5 max-h-[70vh] overflow-auto">
          {#if questions.length === 0}
            <div class="px-4 py-6 text-sm text-slate-500">Нет вопросов по фильтру</div>
          {:else}
            {#each questions as x (x.id)}
              <button
                class="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors {selectedId === x.id && mode === 'EDIT' ? 'bg-teal-500/10 border-l-2 border-l-teal-400' : ''}"
                onclick={() => startEdit(x.id)}
              >
                <div class="font-medium text-slate-200 line-clamp-2">{x.text}</div>
                <div class="text-xs text-slate-500 mt-1">{x.category} · diff {x.difficulty}</div>
              </button>
            {/each}
          {/if}
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="glass rounded-2xl p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-lg font-bold text-white">
                {mode === 'CREATE' ? 'Создать вопрос' : selected ? 'Редактировать вопрос' : 'Выберите вопрос'}
              </div>
              {#if mode === 'EDIT' && selected}
                <div class="text-sm text-slate-500 mt-1 font-mono">ID: {selected.id}</div>
              {/if}
            </div>
            {#if mode === 'EDIT' && selected}
              <button
                onclick={remove}
                disabled={isDeleting}
                class="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-red-500/20 text-sm font-semibold"
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            {/if}
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-12">
              <label for="question-text" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Текст</label>
              <textarea
                id="question-text"
                bind:value={draftText}
                rows={3}
                class="w-full input-dark resize-none"
              ></textarea>
            </div>

            <div class="md:col-span-4">
              <label for="question-category" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Категория</label>
              <select
                id="question-category"
                bind:value={draftCategory}
                class="w-full input-dark"
              >
                <option value="CAPITAL">Столица</option>
                <option value="LANDMARK">Достопримечательность</option>
                <option value="CITY">Город</option>
                <option value="COUNTRY">Страна</option>
              </select>
            </div>

            <div class="md:col-span-4">
              <label for="question-difficulty" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Сложность</label>
              <input
                id="question-difficulty"
                type="number"
                min="1"
                max="10"
                bind:value={draftDifficulty}
                class="w-full input-dark"
              />
            </div>

            <div class="md:col-span-4">
              <label for="question-hint" class="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Подсказка</label>
              <input
                id="question-hint"
                bind:value={draftHint}
                class="w-full input-dark"
                placeholder="(необязательно)"
              />
            </div>
          </div>

          <div class="mt-4 h-[360px] rounded-xl overflow-hidden">
            <GameMap
              onMapClick={(lat, lng) => {
                draftLat = lat;
                draftLng = lng;
              }}
              clickedMarker={draftLat !== null && draftLng !== null ? { lat: draftLat, lng: draftLng } : null}
              correctMarker={null}
              showLine={false}
              disabled={false}
              countryBorder={null}
              hideLabels={false}
            />
          </div>

          <div class="mt-3 text-sm text-slate-500">
            {#if draftLat !== null && draftLng !== null}
              Выбрано: {draftLat.toFixed(5)}, {draftLng.toFixed(5)}
            {:else}
              Кликните по карте, чтобы выбрать точку
            {/if}
          </div>

          <div class="mt-4 flex gap-3">
            {#if mode === 'CREATE'}
              <button
                onclick={() => {
                  mode = 'EDIT';
                  selectedId = questions[0]?.id ?? null;
                  if (selectedId) syncDraftFromSelected();
                }}
                class="flex-1 py-3 btn-secondary"
              >
                Отмена
              </button>
            {/if}
            <button
              onclick={save}
              disabled={isSaving || (mode === 'EDIT' && !selected)}
              class="flex-1 py-3 btn-success"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
