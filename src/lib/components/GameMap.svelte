<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    onMapClick?: (lat: number, lng: number) => void;
    correctMarker?: { lat: number; lng: number } | null;
    clickedMarker?: { lat: number; lng: number } | null;
    showLine?: boolean;
    disabled?: boolean;
  }

  let {
    onMapClick,
    correctMarker = null,
    clickedMarker = null,
    showLine = false,
    disabled = false
  }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let clickedMarkerLayer: L.Marker | null = null;
  let correctMarkerLayer: L.Marker | null = null;
  let lineLayer: L.Polyline | null = null;

  let L: typeof import('leaflet');

  onMount(async () => {
    if (!browser) return;

    L = await import('leaflet');

    map = L.map(mapContainer, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabled || !onMapClick) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    });
  });

  $effect(() => {
    if (!map || !L) return;

    // Track dependencies explicitly
    const cm = clickedMarker;
    const com = correctMarker;
    const sl = showLine;

    // Update clicked marker
    if (clickedMarkerLayer) {
      map.removeLayer(clickedMarkerLayer);
      clickedMarkerLayer = null;
    }
    if (cm) {
      const blueIcon = L.divIcon({
        className: 'custom-marker clicked',
        html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      clickedMarkerLayer = L.marker([cm.lat, cm.lng], { icon: blueIcon }).addTo(map);
    }

    // Update correct marker
    if (correctMarkerLayer) {
      map.removeLayer(correctMarkerLayer);
      correctMarkerLayer = null;
    }
    if (com) {
      const greenIcon = L.divIcon({
        className: 'custom-marker correct',
        html: '<div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><span class="text-white text-sm">✓</span></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      correctMarkerLayer = L.marker([com.lat, com.lng], { icon: greenIcon }).addTo(map);
    }

    // Update line
    if (lineLayer) {
      map.removeLayer(lineLayer);
      lineLayer = null;
    }
    if (sl && cm && com) {
      lineLayer = L.polyline(
        [
          [cm.lat, cm.lng],
          [com.lat, com.lng],
        ],
        { color: '#ef4444', weight: 3, dashArray: '10, 10' }
      ).addTo(map);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="relative w-full h-full">
  <div bind:this={mapContainer} class="w-full h-full rounded-xl overflow-hidden shadow-lg"></div>
  {#if disabled}
    <div class="absolute inset-0 bg-transparent cursor-not-allowed"></div>
  {/if}
</div>

<style>
  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }
</style>
