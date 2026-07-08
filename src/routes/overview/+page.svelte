<script lang="ts">
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { planner } from '$lib/stores/planner.svelte'
    import { projects } from '$lib/stores/projects.svelte'
    import { loadCharacterPresets, getCharacterPresets } from '$lib/data/characters'
    import type { CharacterPreset } from '$lib/types'
    import WrappedTimeline from '$lib/components/timeline/WrappedTimeline.svelte'
    import RotationDescription from '$lib/components/timeline/RotationDescription.svelte'
    import { toPng } from 'html-to-image'
    import { mediaStore } from '$lib/stores/media.svelte'
    import {
        getMergedTimeline,
        buildTextDescription,
        buildCharLines,
        buildIntroLines,
    } from '$lib/utils/rotation-description'

    let scrollEl = $state<HTMLDivElement | null>(null)
    let tlWrapper = $state<HTMLDivElement | null>(null)
    let captureContainer = $state<HTMLDivElement | null>(null)
    let isDragging = $state(false)
    let dragStartX = 0
    let dragStartLeft = 0
    let tab: 'timeline' | 'description' = $state('timeline')

    let presets = $state<CharacterPreset[]>(getCharacterPresets())

    let copyMenuOpen = $state(false)
    let copyMenuX = $state(0)
    let copyMenuY = $state(0)

    let menuAdjX = $derived(
        copyMenuOpen
            ? Math.min(
                  copyMenuX,
                  (typeof window !== 'undefined' ? window.innerWidth : 9999) - 184 - 8,
              )
            : 0,
    )
    let menuAdjY = $derived(
        copyMenuOpen
            ? Math.min(
                  copyMenuY,
                  (typeof window !== 'undefined' ? window.innerHeight : 9999) - 124 - 8,
              )
            : 0,
    )

    let merged = $derived(
        getMergedTimeline(planner.characters, planner.blocks, planner.stayFieldMarkers, presets),
    )

    function onDocClick() {
        copyMenuOpen = false
    }
    function onDocKey(e: KeyboardEvent) {
        if (e.key === 'Escape') copyMenuOpen = false
    }

    onMount(() => {
        if (projects.projects.length === 0) {
            goto('/')
            return
        }
        loadCharacterPresets().then((p) => (presets = p))
        projects.loadFromStorage()
        const hashId = window.location.hash.slice(1)
        const targetId =
            hashId && projects.projects.find((p) => p.id === hashId)
                ? hashId
                : projects.projects[0].id
        projects.loadProjectToPlanner(targetId)

        document.addEventListener('click', onDocClick)
        document.addEventListener('keydown', onDocKey)
        return () => {
            document.removeEventListener('click', onDocClick)
            document.removeEventListener('keydown', onDocKey)
        }
    })

    function handleWrapperMouseDown(e: MouseEvent) {
        if (e.button !== 0) return
        isDragging = true
        dragStartX = e.clientX
        dragStartLeft = tlWrapper!.scrollLeft
        tlWrapper!.style.cursor = 'grabbing'
    }

    function handleWrapperMouseMove(e: MouseEvent) {
        if (!isDragging) return
        e.preventDefault()
        const dx = dragStartX - e.clientX
        tlWrapper!.scrollLeft = dragStartLeft + dx
    }

    function handleWrapperMouseUp() {
        if (!isDragging) return
        isDragging = false
        tlWrapper!.style.cursor = ''
    }

    function handleWrapperWheel(e: WheelEvent) {
        const canScrollV = scrollEl!.scrollHeight > scrollEl!.clientHeight
        if (!canScrollV && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault()
            tlWrapper!.scrollLeft += e.deltaY
        }
    }

    async function handleDownloadTimeline() {
        if (!captureContainer) return
        try {
            await document.fonts.ready
            const dataUrl = await toPng(captureContainer, {
                backgroundColor: planner.theme.exportBg,
                pixelRatio: 2,
                cacheBust: true,
            })
            const a = document.createElement('a')
            a.download = `${planner.title || 'rotation'}.png`
            a.href = dataUrl
            a.click()
        } catch {
            /* ignore */
        }
    }

    function handleOpenCopyMenu(e: MouseEvent) {
        e.stopPropagation()
        copyMenuX = e.clientX
        copyMenuY = e.clientY
        copyMenuOpen = true
    }

    async function copyDirect() {
        const text = buildTextDescription(merged)
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            /* ignore */
        }
        copyMenuOpen = false
    }

    async function copyByChar() {
        const lines = buildCharLines(merged)
        try {
            await navigator.clipboard.writeText(lines)
        } catch {
            /* ignore */
        }
        copyMenuOpen = false
    }

    async function copyByIntro() {
        const lines = buildIntroLines(merged)
        try {
            await navigator.clipboard.writeText(lines)
        } catch {
            /* ignore */
        }
        copyMenuOpen = false
    }

    let isMobile = $derived(mediaStore.isMobile)
    let t = $derived(planner.theme)
