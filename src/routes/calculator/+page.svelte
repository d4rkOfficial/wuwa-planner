<script lang="ts">
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { planner } from '$lib/stores/planner.svelte'
    import { projects } from '$lib/stores/projects.svelte'
    import { getCharacterPresets } from '$lib/data/characters'
    import { getMergedTimeline, keyOpText } from './utils.js'
    import type { CharacterPreset } from '$lib/types'
    import Avatar from '$lib/components/character/Avatar.svelte'

    onMount(() => {
        if (projects.projects.length === 0) {
            goto('/')
            return
        }
        projects.loadFromStorage()
        if (projects.projects.length === 0) {
            window.location.href = '/'
            return
        }
        const hashId = window.location.hash.slice(1)
        const targetId =
            hashId && projects.projects.find((p) => p.id === hashId)
                ? hashId
                : projects.projects[0].id
        projects.loadProjectToPlanner(targetId)
    })

    let container: HTMLDivElement | undefined
    let tableEl: HTMLTableElement | undefined

    onMount(() => {
        function onWheel(e: WheelEvent) {
            if (e.ctrlKey) {
                e.preventDefault()
                container!.scrollLeft += e.deltaY
            }
        }
        container?.addEventListener('wheel', onWheel, { passive: false })
        return () => container?.removeEventListener('wheel', onWheel)
    })

    onMount(() => {
        function syncSticky() {
            if (!tableEl) return
            const roleCells = tableEl.querySelectorAll<HTMLElement>('[data-sticky="role"]')
            const actionCells = tableEl.querySelectorAll<HTMLElement>('[data-sticky="action"]')
            let w = 0
            for (const cell of roleCells) {
                if (cell.offsetWidth > 0) {
                    w = cell.offsetWidth
                    break
                }
            }
            if (w > 0) {
                for (const cell of actionCells) {
                    cell.style.left = w + 'px'
                }
            }
        }
        syncSticky()
        const ro = new ResizeObserver(syncSticky)
        if (tableEl) ro.observe(tableEl)
        return () => ro.disconnect()
    })

    let presets = $state<CharacterPreset[]>(getCharacterPresets())

    let timelineItems = $derived(
        getMergedTimeline(planner.characters, planner.blocks, planner.stayFieldMarkers, presets),
    )

    let t = $derived(planner.theme)

    let charNames = $derived(
        Object.fromEntries(
            planner.characters.map((c, i) => {
                const p = presets.find((pr) => pr.id === c.presetId)
                return [i, p?.name ?? c.name]
            }),
        ),
    )

    let flatOps = $derived(
        timelineItems.flatMap((item) => {
            const raw = item.block.keyOps.flatMap((op) => {
                if (
                    op.comboStart &&
                    op.comboEnd &&
                    op.comboStart > 0 &&
                    op.comboEnd > 0 &&
                    op.comboStart !== op.comboEnd
                ) {
                    const segs: { comboStart: number; comboEnd: number }[] = []
                    for (let n = op.comboStart; n <= op.comboEnd; n++) {
                        segs.push({ comboStart: n, comboEnd: n })
                    }
                    return segs.map((s) => ({ ...op, ...s }))
                }
                return [op]
            })
            return raw.map((op, oi) => ({
                item,
                op,
                first: oi === 0,
                last: oi === raw.length - 1,
                isOutroRow: false,
            }))
        }),
    )

    let extraHeaders = [
        '倍率',
        '回路1',
        '回路2',
        '回路3',
        '协奏能量',
        '共鸣能量',
        '生效Buff',
        '造成伤害',
        '+暴击率%',
        '+暴击伤害%',
        '+攻击力',
        '+攻击力%',
        '+生命值',
        '+生命值%',
        '+防御力',
        '+防御力%',
        '+常系数1',
        '+常系数2',
        '+增伤区%',
        '+加深区%',
        '-对目标防御无视%',
        '-对目标抗性无视%',
        '-对目标免伤无视%',
        '+造成集谐终伤%',
        '+0类终伤%',
        '+1类终伤%',
        '+2类终伤%',
        '+3类终伤%',
        '+4类终伤%',
        '+5类终伤%',
        '+6类终伤%',
        '+聚爆结算终伤%',
        '+共鸣效率%',
        '+偏谐值累积效率%',
        '+谐度破坏增幅%',
        '+回路1变动效率%',
        '+回路2变动效率%',
        '+回路3变动效率%',
        '+目标偏谐值',
        '+目标偏谐值%',
        '+目标共振度',
        '+目标共振度%',
    ]

    let flatOpsWithOutroRows = $derived(
        flatOps.reduce(
            (acc, e, i, arr) => {
                acc.push(e)
                if (
                    e.last &&
                    i < arr.length - 1 &&
                    arr[i + 1].item.charIndex !== e.item.charIndex &&
                    arr[i + 1].item.isSwitchIntro
                ) {
                    acc.push({
                        item: e.item,
                        op: null,
                        first: true,
                        last: true,
                        isOutroRow: true,
                    })
                }
                return acc
            },
            [] as Array<{
                item: (typeof flatOps)[number]['item']
                op: (typeof flatOps)[number]['op'] | null
                first: boolean
                last: boolean
                isOutroRow: boolean
            }>,
        ),
    )

    let flatOpsWithGroup = $derived(
        flatOpsWithOutroRows.map((e, i) => {
            const groupStart =
                i === 0 || flatOpsWithOutroRows[i - 1].item.charIndex !== e.item.charIndex
            const groupEnd =
                i === flatOpsWithOutroRows.length - 1 ||
                flatOpsWithOutroRows[i + 1].item.charIndex !== e.item.charIndex
            let rowspan = 0
            if (groupStart) {
                rowspan = 1
                for (let j = i + 1; j < flatOpsWithOutroRows.length; j++) {
                    if (flatOpsWithOutroRows[j].item.charIndex === e.item.charIndex) rowspan++
                    else break
                }
            }
            return { ...e, groupStart, groupEnd, rowspan }
        }),
    )
