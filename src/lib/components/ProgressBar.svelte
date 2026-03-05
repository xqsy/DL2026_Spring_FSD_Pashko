<script lang="ts">
  interface Props {
    current: number;
    total: number;
  }

  let { current, total }: Props = $props();

  const percentage = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

{#if total > 0}
  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
      style="width: {percentage}%"
    ></div>
  </div>
  <div class="flex justify-between text-sm text-gray-500 mt-1">
    <span>{current} / {total}</span>
    <span>{percentage}%</span>
  </div>
{/if}
