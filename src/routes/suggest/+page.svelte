<script lang="ts">
  import { goto } from '$app/navigation';
  import GameMap from '$lib/components/GameMap.svelte';

  let questionText = $state('');
  let country = $state('');
  let city = $state('');

  let picked = $state<{ lat: number; lng: number } | null>(null);
  let isSubmitting = $state(false);
  let submittedId = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);

  async function submit() {
    if (isSubmitting) return;
    if (!questionText.trim()) {
      errorMessage = 'Введите текст вопроса';
      return;
    }
    if (!picked) {
      errorMessage = 'Поставьте точку на карте';
      return;
    }

    isSubmitting = true;
    errorMessage = null;

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: questionText.trim(),
          lat: picked.lat,
          lng: picked.lng,
          country: country.trim() || null,
          city: city.trim() || null,
        }),
      });

      const jsonBody = await res.json().catch(() => null);
      if (!res.ok) throw new Error(jsonBody?.error || `Ошибка: ${res.status}`);

      submittedId = jsonBody.id;
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось отправить предложение';
    } finally {
      isSubmitting = false;
    }
  }

  const onMapClick = (lat: number, lng: number) => {
    picked = { lat, lng };
  };
</script>

<svelte:head>
  <title>Предложить вопрос - GeoHoot</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black text-white flex items-center gap-3">
      <svg class="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      Предложить вопрос
    </h1>
    <button
      onclick={() => goto('/')}
      class="btn-secondary text-sm py-2 px-4"
    >
      ← На главную
    </button>
  </div>

  {#if submittedId}
    <div class="glass rounded-2xl p-8 glow-emerald animate-slide-up">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div class="text-lg font-bold text-white text-center">Спасибо!</div>
      <div class="text-slate-400 mt-2 text-center text-sm">Предложение отправлено на модерацию.</div>
      <div class="text-xs text-slate-600 mt-2 text-center font-mono">ID: {submittedId}</div>
      <div class="mt-6 flex gap-3 justify-center">
        <button
          onclick={() => {
            submittedId = null;
            questionText = '';
            country = '';
            city = '';
            picked = null;
          }}
          class="btn-secondary text-sm"
        >
          Отправить ещё
        </button>
        <button
          onclick={() => goto('/')}
          class="btn-primary text-sm"
        >
          В меню
        </button>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass rounded-2xl p-6">
        <label for="suggest-question-text" class="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Текст вопроса</label>
        <textarea
          id="suggest-question-text"
          bind:value={questionText}
          rows={4}
          class="w-full input-dark resize-none"
          placeholder="Например: Где находится Рига?"
        ></textarea>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="suggest-country" class="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Страна <span class="text-slate-600 normal-case">(опц.)</span></label>
            <input
              id="suggest-country"
              bind:value={country}
              class="w-full input-dark"
              placeholder="Латвия"
            />
          </div>
          <div>
            <label for="suggest-city" class="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Город <span class="text-slate-600 normal-case">(опц.)</span></label>
            <input
              id="suggest-city"
              bind:value={city}
              class="w-full input-dark"
              placeholder="Рига"
            />
          </div>
        </div>

        <div class="mt-4 text-sm">
          {#if picked}
            <span class="text-teal-300 flex items-center gap-2">
              <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </span>
          {:else}
            <span class="text-slate-500">Выберите точку на карте →</span>
          {/if}
        </div>

        {#if errorMessage}
          <div class="mt-4 p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-sm">{errorMessage}</div>
        {/if}

        <button
          onclick={submit}
          disabled={isSubmitting}
          class="mt-6 w-full py-3 btn-primary"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
        </button>
      </div>

      <div class="glass rounded-2xl p-4">
        <div class="h-[420px] rounded-xl overflow-hidden border border-white/10">
          <GameMap
            onMapClick={onMapClick}
            clickedMarker={picked}
            correctMarker={null}
            showLine={false}
            disabled={false}
            countryBorder={null}
            hideLabels={false}
          />
        </div>
        <div class="text-xs text-slate-500 mt-3">
          Кликни по карте, чтобы поставить точку.
        </div>
      </div>
    </div>
  {/if}
</div>