</script>

<div class="flex flex-col h-dvh" style="background: {t.background}; color: {t.text};">
    <div
        class="flex shrink-0 items-center justify-between px-5 py-3"
        style="border-bottom: 1px solid {t.border};"
    >
        <div class="flex items-center gap-3">
            <span class="text-sm font-black" style="color: {t.text};">{planner.title}</span>
            <button
                class="rounded px-2.5 py-1 text-[11px] font-black transition-colors"
                style="border: 1px solid {t.inputBorder}; color: {t.textSecondary}; background: transparent;"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                    ;(e.currentTarget as HTMLElement).style.color = t.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = ''
                    ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                }}>队伍配置</button
            >
            <button
                class="rounded px-2.5 py-1 text-[11px] font-black transition-colors"
                style="border: 1px solid {t.inputBorder}; color: {t.textSecondary}; background: transparent;"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                    ;(e.currentTarget as HTMLElement).style.color = t.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = ''
                    ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                }}>敌人配置</button
            >
            <button
                class="rounded px-2.5 py-1 text-[11px] font-black transition-colors"
                style="border: 1px solid {t.inputBorder}; color: {t.textSecondary}; background: transparent;"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                    ;(e.currentTarget as HTMLElement).style.color = t.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = ''
                    ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                }}>快速Buff配置</button
            >
            <button
                class="rounded px-2.5 py-1 text-[11px] font-black transition-colors"
                style="border: 1px solid {t.inputBorder}; color: {t.textSecondary}; background: transparent;"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                    ;(e.currentTarget as HTMLElement).style.color = t.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = ''
                    ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                }}>伤害对比</button
            >
            <button
                class="rounded px-2.5 py-1 text-[11px] font-black transition-colors"
                style="border: 1px solid {t.inputBorder}; color: {t.textSecondary}; background: transparent;"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                    ;(e.currentTarget as HTMLElement).style.color = t.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = ''
                    ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
                }}>伤害统计</button
            >
        </div>
        <a
            href="/#{projects.activeId}"
            class="rounded px-2.5 py-1 text-[11px] font-black no-underline transition-colors"
            style="border: 1px solid {t.inputBorder}; color: {t.textSecondary};"
            onmouseenter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = t.buttonHover
                ;(e.currentTarget as HTMLElement).style.color = t.text
            }}
            onmouseleave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = ''
                ;(e.currentTarget as HTMLElement).style.color = t.textSecondary
            }}>返回排轴</a
        >
    </div>
    <div
        class="flex-1 min-h-0 overflow-auto"
        style="background: {t.background};"
        bind:this={container}
    >
        {#if timelineItems.length === 0}
            <div class="flex items-center justify-center h-full px-5">
                <span class="text-xs" style="color: {t.mutedText};">暂无操作</span>
            </div>
        {:else}
            <table
                style="table-layout: fixed; border-collapse: separate; border-spacing: 0; width: max-content;"
                bind:this={tableEl}
            >
                <thead>
                    <tr>
                        <th
                            style="border: 1px solid {t.border}; padding: 6px 8px; width: 100px; position: sticky; left: 0; top: 0; z-index: 4; background: {t.buttonBg}; background-clip: padding-box; font-weight: 700; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden;"
                            data-sticky="role">角色</th
                        >
                        <th
                            style="border: 1px solid {t.border}; padding: 6px 8px; width: 60px; position: sticky; top: 0; z-index: 4; background: {t.buttonBg}; background-clip: padding-box; font-weight: 700; font-size: 11px; text-align: center; white-space: nowrap; box-shadow: 3px 0 6px -3px rgba(0,0,0,0.3);"
                            data-sticky="action">出招</th
                        >
                        {#each extraHeaders as h, i (h)}
                            <th
                                style="border: 1px solid {t.border}; padding: 6px 8px; width: 70px; position: sticky; top: 0; z-index: 3; background-clip: padding-box; {i ===
                                    7
                                        ? `background: ${t.buttonBg}; color: ${t.accentText};`
                                        : i >= 8
                                          ? `background: ${t.buttonBg}; color: ${t.textSecondary};`
                                          : `background: ${t.buttonBg};`} font-weight: 700; font-size: 11px; text-align: center; white-space: nowrap;"
                                >{h}</th
                            >
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each flatOpsWithGroup as e, fi (e.item.block.id + '-' + fi)}
                        {@const tc = planner.getTrackColor(
                            planner.characters[e.item.charIndex]?.id ?? '',
                            e.item.charIndex,
                        )}
                        {@const bb = e.groupEnd ? `border-bottom: 2px solid ${tc.border};` : ''}
                        <tr>
                            {#if e.groupStart}
                                <td
                                    class="align-top"
                                    style="border: 1px solid {t.border}; border-bottom: 2px solid {tc.border}; padding: 6px 8px; width: 100px; position: sticky; left: 0; z-index: 2; background: {t.background}; background-clip: padding-box; overflow: hidden;"
                                    rowspan={e.rowspan}
                                    data-sticky="role"
                                >
                                    <div class="flex items-center gap-1.5 overflow-hidden">
                                        <div
                                            class="relative shrink-0 h-5 w-5 overflow-hidden rounded-sm"
                                        >
                                            <Avatar
                                                presetId={planner.characters[e.item.charIndex]
                                                    ?.presetId ?? null}
                                                name={charNames[e.item.charIndex]}
                                                fillContainer
                                            />
                                        </div>
                                        <span
                                            class="text-[10px] font-bold leading-none whitespace-nowrap"
                                            style="color: {tc.border};"
                                            >{charNames[e.item.charIndex]}</span
                                        >
                                    </div>
                                </td>
                            {/if}
                            <td
                                style="border: 1px solid {t.border}; padding: 6px 8px; width: 60px; position: sticky; z-index: 2; background: {t.background}; background-clip: padding-box; box-shadow: 3px 0 6px -3px rgba(0,0,0,0.3); {bb}"
                                data-sticky="action"
                            >
                                <span class="text-xs leading-none" style="color: {t.text};">
                                    {#if e.isOutroRow}
                                        延奏
                                    {:else}
                                        {keyOpText(e.op!)}
                                    {/if}
                                </span>
                            </td>
                            {#each extraHeaders as h, i (h)}
                                <td
                                    style="border: 1px solid {t.border}; padding: 6px 8px; width: 70px; background-clip: padding-box; {i ===
                                    7 ? `color: ${t.accentText}; background: transparent;` : i >= 8 ? `color: ${t.textSecondary}; background: transparent;` : `background: transparent;`} {bb}"
                                ></td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>
