<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'

    let {
        size = 12,
        color,
    }: {
        size?: number
        color?: string
    } = $props()

    let resolvedColor = $derived(color ?? '#ef4444')
    let bg = $derived(resolvedColor + '22')
    let fontSize = $derived(Math.max(9, size - 2))
    let iconUrl = $derived(planner.theme.strongBadgeIcon)
</script>

{#if iconUrl}
    <div
        class="inline-flex items-center justify-center rounded shrink-0 overflow-hidden"
        style="width: {size}px; height: {size}px;"
    >
        <img src={iconUrl} alt="强" class="h-full w-full object-contain" />
    </div>
{:else}
    <div
        class="inline-flex items-center justify-center rounded font-bold leading-none shrink-0"
        style="border: 1px solid {resolvedColor}; background: {bg}; width: {size}px; height: {size}px; font-size: {fontSize}px; color: {resolvedColor};"
    >
        强
    </div>
{/if}
