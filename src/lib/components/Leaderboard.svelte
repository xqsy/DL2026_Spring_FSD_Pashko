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

<div class="bg-white rounded-xl shadow-lg overflow-hidden">
  <div class="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
    <h3 class="text-xl font-bold text-white">{title}</h3>
  </div>
  
  {#if entries.length === 0}
    <div class="p-6 text-center text-gray-500">
      Пока нет результатов
    </div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each entries as entry, i (entry.id)}
        <div class="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
          <div class="w-8 text-center font-bold text-gray-400">
            {#if i === 0}
              <span class="text-yellow-500">🥇</span>
            {:else if i === 1}
              <span class="text-gray-400">🥈</span>
            {:else if i === 2}
              <span class="text-orange-600">🥉</span>
            {:else}
              {i + 1}
            {/if}
          </div>
          <div class="flex-1 ml-4">
            <div class="font-medium text-gray-800">{entry.playerName}</div>
            <div class="text-sm text-gray-500">{formatDate(entry.createdAt)}</div>
          </div>
          <div class="text-xl font-bold text-indigo-600">
            {entry.score}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
