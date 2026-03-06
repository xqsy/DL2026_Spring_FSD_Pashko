<script lang="ts">
  import { goto } from '$app/navigation';

  let token = $state('');
  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);

  async function login() {
    if (isSubmitting) return;
    isSubmitting = true;
    errorMessage = null;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Ошибка: ${res.status}`);
      }

      goto('/admin/suggestions');
    } catch (e) {
      console.error(e);
      errorMessage = 'Неверный токен';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Admin - GeoHoot</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4">
  <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">🔐 Админ вход</h1>
    <p class="text-gray-600 mb-6">Введите код администратора</p>

    <label for="admin-code" class="block text-sm font-medium text-gray-700 mb-2">Код</label>
    <input
      type="password"
      id="admin-code"
      bind:value={token}
      class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      placeholder="Введите код"
      autocomplete="current-password"
    />

    {#if errorMessage}
      <div class="mt-4 p-3 bg-red-50 text-red-700 rounded-xl">{errorMessage}</div>
    {/if}

    <button
      onclick={login}
      disabled={isSubmitting || !token}
      class="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
    >
      {isSubmitting ? 'Вход...' : 'Войти'}
    </button>
  </div>
</div>
