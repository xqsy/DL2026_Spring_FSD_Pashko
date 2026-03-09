<script lang="ts">
  interface Props {
    text: string;
    category?: string;
    questionNumber?: number;
    totalQuestions?: number;
  }

  let { text, category, questionNumber, totalQuestions }: Props = $props();

  const categoryLabels: Record<string, string> = {
    CAPITAL: 'Столица',
    LANDMARK: 'Достопримечательность',
    CITY: 'Город',
    COUNTRY: 'Страна',
  };
</script>

<div class="border border-theme-border p-8 bg-theme-card">
  <div class="flex items-center justify-between mb-6 pb-4 border-b border-theme-border">
    {#if totalQuestions && questionNumber}
      <span class="text-xs tracking-widest uppercase font-medium theme-muted">
        {questionNumber} / {totalQuestions}
      </span>
    {:else}
      <span></span>
    {/if}
    {#if category}
      <span class="text-xs tracking-widest uppercase font-medium text-teal-500">
        {categoryLabels[category] || category}
      </span>
    {/if}
  </div>
  <h2 class="text-xl md:text-2xl font-medium theme-heading leading-relaxed">
    {text}
  </h2>
</div>
