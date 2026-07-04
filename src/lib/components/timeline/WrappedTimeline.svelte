<script lang="ts">
    import { onMount } from 'svelte'
    import { planner } from '$lib/stores/planner.svelte'
    import ActionBlockComp from './ActionBlock.svelte'
    import type { ActionBlock } from '$lib/types'
    import { toPng } from 'html-to-image'
    import Avatar from '../character/Avatar.svelte'
    import { computeSegments } from '$lib/utils/timeline'
    import {
        drawArrow,
        drawStayRect,
        drawStayArrow,
        drawStayRectOpen,
        drawFollowCurve,
    } from '$lib/utils/timeline-canvas'

    let container = $state<HTMLDivElement | null>(null)
    let canvas = $state<HTMLCanvasElement | null>(null)
    let ctx = $state<CanvasRenderingContext2D | null>(null)
    let timelineRef = $state<HTMLDivElement | null>(null)
    let containerWidth = $state(600)
    let contextMenu = $state<{ x: number; y: number } | null>(null)
    let isMobile = $state(false)

    $effect(() => {
        const check = () => {
            isMobile = window.innerWidth < 768
        }
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    })

    const AVATAR_COL = 72
    const ROW_H = 24
    const ROW_GAP = 14
    const CORNER = 4
    const GO_RIGHT = 16

    $effect(() => {
        if (!container) return
        const obs = new ResizeObserver((e) => {
            containerWidth = e[0].contentRect.width
        })
        obs.observe(container)
        return () => obs.disconnect()
    })

    interface Segment {
        startX: number
        blocks: ActionBlock[]
    }

    let segments = $derived(computeSegments(planner.blocks, containerWidth))

    $effect(() => {
        if (!canvas) return
        ctx = canvas.getContext('2d')
    })

    $effect(() => {
        void segments.length
        void planner.blocks.map((b) => b.id + b.x).join(',')
        void planner.stayFieldMarkers.map((m) => m.id).join(',')
        void planner.theme
        void containerWidth
        requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(() => drawArrows())),
        )
    })

    function drawArrows() {
        const c = canvas,
            cx = ctx
        if (!c || !cx || !timelineRef || containerWidth < 10) return

        const dpr = window.devicePixelRatio || 1
        const tlRect = timelineRef.getBoundingClientRect()
        const W = tlRect.width,
            H = tlRect.height
        c.width = W * dpr
        c.height = H * dpr
        c.style.width = W + 'px'
        c.style.height = H + 'px'
        cx.setTransform(dpr, 0, 0, dpr, 0, 0)
        cx.clearRect(0, 0, W, H)

        const chars = planner.characters
        const segEls = document.querySelectorAll('[data-wseg]')

        const toCanvasX = (sx: number) => sx - tlRect.left
        const toCanvasY = (sy: number) => sy - tlRect.top

        const allBlocks = planner.blocks.toSorted((a, b) => a.x - b.x)
        const nextBlockMap = new Map<string, string>()
        for (let i = 0; i < allBlocks.length - 1; i++) {
            nextBlockMap.set(allBlocks[i].id, allBlocks[i + 1].id)
        }

        // ── Within-segment swap arrows ──
        segEls.forEach((segEl, si) => {
            const seg = segments[si]
            if (!seg || seg.blocks.length === 0) return

            for (let srcIdx = 0; srcIdx < chars.length; srcIdx++) {
                for (let dstIdx = 0; dstIdx < chars.length; dstIdx++) {
                    if (srcIdx === dstIdx) continue
                    const sbl = seg.blocks
                        .filter((b) => b.characterId === chars[srcIdx].id)
                        .toSorted((a, b) => a.x - b.x)
                    const dbl = seg.blocks
                        .filter((b) => b.characterId === chars[dstIdx].id)
                        .toSorted((a, b) => a.x - b.x)
                    if (!sbl.length || !dbl.length) continue

                    const used = new Set<string>()
                    for (const db of dbl) {
                        if (db.isOffHand) continue
                        for (const sb of sbl) {
                            if (sb.isOffHand) continue
                            if (used.has(sb.id)) continue
                            const sEl = segEl.querySelector(
                                `[data-block-id="${sb.id}"]`,
                            ) as HTMLElement
                            if (!sEl) continue
                            const dEl = segEl.querySelector(
                                `[data-block-id="${db.id}"]`,
                            ) as HTMLElement
                            if (!dEl) continue
                            const sR = sEl.getBoundingClientRect()
                            const srcEnd = sb.x + sR.width
                            if (db.x < sb.x - 2 || db.x > srcEnd + 2) continue

                            const sRow = segEl.querySelector(
                                `[data-track-row="${srcIdx}"]`,
                            ) as HTMLElement
                            const dRow = segEl.querySelector(
                                `[data-track-row="${dstIdx}"]`,
                            ) as HTMLElement
                            if (!sRow || !dRow) continue
                            const srR = sRow.getBoundingClientRect()
                            const drR = dRow.getBoundingClientRect()

                            const ax = toCanvasX(dEl.getBoundingClientRect().left)
                            const ay1 = toCanvasY(srcIdx > dstIdx ? srR.top : srR.bottom)
                            const ay2 = toCanvasY(srcIdx > dstIdx ? drR.bottom : drR.top)
                            if (ax <= 0 || ay1 <= 0 || ay2 <= 0) continue

                            drawArrow(
                                cx,
                                ax,
                                ay1,
                                ax,
                                ay2,
                                planner.getTrackColor(chars[srcIdx].id, srcIdx).border,
                            )
                            used.add(sb.id)
                            break
                        }
                    }
                }
            }

            // ── Same-segment stay-fields ──
            for (const m of planner.stayFieldMarkers) {
                const fEl = segEl.querySelector(`[data-block-id="${m.fromBlockId}"]`) as HTMLElement
                const tEl = segEl.querySelector(`[data-block-id="${m.toBlockId}"]`) as HTMLElement
                if (!fEl || !tEl) continue
                const fR = fEl.getBoundingClientRect(),
                    tR = tEl.getBoundingClientRect()
                const toBlock = planner.blocks.find((b) => b.id === m.toBlockId)
                if (nextBlockMap.get(m.fromBlockId) === m.toBlockId || toBlock?.isOffHand) {
                    drawStayArrow(
                        cx,
                        toCanvasX(tR.left),
                        toCanvasY(tR.top + tR.height / 2),
                        planner.theme.stayField,
                    )
                } else {
                    drawStayRect(
                        cx,
                        toCanvasX(fR.left),
                        toCanvasY(fR.top),
                        toCanvasX(tR.right),
                        fR.height,
                        planner.theme.stayField,
                    )
                }
            }
        })

        // ── Cross-segment stay-field markers ──
        for (const m of planner.stayFieldMarkers) {
            let fromSi = -1,
                toSi = -1
            for (let si = 0; si < segments.length; si++) {
                if (segments[si].blocks.some((b) => b.id === m.fromBlockId)) fromSi = si
                if (segments[si].blocks.some((b) => b.id === m.toBlockId)) toSi = si
            }
            if (fromSi < 0 || toSi < 0 || fromSi === toSi) continue

            const fSegEl = segEls[fromSi] as HTMLElement
            const tSegEl = segEls[toSi] as HTMLElement
            const fEl = fSegEl.querySelector(`[data-block-id="${m.fromBlockId}"]`) as HTMLElement
            const tEl = tSegEl.querySelector(`[data-block-id="${m.toBlockId}"]`) as HTMLElement
            if (!fEl || !tEl) continue

            const fR = fEl.getBoundingClientRect()
            const tR = tEl.getBoundingClientRect()
            const fArea = fSegEl.querySelector('[data-track-area]')
            const tArea = tSegEl.querySelector('[data-track-area]')
            if (!fArea || !tArea) continue

            const toBlock = planner.blocks.find((b) => b.id === m.toBlockId)
            if (toBlock?.isOffHand) {
                drawStayArrow(
                    cx,
                    toCanvasX(tR.left),
                    toCanvasY(tR.top + tR.height / 2),
                    planner.theme.stayField,
                )
            } else {
                drawStayRectOpen(
                    cx,
                    toCanvasX(fR.left),
                    toCanvasY(fR.top),
                    toCanvasX(fArea.getBoundingClientRect().right),
                    fR.height,
                    planner.theme.stayField,
                    true,
                    false,
                )
                drawStayRectOpen(
                    cx,
                    toCanvasX(tArea.getBoundingClientRect().left),
                    toCanvasY(tR.top),
                    toCanvasX(tR.right),
                    tR.height,
                    planner.theme.stayField,
                    false,
                    true,
                )
            }
        }

        // ── Long-block wrap indicators ──
        for (let si = 0; si < segments.length; si++) {
            const segEl = segEls[si] as HTMLElement
            if (!segEl) continue
            const area = segEl.querySelector('[data-track-area]') as HTMLElement
            if (!area) continue
            const areaR = area.getBoundingClientRect()
            const seg = segments[si]
            if (!seg) continue

            for (const b of seg.blocks) {
                const bEl = segEl.querySelector(`[data-block-id="${b.id}"]`) as HTMLElement
                if (!bEl) continue
                const bR = bEl.getBoundingClientRect()
                if (bR.right <= areaR.right + 2) continue // no overflow

                // Upper half: left-closed (block left), right-open (area right)
                drawStayRect(
                    cx,
                    toCanvasX(bR.left),
                    toCanvasY(bR.top),
                    toCanvasX(areaR.right),
                    bR.height,
                    planner.theme.wrapIndicator,
                )
            }
        }

        // ── Cross-segment curve arrows (path stays within segment gap, not through track rows) ──
        if (segments.length >= 2 && segEls.length >= 2) {
            for (let s = 0; s < segments.length - 1; s++) {
                const seg = segments[s],
                    nseg = segments[s + 1]
                if (!seg.blocks.length || !nseg.blocks.length) continue
                const lb = seg.blocks[seg.blocks.length - 1]
                const fb = nseg.blocks[0]
                const tci = chars.findIndex((c) => c.id === fb.characterId)
                if (tci < 0) continue
                const lci = chars.findIndex((c) => c.id === lb.characterId)

                const sEl = segEls[s] as HTMLElement
                const nEl = segEls[s + 1] as HTMLElement
                const lE = sEl.querySelector(`[data-block-id="${lb.id}"]`) as HTMLElement
                const aE = nEl.querySelector(`[data-avatar-idx="${tci}"]`) as HTMLElement
                if (!lE || !aE) continue

                const lR = lE.getBoundingClientRect(),
                    aR = aE.getBoundingClientRect()
                const sR = sEl.getBoundingClientRect(),
                    nR = nEl.getBoundingClientRect()

                const gapCY = (sR.bottom + nR.top) / 2

                const x1 = toCanvasX(lR.right) + 2
                const y1 = toCanvasY(lR.top + lR.height / 2)
                const x2 = toCanvasX(aR.left)
                const y2 = toCanvasY(aR.top + aR.height / 2)
                const gy = toCanvasY(gapCY)
                if (x2 <= 0 || y2 <= 0) continue

                const ac = planner.getTrackColor(chars[tci].id, tci).border

                const xR = x1 + GO_RIGHT
                const xT = x2 - CORNER * 3

                cx.beginPath()
                cx.moveTo(x1, y1)
                cx.lineTo(xR, y1)
                cx.arcTo(xR + CORNER, y1, xR + CORNER, y1 + CORNER, CORNER)
                cx.lineTo(xR + CORNER, gy)
                cx.arcTo(xR + CORNER, gy + CORNER, xR, gy + CORNER, CORNER)
                cx.lineTo(xT, gy + CORNER)
                cx.arcTo(xT - CORNER, gy + CORNER, xT - CORNER, gy + CORNER * 2, CORNER)
                cx.lineTo(xT - CORNER, y2 - CORNER)
                cx.arcTo(xT - CORNER, y2, xT, y2, CORNER)
                cx.lineTo(x2, y2)
                cx.strokeStyle = ac
                cx.lineWidth = 2
                cx.globalAlpha = 0.5
                cx.lineCap = 'round'
                cx.lineJoin = 'round'
                cx.stroke()
                cx.globalAlpha = 1

                cx.fillStyle = ac
                cx.globalAlpha = 0.5
                cx.beginPath()
                cx.moveTo(x2, y2)
                cx.lineTo(x2 - 7 * Math.cos(Math.PI / 6), y2 - 7 * Math.sin(Math.PI / 6))
                cx.lineTo(x2 - 7 * Math.cos(-Math.PI / 6), y2 - 7 * Math.sin(-Math.PI / 6))
                cx.closePath()
                cx.fill()
                cx.globalAlpha = 1
            }
        }
    }

    let menuRef = $state<HTMLDivElement>()
    let menuAdjX = $state(0)
    let menuAdjY = $state(0)

    $effect(() => {
        if (!contextMenu) {
            menuAdjX = 0
            menuAdjY = 0
            return
        }
        const m = contextMenu
        menuAdjX = m.x
        menuAdjY = m.y
        requestAnimationFrame(() => {
            if (!menuRef) return
            const r = menuRef.getBoundingClientRect()
            menuAdjX = Math.max(4, Math.min(m.x, innerWidth - r.width - 4))
            menuAdjY = Math.max(4, Math.min(m.y, innerHeight - r.height - 4))
        })
    })

    function handleContextMenu(e: MouseEvent) {
        e.preventDefault()
        contextMenu = { x: e.clientX, y: e.clientY }
    }

    function handleDocClick() {
        contextMenu = null
    }

    async function handleDownload() {
        contextMenu = null
        if (!container) return
        try {
            await document.fonts.ready
            const w = container.offsetWidth
            const h = container.offsetHeight
            const dataUrl = await toPng(container, {
                backgroundColor: planner.theme.exportBg,
                pixelRatio: 2,
                cacheBust: true,
                width: w,
                height: h,
            })
            const a = document.createElement('a')
            a.download = `${planner.title || 'rotation'}.png`
            a.href = dataUrl
            a.click()
        } catch (e) {
            /* ignore */
        }
    }

    onMount(() => {
        document.addEventListener('click', handleDocClick)
        return () => document.removeEventListener('click', handleDocClick)
    })
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={container}
    class="relative w-full px-5 {isMobile ? 'overflow-x-auto scrollbar-none' : ''}"
    oncontextmenu={handleContextMenu}
