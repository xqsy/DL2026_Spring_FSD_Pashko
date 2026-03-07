<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    onMapClick?: (lat: number, lng: number) => void;
    correctMarker?: { lat: number; lng: number } | null;
    clickedMarker?: { lat: number; lng: number } | null;
    showLine?: boolean;
    showCorrectMarker?: boolean;
    disabled?: boolean;
    countryBorder?: GeoJSON.Feature | null;
    hideLabels?: boolean;
  }

  let {
    onMapClick,
    correctMarker = null,
    clickedMarker = null,
    showLine = false,
    showCorrectMarker = true,
    disabled = false,
    countryBorder = null,
    hideLabels = false
  }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let tileLayer: L.TileLayer | null = null;
  let tileLayerKey: 'labels' | 'nolabels' | null = null;
  let clickedMarkerLayer: L.CircleMarker | null = null;
  let correctMarkerLayer: L.CircleMarker | null = null;
  let lineLayer: L.Polyline | null = null;
  let borderLayer: L.GeoJSON | null = null;
  let lastCameraAnimationKey: string | null = null;

  let mapReady = $state(false);

  let L: typeof import('leaflet');

  function normalizeLngAroundReference(targetLng: number, referenceLng: number) {
    let normalizedLng = targetLng;

    while (normalizedLng - referenceLng > 180) {
      normalizedLng -= 360;
    }

    while (normalizedLng - referenceLng < -180) {
      normalizedLng += 360;
    }

    return normalizedLng;
  }

  function getRenderableCorrectMarker(
    correct: { lat: number; lng: number },
    clicked: { lat: number; lng: number } | null
  ) {
    const referenceLng = clicked?.lng ?? map?.getCenter().lng ?? correct.lng;

    return {
      lat: correct.lat,
      lng: normalizeLngAroundReference(correct.lng, referenceLng)
    };
  }

  onMount(async () => {
    if (!browser) return;

    L = await import('leaflet');

    map = L.map(mapContainer, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
    });

    // Tile layer is managed reactively in $effect (to support hideLabels changes)

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabled || !onMapClick) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapReady = true;
  });

  $effect(() => {
    if (!mapReady || !map || !L) return;

    // Update tile layer (switch to no-labels tiles for country guessing)
    const hl = hideLabels;
    const nextKey: 'labels' | 'nolabels' = hl ? 'nolabels' : 'labels';

    if (tileLayerKey === nextKey && tileLayer) return;

    if (tileLayer) {
      map.removeLayer(tileLayer);
      tileLayer = null;
    }

    if (nextKey === 'nolabels') {
      tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);
    } else {
      tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    }

    tileLayerKey = nextKey;
  });

  $effect(() => {
    if (!mapReady || !map || !L) return;

    // Track dependencies explicitly
    const cm = clickedMarker;
    const com = correctMarker;
    const sl = showLine;
    const scm = showCorrectMarker;
    const cb = countryBorder;
    const dis = disabled;
    const renderableCorrectMarker = com ? getRenderableCorrectMarker(com, cm) : null;

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
    if (renderableCorrectMarker && scm) {
      correctMarkerLayer = L.circleMarker([renderableCorrectMarker.lat, renderableCorrectMarker.lng], {
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
    if (sl && cm && renderableCorrectMarker) {
      lineLayer = L.polyline(
        [
          [cm.lat, cm.lng],
          [renderableCorrectMarker.lat, renderableCorrectMarker.lng],
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

  $effect(() => {
    if (!mapReady || !map || !L) return;

    const cm = clickedMarker;
    const com = correctMarker;
    const scm = showCorrectMarker;
    const cb = countryBorder;
    const dis = disabled;

    if (!dis || !cm || !com) {
      lastCameraAnimationKey = null;
      return;
    }

    const animationKey = `${cm.lat}:${cm.lng}:${com.lat}:${com.lng}`;
    if (lastCameraAnimationKey === animationKey) return;

    lastCameraAnimationKey = animationKey;

    const clickedLatLng = L.latLng(cm.lat, cm.lng);

    if (!scm && cb && borderLayer) {
      const borderBounds = borderLayer.getBounds();

      if (borderBounds.isValid()) {
        const expandedBounds = borderBounds.extend(clickedLatLng);
        map.flyToBounds(expandedBounds, {
          padding: [48, 48],
          maxZoom: 5,
          animate: true,
          duration: 1.6,
        });
        return;
      }
    }

    const renderableCorrectMarker = getRenderableCorrectMarker(com, cm);
    const correctLatLng = L.latLng(renderableCorrectMarker.lat, renderableCorrectMarker.lng);
    const distanceMeters = clickedLatLng.distanceTo(correctLatLng);
    const isTooFar = distanceMeters > 2500000;

    if (isTooFar) {
      map.flyTo(correctLatLng, 4, {
        animate: true,
        duration: 1.6,
      });
      return;
    }

    const bounds = L.latLngBounds([clickedLatLng, correctLatLng]);
    map.flyToBounds(bounds, {
      padding: [48, 48],
      maxZoom: 6,
      animate: true,
      duration: 1.6,
    });
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
</div>

<style>
  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }
</style>
