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

<div class="glass rounded-xl p-6 mb-4">
  <div class="flex items-center justify-between mb-4">
    {#if totalQuestions && questionNumber}
      <span class="text-sm font-semibold text-teal-400">
        Вопрос {questionNumber} из {totalQuestions}
      </span>
    {:else}
      <span></span>
    {/if}
    {#if category}
      <span class="badge-teal">
        {categoryLabels[category] || category}
      </span>
    {/if}
  </div>
  <h2 class="text-2xl font-bold theme-heading leading-snug">
    {text}
  </h2>
</div>