>
    <div
        bind:this={timelineRef}
        style="position: relative; background: {planner.theme.exportBg};{isMobile
            ? 'min-width: 1440px;'
            : ''}"
    >
        {#if segments.length === 0}
            <div
                class="flex h-20 items-center justify-center text-sm"
                style="color: {planner.theme.mutedText};"
            >
                暂无操作块
            </div>
        {:else}
            {#each segments as seg, si}
                <div
                    data-wseg={si}
                    style="position: relative;{si < segments.length - 1
                        ? ' margin-bottom: 24px;'
                        : ''}"
                >
                    <div class="flex gap-0.5 pr-8">
                        <div
                            class="flex flex-col shrink-0"
                            style="width: {AVATAR_COL}px; gap: {ROW_GAP}px;"
                        >
                            {#each planner.characters as char, ci}
                                {@const tc = planner.getTrackColor(char.id, ci)}
                                <div
                                    data-avatar-idx={ci}
                                    class="relative mx-auto h-8 w-8 shrink-0 overflow-hidden rounded-full"
                                    style="border: 1.5px solid {tc.border}; margin-top: {(ROW_H -
                                        32) /
                                        2}px; margin-bottom: {(ROW_H - 32) / 2}px;"
                                    title={char.name}
                                >
                                    <Avatar presetId={char.presetId} name={char.name} size="md" />
                                </div>
                            {/each}
                        </div>
                        <div
                            data-track-area
                            class="min-w-0 flex-1"
                            style="display: flex; flex-direction: column; gap: {ROW_GAP}px;"
                        >
                            {#each planner.characters as char, ci}
                                {@const tc = planner.getTrackColor(char.id, ci)}
                                {@const cbl = seg.blocks
                                    .filter((b) => b.characterId === char.id)
                                    .toSorted((a, b) => a.x - b.x)}
                                <div
                                    data-track-row={ci}
                                    class="relative rounded px-1 py-0"
                                    style="border-left: 3px solid {tc.gradient}; min-height: {ROW_H}px;"
                                >
                                    {#if cbl.length === 0}
                                        <div
                                            class="flex items-center text-[10px]"
                                            style="height: {ROW_H}px; color: {planner.theme
                                                .mutedText};"
                                        >
                                            &nbsp;
                                        </div>
                                    {:else}
                                        {#each cbl as b (b.id)}
                                            <div
                                                class="absolute"
                                                style="left: {Math.max(
                                                    0,
                                                    b.x - seg.startX,
                                                )}px; top: 0;"
                                            >
                                                <ActionBlockComp
                                                    block={b}
                                                    theme={planner.theme}
                                                    compact={true}
                                                />
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
        <canvas
            bind:this={canvas}
            class="pointer-events-none absolute inset-0 select-none"
            style="z-index: 5;"
        ></canvas>
    </div>
</div>

{#if contextMenu}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        bind:this={menuRef}
        class="fixed z-50 w-36 rounded-lg py-1 shadow-xl"
        style="left: {menuAdjX}px; top: {menuAdjY}px; border: 1px solid {planner.theme
            .contextBorder}; background: {planner.theme.contextBg};"
    >
        <button
            class="flex w-full items-center px-4 py-2 text-left text-xs transition-colors"
            style="color: {planner.theme.text};"
            onmouseenter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = planner.theme.contextHover
            }}
            onmouseleave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = ''
            }}
            onclick={handleDownload}>下载为图片</button
        >
    </div>
{/if}
