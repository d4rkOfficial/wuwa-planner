<script lang="ts">
	import { planner } from '$lib/stores/planner.svelte';

	let { open = false, title = '', onclose = () => {}, children }: {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children?: import('svelte').Snippet;
	} = $props();

	let t = $derived(planner.theme);

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		style="background: {t.overlayBackdrop};"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="min-w-80 max-w-lg rounded-lg shadow-2xl" style="border: 1px solid {t.modalBorder}; background: {t.modalBg};">
			{#if title}
				<div class="flex items-center justify-between px-4 py-3" style="border-bottom: 1px solid {t.border};">
					<h3 class="text-sm font-semibold" style="color: {t.text};">{title}</h3>
					<button class="transition-colors" style="color: {t.textSecondary};"
						onmouseenter={e => (e.currentTarget as HTMLElement).style.color = t.text}
						onmouseleave={e => (e.currentTarget as HTMLElement).style.color = t.textSecondary}
						onclick={onclose}>✕</button>
				</div>
			{/if}
			<div class="p-4">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
