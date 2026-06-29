<script lang="ts">
    import type { KeyOperation, Theme } from '$lib/types'
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

    const modeLabels: Record<string, string> = {
        click: '',
        hold: '长按',
        preinput_swap: '预↔',
        preinput_action: '预→',
        rapid_click: '连击',
    }

    const modeColors = $derived(theme.modeColors)

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
            {modeLabels[op.mode]}
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
