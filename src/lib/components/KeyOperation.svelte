<script lang="ts">
    import type { KeyOperation, Theme } from '$lib/types'
    import { MODE_LABELS } from '$lib/data/labels'
    import KeyIcon from './KeyIcon.svelte'

    let {
        op,
        theme,
        draggable = false,
    }: {
        op: KeyOperation
        theme: Theme
        draggable?: boolean
    } = $props()

    let modeColors = $derived(theme.modeColors)

    function showModeLabel(): boolean {
        if (op.key === 'LMB' && op.mode === 'hold') return false
        return op.mode !== 'click'
    }
</script>

{#if op.mode === 'click'}
    <KeyIcon key={op.key} size="sm" color={theme.nodeColors[op.key]} />
{:else if showModeLabel()}
    <div
        class="inline-flex items-center rounded-sm"
        style="border: 1px solid {modeColors[
            op.mode
        ]}; background: transparent; gap: 2px; padding: 1px 2px 1px 3px; height: 20px;"
        class:cursor-grab={draggable}
        {draggable}
    >
        <span
            class="text-[10px] font-bold leading-none"
            style="color: {modeColors[op.mode]};"
        >
            {MODE_LABELS[op.mode]}
        </span>
        <KeyIcon
            key={op.key}
            size="sm"
            color={theme.nodeColors[op.key]}
            mode={op.mode}
        />
    </div>
{:else}
    <div
        class="inline-flex items-center rounded-sm"
        style="border: 1px solid {modeColors[
            op.mode
        ]}; background: transparent; gap: 2px; padding: 1px 2px 1px 3px; height: 20px;"
        class:cursor-grab={draggable}
        {draggable}
    >
        <KeyIcon
            key={op.key}
            size="sm"
            color={theme.nodeColors[op.key]}
            mode={op.mode}
        />
    </div>
{/if}
