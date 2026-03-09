<script lang="ts">
  interface Props {
    current: number;
    total: number;
  }

  let { current, total }: Props = $props();

  const percentage = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

{#if total > 0}
  <div class="w-full bg-theme-card-hover h-1 overflow-hidden relative">
    <div
      class="h-full bg-theme-text-strong transition-all duration-500 ease-out absolute left-0 top-0"
      style="width: {percentage}%"
    ></div>
  </div>
{/if}
