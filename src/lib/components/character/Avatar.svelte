<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'

    let {
        presetId,
        name,
        size = 'md',
        fillContainer = false,
    }: {
        presetId: string | null
        name: string
        size?: 'sm' | 'md' | 'lg'
        fillContainer?: boolean
    } = $props()

    const sizeMap: Record<string, string> = {
        sm: 'h-6 w-6 text-[10px]',
        md: 'h-8 w-8 text-sm',
        lg: 'h-10 w-10 text-lg',
    }
    let imgFailed = $state(false)

    let src = $derived.by(() => {
        if (!presetId) return null
        const overrides = planner.theme.avatarOverrides
        if (overrides?.[presetId]) return overrides[presetId]
        return `/images/avatars/${presetId}.png`
    })

    let outerClass = $derived(
        fillContainer
            ? 'relative h-full w-full overflow-hidden'
            : `relative ${sizeMap[size]} shrink-0 overflow-hidden rounded-full`,
    )
</script>

<div class={outerClass}>
    {#if src && !imgFailed}
        <img
            {src}
            alt={name}
            class="absolute inset-0 h-full w-full object-cover"
            onerror={() => (imgFailed = true)}
        />
    {/if}
    <div class="flex h-full w-full items-center justify-center font-bold text-white">
        {name.charAt(0)}
    </div>
</div>
