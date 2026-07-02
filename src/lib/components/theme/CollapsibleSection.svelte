<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'

    let {
        label,
        open = false,
        children,
    }: {
        label: string
        open?: boolean
        children?: import('svelte').Snippet
    } = $props()

    let t = $derived(planner.theme)

    let hovered = $state(false)
    let headerEl: HTMLDivElement | undefined = $state()

    $effect(() => {
        if (open && headerEl) {
            headerEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })
</script>

<div class="flex flex-col gap-0">
    <div
        bind:this={headerEl}
        class="flex items-center gap-1 cursor-pointer select-none rounded px-1.5 transition-colors"
        style="color: {t.textSecondary}; line-height: 1; padding-top: 5px; padding-bottom: 5px; background: {hovered
            ? t.contextHover
            : 'transparent'};"
        onclick={() => (open = !open)}
        role="button"
        tabindex="0"
        aria-expanded={open}
        onkeydown={(e) => e.key === 'Enter' && (open = !open)}
        onmouseenter={() => (hovered = true)}
        onmouseleave={() => (hovered = false)}
    >
        <span
            class="text-[9px] transition-transform shrink-0 leading-none"
            style="transform: rotate({open ? 90 : 0}deg);">▶</span
        >
        <span class="text-xs font-semibold leading-tight" style="color: {t.text};">{label}</span>
    </div>
    {#if open}
        <div class="flex flex-col gap-1.5 ml-3">
            {@render children?.()}
        </div>
    {/if}
</div>
