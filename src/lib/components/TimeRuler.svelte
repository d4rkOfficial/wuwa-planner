<script lang="ts">
    let {
        totalDuration = 0,
        theme,
    }: { totalDuration: number; theme: import('$lib/types').Theme } = $props()

    let ticks = $derived.by(() => {
        const count = Math.max(10, Math.ceil(totalDuration) + 2)
        return Array.from({ length: count }, (_, i) => i)
    })
</script>

<div class="relative h-5" style="font-family: {theme.fontFamily};">
    <div class="absolute inset-x-0 bottom-0 flex">
        {#each ticks as t}
            <div class="flex-1 text-center">
                <div class="mx-auto h-1.5 w-px bg-zinc-600"></div>
                <span class="text-[9px] text-zinc-500">{t}s</span>
            </div>
        {/each}
    </div>
</div>
