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
      year: 'numeric',
    });
  };
</script>

<div class="border border-theme-border bg-theme-card">
  <div class="px-8 py-6 border-b border-theme-border">
    <h3 class="text-sm font-medium theme-heading tracking-widest uppercase">{title}</h3>
  </div>
  
  {#if entries.length === 0}
    <div class="p-12 text-center theme-muted text-sm tracking-widest uppercase">
      Нет результатов
    </div>
  {:else}
    <div class="divide-y divide-theme-border">
      {#each entries as entry, i (entry.id)}
        <div class="flex items-center px-8 py-5 hover:bg-theme-card-hover transition-colors {i < 3 ? 'bg-theme-card-hover/50' : ''}">
          <div class="w-12 text-sm tracking-widest text-theme-muted">
            {(i + 1).toString().padStart(2, '0')}
          </div>
          <div class="flex-1 ml-4">
            <div class="font-medium text-sm {i === 0 ? 'text-amber-500' : 'theme-heading'}">{entry.playerName}</div>
            <div class="text-xs theme-muted mt-1 uppercase tracking-widest">{formatDate(entry.createdAt)}</div>
          </div>
          <div class="text-lg font-light {i === 0 ? 'text-amber-500' : i < 3 ? 'text-teal-500' : 'theme-text'}">
            {entry.score}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
