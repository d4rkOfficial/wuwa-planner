<script lang="ts">
    import { onMount } from 'svelte'
    import type { Snippet } from 'svelte'
    import type { CharacterPreset, ElementType } from '$lib/types'
    import { loadCharacterPresets, getCharacterPresets } from '$lib/data/characters'
    import { ELEMENT_TYPE_MAP } from '$lib/data/labels'
    import { planner } from '$lib/stores/planner.svelte'
    import StarRating from './StarRating.svelte'

    let {
        excludeIds = [],
        selectedId = '',
        title = '选择角色',
        onselect,
        onclose,
        children,
    }: {
        excludeIds?: string[]
        selectedId?: string
        title?: string
        onselect: (presetId: string) => void
        onclose: () => void
        children?: Snippet
    } = $props()

    let search = $state('')
    let presets = $state<CharacterPreset[]>(getCharacterPresets())
    let excludeSet = $derived(new Set(excludeIds))
    let listEl = $state<HTMLDivElement | null>(null)

    const elementOrder: ElementType[] = ['glacio', 'fusion', 'electro', 'aero', 'spectro', 'havoc']

    onMount(() => {
        loadCharacterPresets().then((p) => (presets = p))
    })

    let filtered = $derived.by(() => {
        const q = search.trim().toLowerCase()
        let list = q
            ? presets.filter(
                  (p) =>
                      p.name.includes(q) ||
                      p.nameEn.toLowerCase().includes(q) ||
                      p.id.toLowerCase().includes(q),
              )
            : presets
        if (excludeSet.size > 0) list = list.filter((p) => !excludeSet.has(p.id))
        return list
    })

    let grouped = $derived.by(() => {
        const groups = new Map<ElementType, CharacterPreset[]>()
        for (const el of elementOrder) {
            const items = filtered.filter((p) => p.element === el)
            if (items.length > 0) groups.set(el, items)
        }
        return groups
    })

    function scrollToElement(el: ElementType) {
        if (!listEl) return
        const header = listEl.querySelector(`[data-element="${el}"]`) as HTMLElement | null
        if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
    style="background: {planner.theme.overlayBackdrop};"
    onkeydown={(e) => e.key === 'Escape' && onclose()}
>
    <div
        class="relative flex w-full sm:w-96 max-h-[85vh] sm:max-h-[80vh] rounded-t-xl sm:rounded-xl shadow-2xl"
        style="border: 1px solid {planner.theme.modalBorder}; background: {planner.theme.modalBg};"
    >
        <div class="flex min-w-0 flex-1 flex-col">
            <div
                class="flex items-center justify-between p-4"
                style="border-bottom: 1px solid {planner.theme.border};"
            >
                <h3 class="text-base font-bold" style="color: {planner.theme.text};">{title}</h3>
                <button
                    class="flex h-6 w-6 items-center justify-center rounded text-sm transition-colors"
                    style="color: {planner.theme.textSecondary};"
                    onmouseenter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background =
                            planner.theme.buttonHover
                        ;(e.currentTarget as HTMLElement).style.color = planner.theme.text
                    }}
                    onmouseleave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = ''
                        ;(e.currentTarget as HTMLElement).style.color = planner.theme.textSecondary
                    }}
                    onclick={onclose}>✕</button
                >
            </div>

            <div class="relative p-3">
                <svg
                    class="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="color: {planner.theme.textSecondary};"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    placeholder="搜索角色（拼音/汉字/英文名）..."
                    bind:value={search}
                    class="w-full rounded-lg py-2 pl-8 pr-3 text-sm"
                    style="border: 1px solid {planner.theme.inputBorder}; background: {planner.theme
                        .inputBg}; color: {planner.theme.text};"
                />
            </div>

            <div class="max-h-80 overflow-y-auto scrollbar-dark-thick px-3 pb-3" bind:this={listEl}>
                {#each [...grouped.entries()] as [element, presets]}
                    <div class="mb-2 mt-3" data-element={element}>
                        <div
                            class="mb-1 px-1 text-[11px] font-bold uppercase tracking-wider"
                            style="color: {planner.theme.textSecondary};"
                        >
                            {ELEMENT_TYPE_MAP[element] || element}
                        </div>
                        {#each presets as preset}
                            {@const sel = selectedId && preset.id === selectedId}
                            <button
                                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                                style="background: {sel
                                    ? planner.theme.contextHover
                                    : 'transparent'};"
                                onmouseenter={(e) => {
                                    if (!sel)
                                        (e.currentTarget as HTMLElement).style.background =
                                            planner.theme.contextHover
                                }}
                                onmouseleave={(e) => {
                                    if (!sel)
                                        (e.currentTarget as HTMLElement).style.background =
                                            'transparent'
                                }}
                                onclick={() => onselect(preset.id)}
                            >
                                <div
                                    class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                                >
                                    <img
                                        src={planner.theme.avatarOverrides?.[preset.id] ??
                                            `/images/avatars/${preset.id}.png`}
                                        alt={preset.name}
                                        class="absolute inset-0 z-10 h-full w-full object-cover"
                                        onerror={(e) =>
                                            ((e.target as HTMLElement).style.display = 'none')}
                                    />
                                    <div
                                        class="flex h-full w-full items-center justify-center text-sm font-bold"
                                        style="color: {planner.theme.avatarText};"
                                    >
                                        {preset.name.charAt(0)}
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="text-sm font-bold"
                                            style="color: {planner.theme.text};">{preset.name}</span
                                        >
                                        <StarRating {preset} size={11} />
                                    </div>
                                    <span
                                        class="text-xs font-medium flex"
                                        style="color: {planner.theme.textSecondary};"
                                        >{preset.nameEn}</span
                                    >
                                </div>
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="flex h-32 items-center justify-center text-sm"
                        style="color: {planner.theme.mutedText};"
                    >
                        未找到匹配角色
                    </div>
                {/each}
            </div>
        </div>

        <div
            class="flex flex-col items-center justify-center gap-2 px-2 py-3"
            style="border-left: 1px solid {planner.theme.border};"
        >
            {#each elementOrder as el}
                <button
                    class="h-7 w-7 overflow-hidden rounded opacity-60 transition-opacity hover:opacity-100"
                    title={ELEMENT_TYPE_MAP[el] || el}
                    onclick={() => scrollToElement(el)}
                >
                    <img
                        src="/images/elements/{el}.png"
                        alt={ELEMENT_TYPE_MAP[el] || el}
                        class="h-full w-full object-cover"
                    />
                </button>
            {/each}
        </div>

        {@render children?.()}
    </div>
</div>
