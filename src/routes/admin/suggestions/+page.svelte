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
    <h1 class="text-3xl font-black theme-heading">Предложения вопросов</h1>
    <div class="flex gap-2">
      <button
        onclick={() => goto('/admin/questions')}
        class="btn-secondary text-sm py-2 px-4"
      >
        Вопросы
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

  <div class="mb-6 flex gap-2">
    <button
      onclick={() => (selectedStatus = 'PENDING')}
      class="px-4 py-2 rounded-none text-sm font-semibold transition-all {selectedStatus === 'PENDING' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
    >
      Pending
    </button>
    <button
      onclick={() => (selectedStatus = 'APPROVED')}
      class="px-4 py-2 rounded-none text-sm font-semibold transition-all {selectedStatus === 'APPROVED' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
    >
      Approved
    </button>
    <button
      onclick={() => (selectedStatus = 'REJECTED')}
      class="px-4 py-2 rounded-none text-sm font-semibold transition-all {selectedStatus === 'REJECTED' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'theme-inline-surface theme-muted hover:border-teal-500/20'}"
    >
      Rejected
    </button>
  </div>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-500/10 text-red-400 rounded-none border border-red-500/20 text-sm">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="mb-4 p-3 glass-teal text-teal-300 rounded-none text-sm">{successMessage}</div>
  {/if}

  {#if isLoading}
    <div class="text-center py-12 theme-soft">Загрузка...</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="glass rounded-none overflow-hidden">
        <div class="px-4 py-3 border-b theme-border text-sm theme-soft">
          Всего: {suggestions.length}
        </div>
        <div class="divide-y theme-border max-h-[70vh] overflow-auto">
          {#each suggestions as s (s.id)}
            <button
              class="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors {selectedId === s.id ? 'bg-teal-500/10 border-l-2 border-l-teal-400' : ''}"
              onclick={() => (selectedId = s.id)}
            >
              <div class="font-medium theme-text line-clamp-2">{s.questionText}</div>
              <div class="text-xs theme-soft mt-1">
                {new Date(s.createdAt).toLocaleString('ru-RU')}
              </div>
            </button>
          {/each}
        </div>
      </div>

      <div class="lg:col-span-2">
        {#if !selected}
          <div class="glass rounded-none p-6 theme-soft">
            Выберите предложение слева
          </div>
        {:else}
          <div class="glass rounded-none p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-lg font-bold theme-heading">{selected.questionText}</div>
                <div class="text-sm theme-muted mt-1">
                  {selected.country ? `Страна: ${selected.country}` : ''}
                  {selected.city ? ` Город: ${selected.city}` : ''}
                </div>
                <div class="text-sm theme-soft mt-2">
                  {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                </div>
                {#if selected.createdQuestionId}
                  <div class="text-sm text-emerald-400 mt-2">
                    Добавлено в пул вопросов: {selected.createdQuestionId}
                  </div>
                {/if}
              </div>
              <span class="badge-teal">{selected.status}</span>
            </div>

            <div class="mt-4 h-[360px] rounded-none overflow-hidden">
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
              <label for="admin-note" class="block text-sm font-semibold theme-muted mb-2 uppercase tracking-wider">Admin note</label>
              <textarea
                id="admin-note"
                bind:value={adminNote}
                rows={3}
                class="w-full input-dark resize-none"
              ></textarea>
            </div>

            <div class="mt-4">
              <label for="approve-category" class="block text-sm font-semibold theme-muted mb-2 uppercase tracking-wider">Категория при добавлении</label>
              <select
                id="approve-category"
                bind:value={approveCategory}
                disabled={selected.status !== 'PENDING'}
                class="w-full input-dark disabled:opacity-50"
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
                class="flex-1 py-3 btn-success"
              >
                Approve
              </button>
              <button
                onclick={() => act('REJECT')}
                disabled={isActing || selected.status !== 'PENDING'}
                class="flex-1 py-3 rounded-none font-bold text-white bg-gradient-to-r from-red-600 to-red-500 border border-red-500/30 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
