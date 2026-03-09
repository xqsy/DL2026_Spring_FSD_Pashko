<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme';

	let { children } = $props();
	let currentTheme = $state<'dark' | 'light'>('dark');

	$effect(() => {
		const unsubscribe = theme.subscribe((value) => {
			currentTheme = value;
		});

		return () => unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>GeoHoot - Географическая викторина</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="theme-shell min-h-screen geo-grid relative overflow-hidden transition-colors duration-300">
	<div class="fixed top-6 right-6 z-30">
		<button
			type="button"
			onclick={() => theme.toggleTheme()}
			class="theme-toggle flex items-center justify-center w-10 h-10 border border-theme-border rounded-none transition-all duration-200 hover:bg-theme-card"
			aria-label={currentTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
		>
			<span class="text-sm">{currentTheme === 'dark' ? 'О' : 'I'}</span>
		</button>
	</div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		{@render children()}
	</div>
</div>
