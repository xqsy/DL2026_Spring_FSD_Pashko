<script lang="ts">
  interface Entry {
    id: string;
    playerName: string;
    score: number;
    mode: string;
    category: string | null;
    createdAt: string;
  }

  interface Props {
    entries: Entry[];
    title?: string;
  }

  let { entries, title = 'Таблица лидеров' }: Props = $props();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };
</script>

<div class="glass rounded-xl overflow-hidden">
  <div class="px-6 py-4 border-b theme-border flex items-center gap-3">
    <svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <h3 class="text-lg font-bold theme-heading">{title}</h3>
  </div>
  
  {#if entries.length === 0}
    <div class="p-8 text-center theme-soft">
      Пока нет результатов
    </div>
  {:else}
    <div class="divide-y theme-border">
      {#each entries as entry, i (entry.id)}
        <div class="flex items-center px-6 py-4 hover:bg-white/5 transition-colors {i < 3 ? 'theme-surface-subtle' : ''}">
          <div class="w-8 text-center font-bold">
            {#if i === 0}
              <span class="text-xl">🥇</span>
            {:else if i === 1}
              <span class="text-xl">🥈</span>
            {:else if i === 2}
              <span class="text-xl">🥉</span>
            {:else}
              <span class="theme-soft">{i + 1}</span>
            {/if}
          </div>
          <div class="flex-1 ml-4">
            <div class="font-semibold {i === 0 ? 'text-amber-300' : 'theme-heading'}">{entry.playerName}</div>
            <div class="text-xs theme-soft">{formatDate(entry.createdAt)}</div>
          </div>
          <div class="text-lg font-bold {i === 0 ? 'text-amber-300 text-glow-amber' : i < 3 ? 'text-teal-300' : 'text-teal-400/70'}">
            {entry.score}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
