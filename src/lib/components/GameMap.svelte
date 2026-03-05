<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    onMapClick?: (lat: number, lng: number) => void;
    correctMarker?: { lat: number; lng: number } | null;
    clickedMarker?: { lat: number; lng: number } | null;
    showLine?: boolean;
    disabled?: boolean;
    countryBorder?: GeoJSON.Feature | null;
  }

  let {
    onMapClick,
    correctMarker = null,
    clickedMarker = null,
    showLine = false,
    disabled = false,
    countryBorder = null
  }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let clickedMarkerLayer: L.CircleMarker | null = null;
  let correctMarkerLayer: L.CircleMarker | null = null;
  let lineLayer: L.Polyline | null = null;
  let borderLayer: L.GeoJSON | null = null;

  let mapReady = $state(false);

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

    mapReady = true;
  });

  $effect(() => {
    if (!mapReady || !map || !L) return;

    // Track dependencies explicitly
    const cm = clickedMarker;
    const com = correctMarker;
    const sl = showLine;
    const cb = countryBorder;
    const dis = disabled;

    // Update clicked marker
    if (clickedMarkerLayer) {
      map.removeLayer(clickedMarkerLayer);
      clickedMarkerLayer = null;
    }
    if (cm) {
      clickedMarkerLayer = L.circleMarker([cm.lat, cm.lng], {
        radius: 10,
        color: '#ffffff',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 1,
      }).addTo(map);
    }

    // Update correct marker
    if (correctMarkerLayer) {
      map.removeLayer(correctMarkerLayer);
      correctMarkerLayer = null;
    }
    if (com) {
      correctMarkerLayer = L.circleMarker([com.lat, com.lng], {
        radius: 12,
        color: '#ffffff',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 1,
      }).addTo(map);
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

    // Update country border
    if (borderLayer) {
      map.removeLayer(borderLayer);
      borderLayer = null;
    }
    if (dis && cb) {
      borderLayer = L.geoJSON(cb, {
        style: {
          color: '#f59e0b',
          weight: 2,
          fillColor: '#fbbf24',
          fillOpacity: 0.3
        }
      }).addTo(map);
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
