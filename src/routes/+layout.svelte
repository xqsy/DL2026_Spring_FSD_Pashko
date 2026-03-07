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
	<!-- Ambient glow orbs -->
	<div class="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
	<div class="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
	<div class="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none"></div>

	<div class="fixed top-4 right-4 z-30">
		<button
			type="button"
			onclick={() => theme.toggleTheme()}
			class="theme-toggle flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
			aria-label={currentTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
		>
			<span class="text-lg leading-none">{currentTheme === 'dark' ? '☀️' : '🌙'}</span>
			<span>{currentTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
		</button>
	</div>

	<div class="relative z-10">
		{@render children()}
	</div>
</div>
