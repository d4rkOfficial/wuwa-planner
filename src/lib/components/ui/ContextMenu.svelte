<script lang="ts">
    interface ContextMenuItem {
        label: string
        action: () => void
        disabled?: boolean
        color?: string
    }

    let { x = 0, y = 0, items = [] as ContextMenuItem[], onclose = () => {} } = $props()

    function handleAction(item: ContextMenuItem) {
        if (!item.disabled) {
            item.action()
            onclose()
        }
    }

    $effect(() => {
        if (x === 0 && y === 0) return
        function handleClick() {
            onclose()
        }
        requestAnimationFrame(() => document.addEventListener('click', handleClick, { once: true }))
        return () => document.removeEventListener('click', handleClick)
    })
</script>

{#if x > 0 && y > 0}
    <div
        class="fixed z-50 min-w-36 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl"
        style="left: {x}px; top: {y}px;"
    >
        {#each items as item}
            <button
                class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors disabled:opacity-40 hover:bg-zinc-700"
                disabled={item.disabled}
                onclick={() => handleAction(item)}
            >
                {#if item.color}
                    <span class="h-2 w-2 rounded-full" style="background: {item.color}"></span>
                {/if}
                {item.label}
            </button>
        {/each}
    </div>
{/if}
