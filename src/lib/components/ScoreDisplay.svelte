<script lang="ts">
  import { onDestroy } from 'svelte';

  interface Props {
    points: number;
    distanceKm: number;
    maxPoints?: number;
    showAnimation?: boolean;
  }

  let { points, distanceKm, maxPoints = 1000, showAnimation = true }: Props = $props();

  let displayPoints = $state(0);
  let hasAnimated = $state(false);
  let rafId: number | null = null;

  onDestroy(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });

  $effect(() => {
    const pts = points;
    const animateEnabled = showAnimation;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    hasAnimated = false;

    if (animateEnabled) {
      const duration = 1000;
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        displayPoints = Math.floor(progress * pts);
        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          displayPoints = pts;
          hasAnimated = true;
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(animate);
    } else {
      displayPoints = pts;
    }
  });

  const getScoreColor = (pts: number) => {
    if (pts >= 900) return 'text-green-600';
    if (pts >= 700) return 'text-yellow-600';
    if (pts >= 400) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (pts: number) => {
    if (pts >= 900) return '🎯';
    if (pts >= 700) return '👍';
    if (pts >= 400) return '🤔';
    return '😅';
  };
</script>

<div class="bg-white rounded-xl shadow-lg p-6 text-center">
  <div class="text-4xl mb-2">{getScoreEmoji(points)}</div>
  <div class="text-5xl font-bold {getScoreColor(points)} mb-2">
    +{displayPoints}
  </div>
  <div class="text-gray-500">
    Расстояние: {distanceKm.toFixed(1)} км
  </div>
  <div class="mt-2 text-sm text-gray-400">
    Максимум: {maxPoints} очков
  </div>
</div>
