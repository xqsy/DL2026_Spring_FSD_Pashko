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

<div class="bg-white rounded-xl shadow-lg p-6 mb-4">
  <div class="flex items-center justify-between mb-4">
    {#if totalQuestions && questionNumber}
      <span class="text-sm font-medium text-indigo-600">
        Вопрос {questionNumber} из {totalQuestions}
      </span>
    {:else}
      <span></span>
    {/if}
    {#if category}
      <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
        {categoryLabels[category] || category}
      </span>
    {/if}
  </div>
  <h2 class="text-2xl font-bold text-gray-800">
    {text}
  </h2>
</div>
