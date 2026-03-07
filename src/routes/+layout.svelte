<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>GeoHoot - Географическая викторина</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-navy-950 text-white geo-grid relative overflow-hidden">
	<!-- Ambient glow orbs -->
	<div class="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
	<div class="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
	<div class="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none"></div>

	<div class="relative z-10">
		{@render children()}
	</div>
</div>
