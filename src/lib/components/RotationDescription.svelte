<script lang="ts">
    import { onMount } from 'svelte'
    import { planner } from '$lib/stores/planner.svelte'
    import {
        getMergedTimeline,
        buildTextDescription,
        buildCharLines,
        buildIntroLines,
    } from '$lib/utils/rotation-description'
    import {
        getCharacterPresets,
        loadCharacterPresets,
    } from '$lib/data/characters'
    import KeyIcon from './KeyIcon.svelte'
    import type { TimelineItem } from '$lib/utils/rotation-description'
    import type { CharacterPreset } from '$lib/types'

    let { fillHeight = false }: { fillHeight?: boolean } = $props()

    let presets = $state<CharacterPreset[]>(getCharacterPresets())

    onMount(() => {
        loadCharacterPresets().then((p) => (presets = p))
    })

    let merged = $derived(
        getMergedTimeline(
            planner.characters,
            planner.blocks,
            planner.stayFieldMarkers,
            presets,
        ),
    )
    let text = $derived(buildTextDescription(merged))

    let copyMenuOpen = $state(false)
    let copyMenuX = $state(0)
    let copyMenuY = $state(0)
    let diagramPanel = $state<HTMLDivElement | null>(null)
    let textPanel = $state<HTMLDivElement | null>(null)
    let syncing = $state(false)

    function onDocClick() {
        copyMenuOpen = false
    }
    function onDocKey(e: KeyboardEvent) {
        if (e.key === 'Escape') copyMenuOpen = false
    }

    onMount(() => {
        document.addEventListener('click', onDocClick)
        document.addEventListener('keydown', onDocKey)
        return () => {
            document.removeEventListener('click', onDocClick)
            document.removeEventListener('keydown', onDocKey)
        }
    })

    function showCopyMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        copyMenuX = e.clientX
        copyMenuY = e.clientY
        copyMenuOpen = true
    }

    async function copyByChar(e: MouseEvent) {
        e.stopPropagation()
        const lines = buildCharLines(planner.characters, merged, presets)
        await navigator.clipboard.writeText(lines)
        copyMenuOpen = false
    }

    async function copyByIntro(e: MouseEvent) {
        e.stopPropagation()
        const lines = buildIntroLines(merged)
        await navigator.clipboard.writeText(lines)
        copyMenuOpen = false
    }

    function getBlockAvatarSrc(block: TimelineItem): string | null {
        const char = planner.characters[block.charIndex]
        if (!char?.presetId) return null
        return `/images/avatars/${char.presetId}.png`
    }

    function modeBadge(
        mode: string,
        key: string,
    ): { text: string; color: string } | null {
        if (key === 'LMB' && (mode === 'hold' || mode === 'click')) return null
        const color = planner.theme.nodeColors[mode]
        if (mode === 'rapid_click') return { text: '狂', color }
        if (mode === 'preinput_swap' || mode === 'preinput_action')
            return { text: '预', color }
        if (mode === 'hold') return { text: '长', color }
        return null
    }

    function onDiagramScroll() {
        if (syncing || !diagramPanel || !textPanel) return
        syncing = true
        textPanel.scrollTop = diagramPanel.scrollTop
        syncing = false
    }

    function onTextScroll() {
        if (syncing || !diagramPanel || !textPanel) return
        syncing = true
        diagramPanel.scrollTop = textPanel.scrollTop
        syncing = false
    }
</script>

<div
    class="flex flex-col min-w-0"
    style={fillHeight ? 'flex: 1; min-height: 0;' : 'height: 240px;'}
