<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import GameMap from '$lib/components/GameMap.svelte';

  type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
  type QuestionCategory = 'CAPITAL' | 'LANDMARK' | 'CITY' | 'COUNTRY';

  type Suggestion = {
    id: string;
    questionText: string;
    lat: number;
    lng: number;
    country: string | null;
    city: string | null;
    status: SuggestionStatus;
    adminNote: string | null;
    createdAt: string;
    createdQuestionId: string | null;
  };

  let suggestions = $state<Suggestion[]>([]);
  let selectedStatus = $state<SuggestionStatus | ''>('PENDING');
  let selectedId = $state<string | null>(null);

  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);
  let successMessage = $state<string | null>(null);
  let adminNote = $state('');
  let isActing = $state(false);
  let approveCategory = $state<QuestionCategory>('CITY');
  let successTimer: ReturnType<typeof setTimeout> | null = null;

  const selected = $derived(suggestions.find((s) => s.id === selectedId) ?? null);

  function showSuccess(message: string) {
    successMessage = message;
    if (successTimer) clearTimeout(successTimer);
    successTimer = setTimeout(() => {
      successMessage = null;
      successTimer = null;
    }, 3000);
  }

  async function load() {
    isLoading = true;
    errorMessage = null;

    try {
      const qs = selectedStatus ? `?status=${selectedStatus}` : '';
      const res = await fetch(`/api/admin/suggestions${qs}`);
      if (res.status === 401) {
        goto('/admin');
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const body = await res.json();
      suggestions = body.suggestions ?? [];
      if (!selectedId && suggestions[0]) selectedId = suggestions[0].id;
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось загрузить предложения';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    load();
  });

  $effect(() => {
    adminNote = selected?.adminNote ?? '';
  });

  $effect(() => {
    if (selected?.status !== 'PENDING') return;
    if (selected?.city) approveCategory = 'CITY';
    else if (selected?.country) approveCategory = 'COUNTRY';
    else approveCategory = 'CITY';
  });

  async function act(action: 'APPROVE' | 'REJECT') {
    if (!selected || isActing) return;
    isActing = true;

    try {
      const res = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          action,
          adminNote: adminNote.trim() || null,
          category: action === 'APPROVE' ? approveCategory : undefined,
        }),
      });

      if (res.status === 401) {
        goto('/admin');
        return;
      }

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      await load();
      showSuccess(action === 'APPROVE' ? 'Предложение успешно одобрено' : 'Предложение успешно отклонено');
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось выполнить действие';
    } finally {
      isActing = false;
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    goto('/');
  }

  onMount(() => {
    const flash = sessionStorage.getItem('admin_flash_success');
    if (flash) {
      sessionStorage.removeItem('admin_flash_success');
      showSuccess(flash);
    }
  });

  onDestroy(() => {
    if (successTimer) clearTimeout(successTimer);
  });
</script>

<svelte:head>
  <title>Admin: suggestions - GeoHoot</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold text-gray-800">🛠️ Предложения вопросов</h1>
    <div class="flex gap-2">
      <button
        onclick={() => goto('/admin/questions')}
        class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
      >
        🧩 Вопросы
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

  <div class="mb-6 flex gap-2">
    <button
      onclick={() => (selectedStatus = 'PENDING')}
      class="px-4 py-2 rounded-lg transition-colors {selectedStatus === 'PENDING' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      Pending
    </button>
    <button
      onclick={() => (selectedStatus = 'APPROVED')}
      class="px-4 py-2 rounded-lg transition-colors {selectedStatus === 'APPROVED' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      Approved
    </button>
    <button
      onclick={() => (selectedStatus = 'REJECTED')}
      class="px-4 py-2 rounded-lg transition-colors {selectedStatus === 'REJECTED' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      Rejected
    </button>
  </div>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-50 text-red-700 rounded-xl">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="mb-4 p-3 bg-green-50 text-green-700 rounded-xl">{successMessage}</div>
  {/if}

  {#if isLoading}
    <div class="text-center py-12 text-gray-500">Загрузка...</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 text-sm text-gray-600">
          Всего: {suggestions.length}
        </div>
        <div class="divide-y divide-gray-100 max-h-[70vh] overflow-auto">
          {#each suggestions as s (s.id)}
            <button
              class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors {selectedId === s.id ? 'bg-indigo-50' : ''}"
              onclick={() => (selectedId = s.id)}
            >
              <div class="font-medium text-gray-800 line-clamp-2">{s.questionText}</div>
              <div class="text-xs text-gray-500 mt-1">
                {new Date(s.createdAt).toLocaleString('ru-RU')}
              </div>
            </button>
          {/each}
        </div>
      </div>

      <div class="lg:col-span-2">
        {#if !selected}
          <div class="bg-white rounded-2xl shadow-xl p-6 text-gray-600">
            Выберите предложение слева
          </div>
        {:else}
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-lg font-bold text-gray-800">{selected.questionText}</div>
                <div class="text-sm text-gray-600 mt-1">
                  {selected.country ? `Страна: ${selected.country}` : ''}
                  {selected.city ? ` Город: ${selected.city}` : ''}
                </div>
                <div class="text-sm text-gray-500 mt-2">
                  {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                </div>
                {#if selected.createdQuestionId}
                  <div class="text-sm text-green-700 mt-2">
                    Добавлено в пул вопросов: {selected.createdQuestionId}
                  </div>
                {/if}
              </div>
              <div class="text-sm text-gray-500">{selected.status}</div>
            </div>

            <div class="mt-4 h-[360px] rounded-xl overflow-hidden">
              <GameMap
                onMapClick={undefined}
                clickedMarker={null}
                correctMarker={{ lat: selected.lat, lng: selected.lng }}
                showLine={false}
                disabled={false}
                countryBorder={null}
                hideLabels={false}
              />
            </div>

            <div class="mt-4">
              <label for="admin-note" class="block text-sm font-medium text-gray-700 mb-2">Admin note</label>
              <textarea
                id="admin-note"
                bind:value={adminNote}
                rows={3}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              ></textarea>
            </div>

            <div class="mt-4">
              <label for="approve-category" class="block text-sm font-medium text-gray-700 mb-2">Категория при добавлении</label>
              <select
                id="approve-category"
                bind:value={approveCategory}
                disabled={selected.status !== 'PENDING'}
                class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="CAPITAL">Столица</option>
                <option value="LANDMARK">Достопримечательность</option>
                <option value="CITY">Город</option>
                <option value="COUNTRY">Страна</option>
              </select>
            </div>

            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onclick={() => act('APPROVE')}
                disabled={isActing || selected.status !== 'PENDING'}
                class="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                ✅ Approve
              </button>
              <button
                onclick={() => act('REJECT')}
                disabled={isActing || selected.status !== 'PENDING'}
                class="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
