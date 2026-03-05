<script lang="ts">
  import { goto } from '$app/navigation';
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

  let isSaving = $state(false);
  let isDeleting = $state(false);

  let mode = $state<'EDIT' | 'CREATE'>('EDIT');

  let draftText = $state('');
  let draftCategory = $state<QuestionCategory>('CITY');
  let draftDifficulty = $state(1);
  let draftHint = $state('');
  let draftLat = $state<number | null>(null);
  let draftLng = $state<number | null>(null);

  const selected = $derived(questions.find((x) => x.id === selectedId) ?? null);

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
    <h1 class="text-3xl font-bold text-gray-800">🧩 Вопросы</h1>
    <div class="flex gap-2">
      <button
        onclick={() => goto('/admin/suggestions')}
        class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
      >
        ← Предложения
      </button>
      <button
        onclick={() => goto('/')}
        class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
      >
        ← На главную
      </button>
      <button
        onclick={logout}
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Выйти
      </button>
    </div>
  </div>

  <div class="bg-white rounded-2xl shadow-xl p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      <div class="md:col-span-6">
        <label for="questions-search" class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
        <input
          id="questions-search"
          bind:value={q}
          class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Текст вопроса..."
        />
      </div>
      <div class="md:col-span-3">
        <label for="questions-filter-category" class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
        <select
          id="questions-filter-category"
          bind:value={category}
          class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {#each categories as c (c.value)}
            <option value={c.value}>{c.label}</option>
          {/each}
        </select>
      </div>
      <div class="md:col-span-3 flex gap-2">
        <button
          onclick={load}
          class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Обновить
        </button>
        <button
          onclick={startCreate}
          class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          + Создать
        </button>
      </div>
    </div>
  </div>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-50 text-red-700 rounded-xl">{errorMessage}</div>
  {/if}

  {#if isLoading}
    <div class="text-center py-12 text-gray-500">Загрузка...</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
          <div>Всего: {questions.length}</div>
          <div class="text-xs text-gray-500">{mode === 'CREATE' ? 'Создание' : 'Редактирование'}</div>
        </div>
        <div class="divide-y divide-gray-100 max-h-[70vh] overflow-auto">
          {#if questions.length === 0}
            <div class="px-4 py-6 text-sm text-gray-500">Нет вопросов по фильтру</div>
          {:else}
            {#each questions as x (x.id)}
              <button
                class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors {selectedId === x.id && mode === 'EDIT' ? 'bg-indigo-50' : ''}"
                onclick={() => startEdit(x.id)}
              >
                <div class="font-medium text-gray-800 line-clamp-2">{x.text}</div>
                <div class="text-xs text-gray-500 mt-1">{x.category} · diff {x.difficulty}</div>
              </button>
            {/each}
          {/if}
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-lg font-bold text-gray-800">
                {mode === 'CREATE' ? 'Создать вопрос' : selected ? 'Редактировать вопрос' : 'Выберите вопрос'}
              </div>
              {#if mode === 'EDIT' && selected}
                <div class="text-sm text-gray-500 mt-1">ID: {selected.id}</div>
              {/if}
            </div>
            {#if mode === 'EDIT' && selected}
              <button
                onclick={remove}
                disabled={isDeleting}
                class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            {/if}
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-12">
              <label for="question-text" class="block text-sm font-medium text-gray-700 mb-1">Текст</label>
              <textarea
                id="question-text"
                bind:value={draftText}
                rows={3}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              ></textarea>
            </div>

            <div class="md:col-span-4">
              <label for="question-category" class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                id="question-category"
                bind:value={draftCategory}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="CAPITAL">Столица</option>
                <option value="LANDMARK">Достопримечательность</option>
                <option value="CITY">Город</option>
                <option value="COUNTRY">Страна</option>
              </select>
            </div>

            <div class="md:col-span-4">
              <label for="question-difficulty" class="block text-sm font-medium text-gray-700 mb-1">Сложность</label>
              <input
                id="question-difficulty"
                type="number"
                min="1"
                max="10"
                bind:value={draftDifficulty}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div class="md:col-span-4">
              <label for="question-hint" class="block text-sm font-medium text-gray-700 mb-1">Подсказка</label>
              <input
                id="question-hint"
                bind:value={draftHint}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

          <div class="mt-3 text-sm text-gray-500">
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
                class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            {/if}
            <button
              onclick={save}
              disabled={isSaving || (mode === 'EDIT' && !selected)}
              class="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
