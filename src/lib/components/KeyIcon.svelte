<script lang="ts">
    import type { KeyType, KeyMode } from '$lib/types'
    import { KEY_LABELS } from '$lib/data/labels'
    import { planner } from '$lib/stores/planner.svelte'

    let {
        key,
        size = 'sm',
        color,
        mode,
    }: {
        key: KeyType
        size?: 'xs' | 'sm' | 'md' | 'lg'
        color?: string
        mode?: KeyMode
    } = $props()

    const sizes = {
        xs: 'w-3.5 h-3.5',
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-9 h-9',
    }

    let isHold = $derived(mode === 'hold')
    let isPreinput = $derived(
        mode === 'preinput_swap' || mode === 'preinput_action',
    )

    let imgName = $derived.by(() => {
        if (key === 'LMB' && (isHold || isPreinput)) return 'lmb_hold'
        const lower = key.toLowerCase()
        return lower === 'z' ? 'z' : lower
    })

    let imgPath = $derived(`${planner.theme.keyIconPath}${imgName}.svg`)
    let imgFailed = $state(false)
</script>

<div class="{sizes[size]} inline-flex items-center justify-center" title={key}>
    {#if !imgFailed}
        <img
            src={imgPath}
            alt={key}
            class="h-full w-full object-contain"
            style={color ? `filter: none;` : ''}
            onerror={() => (imgFailed = true)}
        />
    {:else}
        <span class="text-xs font-bold" style="color: {color ?? '#555'};">
            {KEY_LABELS[key] ?? key}
        </span>
    {/if}
</div>
