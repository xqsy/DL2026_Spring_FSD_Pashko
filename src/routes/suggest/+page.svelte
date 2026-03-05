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
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold text-gray-800">✍️ Предложить вопрос</h1>
    <button
      onclick={() => goto('/')}
      class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
    >
      ← На главную
    </button>
  </div>

  {#if submittedId}
    <div class="bg-white rounded-2xl shadow-xl p-6">
      <div class="text-4xl mb-2">✅</div>
      <div class="text-lg font-bold text-gray-800">Спасибо!</div>
      <div class="text-gray-600 mt-2">Предложение отправлено на модерацию.</div>
      <div class="text-sm text-gray-400 mt-2">ID: {submittedId}</div>
      <div class="mt-6 flex gap-3">
        <button
          onclick={() => {
            submittedId = null;
            questionText = '';
            country = '';
            city = '';
            picked = null;
          }}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Отправить ещё
        </button>
        <button
          onclick={() => goto('/')}
          class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          В меню
        </button>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-xl p-6">
        <label for="suggest-question-text" class="block text-sm font-medium text-gray-700 mb-2">Текст вопроса</label>
        <textarea
          id="suggest-question-text"
          bind:value={questionText}
          rows={4}
          class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Например: Где находится Рига?"
        ></textarea>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="suggest-country" class="block text-sm font-medium text-gray-700 mb-2">Страна (опционально)</label>
            <input
              id="suggest-country"
              bind:value={country}
              class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Латвия"
            />
          </div>
          <div>
            <label for="suggest-city" class="block text-sm font-medium text-gray-700 mb-2">Город (опционально)</label>
            <input
              id="suggest-city"
              bind:value={city}
              class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Рига"
            />
          </div>
        </div>

        <div class="mt-4 text-sm text-gray-600">
          {#if picked}
            Выбрано: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
          {:else}
            Выберите точку на карте справа
          {/if}
        </div>

        {#if errorMessage}
          <div class="mt-4 p-3 bg-red-50 text-red-700 rounded-xl">{errorMessage}</div>
        {/if}

        <button
          onclick={submit}
          disabled={isSubmitting}
          class="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-4">
        <div class="h-[420px] rounded-xl overflow-hidden">
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
        <div class="text-xs text-gray-500 mt-3">
          Кликни по карте, чтобы поставить точку.
        </div>
      </div>
    </div>
  {/if}
</div>
