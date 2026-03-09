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
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(animate);
    } else {
      displayPoints = pts;
    }
  });

  const getScoreColor = (pts: number) => {
    if (pts >= 900) return 'text-teal-500';
    if (pts >= 700) return 'text-amber-500';
    if (pts >= 400) return 'text-orange-500';
    return 'text-red-500';
  };
</script>

<div class="border border-theme-border p-8 bg-theme-card text-center">
  <div class="text-sm tracking-widest uppercase theme-muted mb-6">Результат</div>
  
  <div class="text-5xl md:text-6xl font-light {getScoreColor(points)} mb-8">
    +{displayPoints}
  </div>
  
  <div class="grid grid-cols-2 gap-4 text-xs tracking-widest uppercase border-t border-theme-border pt-6">
    <div class="flex flex-col gap-2">
      <span class="theme-muted">Расстояние</span>
      <span class="theme-text">{distanceKm.toFixed(1)} км</span>
    </div>
    <div class="flex flex-col gap-2">
      <span class="theme-muted">Максимум</span>
      <span class="theme-text">{maxPoints}</span>
    </div>
  </div>
</div>
