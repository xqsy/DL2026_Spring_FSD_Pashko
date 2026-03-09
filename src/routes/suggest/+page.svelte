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

<div class="container mx-auto px-4 py-12 max-w-6xl">
  <!-- Header -->
  <header class="flex items-center justify-between mb-12 border-b border-theme-border pb-6">
    <h1 class="text-2xl font-semibold tracking-tight theme-heading uppercase">
      Предложить
    </h1>
    <button
      onclick={() => goto('/')}
      class="btn-secondary text-xs py-2 px-4"
    >
      На главную
    </button>
  </header>

  {#if submittedId}
    <div class="theme-panel p-12 max-w-2xl mx-auto text-center border-x-0 sm:border-x">
      <div class="text-sm tracking-widest uppercase text-teal-500 mb-6">Успешно</div>
      <h2 class="text-2xl font-light theme-heading mb-4">Вопрос отправлен</h2>
      <p class="theme-muted text-sm mb-8">Спасибо за помощь в развитии игры. Ваш вопрос будет проверен модераторами.</p>
      
      <div class="text-xs theme-soft font-mono mb-12 p-4 border border-theme-border bg-theme-bg">
        ID: {submittedId}
      </div>
      
      <div class="flex gap-4 justify-center">
        <button
          onclick={() => {
            submittedId = null;
            questionText = '';
            country = '';
            city = '';
            picked = null;
          }}
          class="px-6 py-3 border border-theme-border hover:bg-theme-card-hover transition-colors text-xs uppercase tracking-widest"
        >
          Отправить еще
        </button>
        <button
          onclick={() => goto('/')}
          class="px-6 py-3 btn-primary text-xs"
        >
          В меню
        </button>
      </div>
    </div>
  {:else}
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Form Column -->
      <div class="lg:w-1/3 flex flex-col gap-6">
        <div class="theme-panel p-8 border-x-0 sm:border-x h-full flex flex-col">
          <div class="mb-6">
            <label for="suggest-question-text" class="block text-xs font-medium theme-muted mb-3 uppercase tracking-widest">
              Текст вопроса
            </label>
            <textarea
              id="suggest-question-text"
              bind:value={questionText}
              rows={4}
              class="w-full input-dark resize-none bg-theme-bg"
              placeholder="Например: Где находится Рига?"
            ></textarea>
          </div>

          <div class="space-y-6 flex-1">
            <div>
              <label for="suggest-country" class="block text-xs font-medium theme-muted mb-3 uppercase tracking-widest">
                Страна <span class="theme-soft normal-case">(опц.)</span>
              </label>
              <input
                id="suggest-country"
                bind:value={country}
                class="w-full input-dark bg-theme-bg"
                placeholder="Например: Латвия"
              />
            </div>
            <div>
              <label for="suggest-city" class="block text-xs font-medium theme-muted mb-3 uppercase tracking-widest">
                Город <span class="theme-soft normal-case">(опц.)</span>
              </label>
              <input
                id="suggest-city"
                bind:value={city}
                class="w-full input-dark bg-theme-bg"
                placeholder="Например: Рига"
              />
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-theme-border">
            <div class="text-xs uppercase tracking-widest mb-6">
              {#if picked}
                <span class="text-teal-500 flex items-center gap-2">
                  <div class="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  {picked.lat.toFixed(4)}, {picked.lng.toFixed(4)}
                </span>
              {:else}
                <span class="theme-muted">Метка не установлена</span>
              {/if}
            </div>

            {#if errorMessage}
              <div class="mb-6 p-4 border border-red-500 text-red-500 text-xs uppercase tracking-widest">
                {errorMessage}
              </div>
            {/if}

            <button
              onclick={submit}
              disabled={isSubmitting}
              class="w-full py-4 btn-primary text-xs"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      </div>

      <!-- Map Column -->
      <div class="lg:w-2/3 h-[500px] lg:h-auto min-h-[500px] border border-theme-border relative">
        <GameMap
          onMapClick={onMapClick}
          clickedMarker={picked}
          correctMarker={null}
          showLine={false}
          disabled={false}
          countryBorder={null}
          hideLabels={false}
        />
        <div class="absolute bottom-4 right-4 bg-theme-bg px-4 py-2 border border-theme-border text-xs uppercase tracking-widest theme-muted pointer-events-none">
          Кликните для установки метки
        </div>
      </div>
    </div>
  {/if}
</div>
