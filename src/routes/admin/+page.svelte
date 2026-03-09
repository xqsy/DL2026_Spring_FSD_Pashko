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

      sessionStorage.setItem('admin_flash_success', 'Вход выполнен успешно');
      goto('/admin/suggestions');
    } catch (e) {
      console.error(e);
      errorMessage = 'Не удалось выполнить вход';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Admin - GeoHoot</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="glass rounded-none p-8 w-full max-w-md glow-teal animate-slide-up">
    <div class="w-14 h-14 mx-auto mb-4 rounded-none bg-teal-500/15 border border-teal-500/20 flex items-center justify-center">
      <svg class="w-7 h-7 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
    <h1 class="text-2xl font-bold theme-heading mb-1 text-center">Админ вход</h1>
    <p class="theme-muted mb-6 text-sm text-center">Введите код администратора</p>

    <label for="admin-code" class="block text-sm font-semibold theme-muted mb-2 uppercase tracking-wider">Код</label>
    <input
      type="password"
      id="admin-code"
      bind:value={token}
      class="w-full input-dark"
      placeholder="Введите код"
      autocomplete="current-password"
    />

    {#if errorMessage}
      <div class="mt-4 p-3 bg-red-500/10 text-red-400 rounded-none border border-red-500/20 text-sm">{errorMessage}</div>
    {/if}

    <button
      onclick={login}
      disabled={isSubmitting || !token}
      class="mt-6 w-full py-3 btn-primary"
    >
      {isSubmitting ? 'Вход...' : 'Войти'}
    </button>
  </div>
</div>