</script>

<div class="flex flex-col h-dvh" style="background: {t.background}; color: {t.text};">
    <div
        class="flex shrink-0 items-center gap-3 px-5 py-3"
        style="border-bottom: 1px solid {t.border};"
    >
        <span class="text-sm font-black" style="color: {t.text};">{planner.title}</span>

        <div class="flex items-center rounded-lg p-0.5" style="background: {t.inputBg};">
            <button
                class="inline-flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-black transition-colors"
                style="background: {tab === 'timeline'
                    ? t.selectedModeBg
                    : 'transparent'}; color: {tab === 'timeline'
                    ? t.text
                    : t.textSecondary};{tab === 'timeline'
                    ? 'box-shadow: inset 0 0 0 1px ' + t.selectedModeRing + ';'
                    : ''}"
                onclick={() => (tab = 'timeline')}
                ><span class="material-icons">image</span>图示轴</button
            >
            <button
                class="inline-flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-black transition-colors"
                style="background: {tab === 'description'
                    ? t.selectedModeBg
                    : 'transparent'}; color: {tab === 'description'
                    ? t.text
                    : t.textSecondary};{tab === 'description'
                    ? 'box-shadow: inset 0 0 0 1px ' + t.selectedModeRing + ';'
                    : ''}"
                onclick={() => (tab = 'description')}
                ><span class="material-icons">text_fields</span>文字轴</button
            >
        </div>

        <div class="flex-1"></div>

        {#if !isMobile}
            {#if tab === 'timeline'}
                <button
                    class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] transition-colors"
                    style="border: 1px solid {t.inputBorder}; color: {t.textSecondary};"
                    onmouseenter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                        ;(e.currentTarget as HTMLElement).style.color = t.text
                    }}
                    onmouseleave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = ''
                        ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                    }}
                    onclick={handleDownloadTimeline}
                >
                    <span class="material-icons">download</span>
                    <span class="font-black">下载图示轴</span></button
                >
            {:else}
                <button
                    class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] transition-colors"
                    style="border: 1px solid {t.inputBorder}; color: {t.textSecondary};"
                    onmouseenter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                        ;(e.currentTarget as HTMLElement).style.color = t.text
                    }}
                    onmouseleave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = ''
                        ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                    }}
                    onclick={handleOpenCopyMenu}
                >
                    <span class="material-icons">content_copy</span>
                    <span class="font-black">复制文字轴</span></button
                >
            {/if}
        {/if}

        <a
            href="/#{projects.activeId}"
            class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] no-underline transition-colors font-black"
            style="border: 1px solid {t.inputBorder}; color: {t.textSecondary};"
            onmouseenter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                ;(e.currentTarget as HTMLElement).style.color = t.text
            }}
            onmouseleave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = ''
                ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
            }}><span class="material-icons">arrow_back</span>返回排轴</a
        >
    </div>

    {#if tab === 'timeline'}
        <div class="flex-1 min-h-0 overflow-y-auto scrollbar-dark-thick" bind:this={scrollEl}>
            <div class="flex flex-col min-h-0">
                <div class="flex-1 min-h-0 flex flex-col pt-2 pb-2">
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="flex-1 min-h-0 overflow-x-auto py-2"
                        bind:this={tlWrapper}
                        onmousedown={handleWrapperMouseDown}
                        onmousemove={handleWrapperMouseMove}
                        onmouseup={handleWrapperMouseUp}
                        onmouseleave={handleWrapperMouseUp}
                        onwheel={handleWrapperWheel}
                    >
                        <div bind:this={captureContainer} class="w-[1600px]">
                            <WrappedTimeline />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex-1 min-h-0 overflow-y-auto scrollbar-dark-thick px-5 py-3">
            <RotationDescription fillHeight={true} />
        </div>
    {/if}
</div>

{#if copyMenuOpen}
    <div
        class="fixed z-50 w-44 rounded-lg py-1 shadow-xl"
        style="left: {menuAdjX}px; top: {menuAdjY}px; border: 1px solid {t.contextBorder}; background: {t.contextBg};"
    >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {t.text};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.contextHover)}
            onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
            onclick={copyDirect}>直接复制</button
        >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {t.text};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.contextHover)}
            onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
            onclick={copyByChar}>复制（按角色分行）</button
        >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {t.text};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.contextHover)}
            onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
            onclick={copyByIntro}>复制（按变奏分行）</button
        >
    </div>
{/if}