>
    <div class="flex h-full gap-3 min-w-0">
        <div
            bind:this={diagramPanel}
            class="flex-1 min-w-0 overflow-y-auto overflow-x-hidden rounded-lg p-3"
            style="border: 1px solid {planner.theme
                .divider}; background: {planner.theme
                .trackBg}; scrollbar-width: thin;"
            onscroll={onDiagramScroll}
        >
            {#if merged.length === 0}
                <div
                    class="flex h-full items-center justify-center text-xs text-zinc-500"
                >
                    暂无排轴数据
                </div>
            {:else}
                <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
                    {#each merged as item, i (item.block.id)}
                        <div
                            class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                            style="border-color: {planner.theme
                                .diagramItemBorder}; background: {planner.theme
                                .trackBg};"
                        >
                            {#if item.isSwitchStay}
                                <span
                                    class="text-[10px] text-cyan-400 leading-none"
                                    >(切回)</span
                                >
                            {/if}
                            <div class="flex items-center gap-1">
                                {#if getBlockAvatarSrc(item)}
                                    <img
                                        src={getBlockAvatarSrc(item)}
                                        alt={item.alias}
                                        class="h-4 w-4 shrink-0 rounded-full object-cover"
                                    />
                                {:else}
                                    <div
                                        class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-zinc-300"
                                    >
                                        {item.alias.charAt(0)}
                                    </div>
                                {/if}
                            </div>
                            {#each item.block.keyOps as op}
                                <div class="inline-flex items-center">
                                    <KeyIcon
                                        key={op.key}
                                        size="sm"
                                        color={planner.theme.nodeColors[op.key]}
                                        mode={op.mode}
                                    />
                                    {#each [modeBadge(op.mode, op.key)] as badge}
                                        {#if badge}
                                            <span
                                                class="absolute -right-1 -top-1.5 flex h-3 min-w-3 items-center justify-center rounded px-0.5 text-[8px] leading-none font-bold"
                                                style="background: {badge.color}; color: {planner
                                                    .theme.badgeText};"
                                                >{badge.text}</span
                                            >
                                        {/if}
                                    {/each}
                                </div>
                                {#if op.comboStart && op.comboEnd && op.comboStart > 0 && op.comboEnd > 0}
                                    {@const cn =
                                        op.comboStart === op.comboEnd ?
                                            String(op.comboStart)
                                        :   Array.from(
                                                {
                                                    length:
                                                        op.comboEnd -
                                                        op.comboStart +
                                                        1,
                                                },
                                                (_, i) => op.comboStart! + i,
                                            ).join('')}
                                    {@const dbg =
                                        planner.theme.key === 'dark' ?
                                            '#e4e4e7'
                                        :   '#fafafa'}
                                    <span
                                        class="-ml-2 pl-2 pr-1 rounded h-5 flex items-center font-black"
                                        style="border-top: 1.5px solid {(
                                            planner.theme.key === 'dark'
                                        ) ?
                                            '#a1a1aa'
                                        :   '#a3a3a3'}; border-right: 1.5px solid {(
                                            planner.theme.key === 'dark'
                                        ) ?
                                            '#a1a1aa'
                                        :   '#a3a3a3'}; border-bottom: 1.5px solid {(
                                            planner.theme.key === 'dark'
                                        ) ?
                                            '#a1a1aa'
                                        :   '#a3a3a3'}; font-size: 10px; padding-top: 0; padding-bottom: 0; background: linear-gradient(to right, transparent 0%, {dbg} 25%, {dbg} 100%); color: {(
                                            planner.theme.key === 'dark'
                                        ) ?
                                            '#18181b'
                                        :   '#0a0a0a'};">{cn}</span
                                    >
                                {/if}
                            {/each}
                        </div>
                        {#if i < merged.length - 1}
                            {#if merged[i + 1].block.characterId === item.block.characterId}
                                <span class="text-zinc-600 font-medium">→</span>
                            {/if}
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>

        <div class="w-px bg-zinc-800 shrink-0"></div>

        <div
            bind:this={textPanel}
            class="flex-1 min-w-0 overflow-y-auto rounded-lg p-3"
            style="border: 1px solid {planner.theme
                .divider}; background: {planner.theme
                .trackBg}; scrollbar-width: thin;"
            onscroll={onTextScroll}
        >
            {#if merged.length === 0}
                <div
                    class="flex h-full items-center justify-center text-xs"
                    style="color: {planner.theme.mutedText};"
                >
                    暂无排轴数据
                </div>
            {:else}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="cursor-default whitespace-pre-wrap wrap-break-word text-sm select-text leading-relaxed font-medium"
                    style="color: {planner.theme.text};"
                    oncontextmenu={showCopyMenu}
                >
                    {text}
                </div>
            {/if}
        </div>
    </div>
</div>

{#if copyMenuOpen}
    <div
        class="fixed z-50 w-44 rounded-lg py-1 shadow-xl"
        style="left: {copyMenuX}px; top: {copyMenuY}px; border: 1px solid {planner
            .theme.contextBorder}; background: {planner.theme.contextBg};"
    >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {planner.theme.text};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                    planner.theme.contextHover)}
            onmouseleave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '')}
            onclick={copyByChar}>复制（按角色分行）</button
        >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {planner.theme.text};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                    planner.theme.contextHover)}
            onmouseleave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '')}
            onclick={copyByIntro}>复制（按变奏分行）</button
        >
    </div>
{/if}
