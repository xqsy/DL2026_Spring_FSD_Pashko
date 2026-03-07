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
    if (pts >= 900) return 'text-emerald-400 text-glow-teal';
    if (pts >= 700) return 'text-amber-400 text-glow-amber';
    if (pts >= 400) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreEmoji = (pts: number) => {
    if (pts >= 900) return '🎯';
    if (pts >= 700) return '👍';
    if (pts >= 400) return '🤔';
    return '😅';
  };

  const getGlowClass = (pts: number) => {
    if (pts >= 900) return 'glow-emerald';
    if (pts >= 700) return 'glow-amber';
    return '';
  };
</script>

<div class="glass rounded-xl p-6 text-center {getGlowClass(points)}">
  <div class="text-4xl mb-2 animate-count-up">{getScoreEmoji(points)}</div>
  <div class="text-5xl font-black {getScoreColor(points)} mb-2">
    +{displayPoints}
  </div>
  <div class="theme-muted">
    Расстояние: <span class="theme-text font-semibold">{distanceKm.toFixed(1)} км</span>
  </div>
  <div class="mt-2 text-sm theme-soft">
    Максимум: {maxPoints} очков
  </div>
</div>
