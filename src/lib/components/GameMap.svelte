<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { countriesGeoJSON } from '$lib/utils/countryGeoJSON';

  interface Props {
    onMapClick?: (lat: number, lng: number) => void;
    correctMarker?: { lat: number; lng: number } | null;
    clickedMarker?: { lat: number; lng: number } | null;
    showLine?: boolean;
    disabled?: boolean;
    countryName?: string | null;
  }

  let {
    onMapClick,
    correctMarker = null,
    clickedMarker = null,
    showLine = false,
    disabled = false,
    countryName = null
  }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let clickedMarkerLayer: L.Marker | null = null;
  let correctMarkerLayer: L.Marker | null = null;
  let lineLayer: L.Polyline | null = null;
  let borderLayer: L.GeoJSON | null = null;

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
    const cn = countryName;

    // Update clicked marker
    if (clickedMarkerLayer) {
      map.removeLayer(clickedMarkerLayer);
      clickedMarkerLayer = null;
    }
    if (cm) {
      const blueIcon = L.divIcon({
        className: 'custom-marker clicked',
        html: '<div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 4px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:white;border-radius:50%;"></div></div>',
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
        html: '<div style="width:32px;height:32px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 4px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:14px;">&#10003;</span></div>',
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

    // Update country border
    if (borderLayer) {
      map.removeLayer(borderLayer);
      borderLayer = null;
    }
    if (cn && countriesGeoJSON[cn]) {
      borderLayer = L.geoJSON(countriesGeoJSON[cn], {
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
