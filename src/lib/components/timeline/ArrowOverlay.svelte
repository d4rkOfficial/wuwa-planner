<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'

    function computeArrows() {
        const svg = document.querySelector('#arrow-svg') as SVGSVGElement
        if (!svg) return []

        const svgRect = svg.getBoundingClientRect()
        const result: Array<{
            path: string
            color: string
            x: number
            y1: number
            y2: number
        }> = []

        const chars = planner.characters
        const TOL = 2

        for (let srcIdx = 0; srcIdx < chars.length; srcIdx++) {
            for (let dstIdx = 0; dstIdx < chars.length; dstIdx++) {
                if (srcIdx === dstIdx) continue

                const srcBlocks = planner
                    .getCharacterBlocks(chars[srcIdx].id)
                    .toSorted((a, b) => a.x - b.x)
                const dstBlocks = planner
                    .getCharacterBlocks(chars[dstIdx].id)
                    .toSorted((a, b) => a.x - b.x)
                if (srcBlocks.length === 0 || dstBlocks.length === 0) continue

                const usedIds = new Set<string>()

                for (const dstBlock of dstBlocks) {
                    const dx = dstBlock.x

                    for (const srcBlock of srcBlocks) {
                        if (usedIds.has(srcBlock.id)) continue

                        const srcEl = document.querySelector(
                            `[data-block-id="${srcBlock.id}"]`,
                        ) as HTMLElement
                        if (!srcEl) continue
                        const srcWidth = srcEl.getBoundingClientRect().width
                        const srcLeft = srcBlock.x
                        const srcRight = srcBlock.x + srcWidth

                        const inside = dx >= srcLeft - TOL && dx <= srcRight + TOL
                        if (!inside) continue

                        const dstEl = document.querySelector(
                            `[data-block-id="${dstBlock.id}"]`,
                        ) as HTMLElement
                        if (!dstEl) continue

                        const srcRect = srcEl.getBoundingClientRect()
                        const dstRect = dstEl.getBoundingClientRect()

                        const x = dstRect.left - svgRect.left
                        const srcY = srcIdx > dstIdx ? srcRect.top : srcRect.bottom
                        const dstY = srcIdx > dstIdx ? dstRect.bottom : dstRect.top
                        const y1 = srcY - svgRect.top
                        const y2 = dstY - svgRect.top

                        if (x <= 0 || y1 <= 0 || y2 <= 0) continue

                        const path = `M ${x} ${y1} L ${x} ${y2}`
                        const color = planner.getTrackColor(chars[srcIdx].id, srcIdx).border

                        result.push({
                            path,
                            color,
                            x,
                            y1,
                            y2,
                        })

                        usedIds.add(srcBlock.id)
                        break
                    }
                }
            }
        }
        return result
    }

    function computeMarkers() {
        const svg = document.querySelector('#arrow-svg') as SVGSVGElement
        if (!svg) return []

        const svgRect = svg.getBoundingClientRect()
        const result: Array<{
            id: string
            x: number
            y: number
            w: number
            h: number
        }> = []

        for (const marker of planner.stayFieldMarkers) {
            const fromEl = document.querySelector(
                `[data-block-id="${marker.fromBlockId}"]`,
            ) as HTMLElement
            const toEl = document.querySelector(
                `[data-block-id="${marker.toBlockId}"]`,
            ) as HTMLElement
            if (!fromEl || !toEl) continue

            const fromRect = fromEl.getBoundingClientRect()
            const toRect = toEl.getBoundingClientRect()

            result.push({
                id: marker.id,
                x: fromRect.left - svgRect.left - 3,
                y: fromRect.top - svgRect.top - 3,
                w: toRect.right - fromRect.left + 6,
                h: fromRect.height + 6,
            })
        }
        return result
    }

    let arrows = $state<ReturnType<typeof computeArrows>>([])
    let markers = $state<ReturnType<typeof computeMarkers>>([])

    $effect(() => {
        function update() {
            arrows = computeArrows()
            markers = computeMarkers()
        }
        update()
        const observer = new MutationObserver(update)
        const container = document.querySelector('#timeline-area')
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
            })
        }
        return () => observer.disconnect()
    })
</script>

<svg
    id="arrow-svg"
    class="pointer-events-none absolute inset-0 h-full w-full select-none"
    style="z-index: 10;"
>
    <defs>
        {#each arrows as arrow, i}
            <marker
                id={'arrowhead-' + i}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
            >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={arrow.color} />
            </marker>
        {/each}
    </defs>

    {#each arrows as arrow, i}
        <g>
            <path
                d={arrow.path}
                fill="none"
                stroke={arrow.color}
                stroke-width="2"
                stroke-opacity="0.7"
                stroke-linecap="round"
                marker-end={'url(#arrowhead-' + i + ')'}
            />
        </g>
    {/each}

    {#each markers as marker}
        <rect
            x={marker.x}
            y={marker.y}
            width={marker.w}
            height={marker.h}
            fill="none"
            stroke={planner.theme.stayField}
            stroke-width="1.5"
            stroke-dasharray="4,3"
            stroke-opacity="0.5"
            rx="4"
        />
    {/each}
</svg>
