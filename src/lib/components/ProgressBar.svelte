<script lang="ts">
  interface Props {
    current: number;
    total: number;
  }

  let { current, total }: Props = $props();

  const percentage = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

{#if total > 0}
  <div class="w-full theme-surface-subtle rounded-full h-2.5 overflow-hidden border theme-border">
    <div
      class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out relative"
      style="width: {percentage}%"
    >
      <div class="absolute inset-0 animate-shimmer"></div>
    </div>
  </div>
  <div class="flex justify-between text-xs theme-soft mt-1.5 font-medium">
    <span>{current} / {total}</span>
    <span class="text-teal-400/70">{percentage}%</span>
  </div>
{/if}
