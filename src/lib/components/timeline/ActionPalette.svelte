<script lang="ts">
    import type { KeyType, KeyMode, Theme } from '$lib/types'
    import {
        KEY_TYPES,
        MODE_OPTIONS,
        setComboA as calcComboA,
        setComboB as calcComboB,
    } from '$lib/data/action-palette'
    import KeyIcon from './KeyIcon.svelte'
    import StrongBadge from './StrongBadge.svelte'

    let {
        theme,
        selectedKey = $bindable('Q'),
        selectedMode = $bindable('click'),
        comboA = $bindable(0),
        comboB = $bindable(0),
        strong = $bindable(false),
        comment = $bindable(''),
        compact = false,
        superCompact = false,
        keySingleRow = false,
    }: {
        theme: Theme
        selectedKey?: KeyType
        selectedMode?: KeyMode
        comboA?: number
        comboB?: number
        strong?: boolean
        comment?: string
        compact?: boolean
        superCompact?: boolean
        keySingleRow?: boolean
    } = $props()

    function setComboA(v: number) {
        const r = calcComboA(v, { comboA, comboB })
        comboA = r.comboA
        comboB = r.comboB
    }

    function setComboB(v: number) {
        const r = calcComboB(v, { comboA, comboB })
        comboB = r.comboB
        comboA = r.comboA
    }

    function resetCombo() {
        comboA = 0
        comboB = 0
    }

    $effect(() => {
        void selectedKey
        void selectedMode
        resetCombo()
        comment = ''
        strong = false
    })

    function startDrag(e: DragEvent) {
        const data = JSON.stringify({
            key: selectedKey,
            mode: selectedMode,
            comboA,
            comboB,
            strong,
            comment,
        })
        e.dataTransfer?.setData('application/wuwa-keyop', data)
        e.dataTransfer!.effectAllowed = 'copy'
    }
</script>

{#if superCompact}
    <div
        class="flex h-full flex-col rounded-lg p-2"
        style="border: 1px solid {theme.border}; background: {theme.panelBg};"
    >
        <div
            class="flex-1 grid min-h-0"
            style="grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; gap: 4px;"
        >
            <!-- 左: 按键 5列×2行 -->
            <div class="flex flex-col min-h-0 overflow-hidden p-1" style="grid-row: span 2;">
                <span
                    class="mb-1.5 text-[10px] font-semibold leading-none hidden"
                    style="color: {theme.textSecondary};">按键</span
                >
                <div class="grid grid-cols-5 gap-1.5 flex-1">
                    {#each KEY_TYPES as kt}
                        <button
                            class="flex items-center justify-center rounded transition-colors py-1"
                            style="border: 1px solid {theme.nodeColors[kt.key] ??
                                theme.fallbackTrack}{selectedKey === kt.key
                                ? '80'
                                : '40'}; background: {selectedKey === kt.key
                                ? (theme.nodeColors[kt.key] ?? theme.fallbackTrack) + '25'
                                : 'transparent'}; color: {theme.text}; {selectedKey === kt.key
                                ? `box-shadow: 0 0 0 1.5px ${theme.nodeColors[kt.key] ?? theme.fallbackTrack};`
                                : ''}"
                            onclick={() => (selectedKey = kt.key)}
                        >
                            <KeyIcon
                                key={kt.key}
                                size="sm"
                                color={theme.nodeColors[kt.key]}
                                mode={selectedKey === 'LMB' ? selectedMode : undefined}
                            />
                        </button>
                    {/each}
                </div>
            </div>
            <!-- 右上: 连段(上) + 特殊(下) -->
            <div class="flex flex-col gap-1.5 min-h-0 overflow-hidden p-1">
                <div class="flex flex-col min-w-0 overflow-hidden p-1">
                    <span
                        class="mb-1.5 text-[10px] font-semibold leading-none hidden"
                        style="color: {theme.textSecondary};">连段</span
                    >
                    <div
                        class="flex items-center gap-1.5 flex-nowrap whitespace-nowrap"
                        style="color: {theme.textSecondary}; font-size: 11px;"
                    >
                        <button
                            class="flex h-4 w-4 items-center justify-center rounded border font-bold shrink-0"
                            style="border-color: {theme.border}; color: {theme.textSecondary}; font-size: 11px;"
                            onclick={() => setComboA(Math.max(0, comboA - 1))}>−</button
                        >
                        <span
                            class="inline-flex min-w-[16px] items-center justify-center rounded border font-bold leading-none shrink-0"
                            style="border-color: {theme.accentText}; color: {theme.accentText}; background: {theme.selectedModeBg}; font-size: 11px; padding: 1px 3px;"
                            >{comboA}</span
                        >
                        <button
                            class="flex h-4 w-4 items-center justify-center rounded border font-bold shrink-0"
                            style="border-color: {theme.border}; color: {theme.textSecondary}; font-size: 11px;"
                            onclick={() => setComboA(comboA + 1)}>+</button
                        >
                        <span>至</span>
                        <button
                            class="flex h-4 w-4 items-center justify-center rounded border font-bold shrink-0"
                            style="border-color: {theme.border}; color: {theme.textSecondary}; font-size: 11px;"
                            onclick={() => setComboB(Math.max(0, comboB - 1))}>−</button
                        >
                        <span
                            class="inline-flex min-w-[16px] items-center justify-center rounded border font-bold leading-none shrink-0"
                            style="border-color: {theme.accentText}; color: {theme.accentText}; background: {theme.selectedModeBg}; font-size: 11px; padding: 1px 3px;"
                            >{comboB}</span
                        >
                        <button
                            class="flex h-4 w-4 items-center justify-center rounded border font-bold shrink-0"
                            style="border-color: {theme.border}; color: {theme.textSecondary}; font-size: 11px;"
                            onclick={() => setComboB(comboB + 1)}>+</button
                        >
                        <span>段</span>
                    </div>
                </div>
                <div class="flex flex-col min-w-0 overflow-hidden p-1">
                    <span
                        class="mb-1.5 text-[10px] font-semibold leading-none hidden"
                        style="color: {theme.textSecondary};">特殊</span
                    >
                    <div class="flex items-center gap-1.5 overflow-hidden">
                        <button
                            class="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors"
                            style="border-color: {strong
                                ? theme.accentText
                                : theme.border}; background: {strong
                                ? theme.selectedModeBg
                                : 'transparent'}; color: {strong
                                ? theme.accentText
                                : theme.textSecondary};"
                            onclick={() => (strong = !strong)}
                            title="强化"><StrongBadge size={11} /></button
                        >
                        <input
                            type="text"
                            class="min-w-0 flex-1 rounded border bg-transparent px-2 py-1 outline-none"
                            style="border-color: {theme.border}; color: {theme.text}; font-size: 11px;"
                            placeholder="备注"
                            value={comment}
                            oninput={(e) => {
                                const v = (e.target as HTMLInputElement).value.replace(/\s/g, '')
                                comment = v
                                ;(e.target as HTMLInputElement).value = v
                            }}
                        />
                    </div>
                </div>
            </div>
            <!-- 右下: 模式 一行5列 -->
            <div class="flex flex-col min-h-0 overflow-hidden p-1">
                <span
                    class="mb-1.5 text-[10px] font-semibold leading-none hidden"
                    style="color: {theme.textSecondary};">模式</span
                >
                <div class="grid grid-cols-5 gap-1.5 flex-1">
                    {#each MODE_OPTIONS as m}
                        <button
                            class="flex items-center justify-center rounded transition-colors"
                            style="border: 1px solid {selectedMode === m.key
                                ? theme.accentText
                                : theme.border}; color: {theme.text}; background: {selectedMode ===
                            m.key
                                ? theme.selectedModeBg
                                : 'transparent'}; {selectedMode === m.key
                                ? `box-shadow: 0 0 0 1.5px ${theme.selectedModeRing};`
                                : ''} font-size: 10px; padding: 4px 6px;"
                            onclick={() => (selectedMode = m.key)}
                            ><span class="font-bold leading-tight">{m.title}</span></button
                        >
                    {/each}
                </div>
            </div>
        </div>
    </div>
{:else}
    <div
        class="flex h-full flex-col rounded-lg p-2 sm:p-3"
        style="border: 1px solid {theme.border}; background: {theme.panelBg};"
    >
        <div class="mb-1.5 flex items-center justify-between shrink-0">
            <h3
                class="text-xs sm:text-sm font-bold uppercase tracking-wider"
                style="color: {theme.textSecondary};"
            >
                操作面板
            </h3>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="hidden md:flex cursor-grab items-center gap-0.5 rounded border border-dashed px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium transition-colors active:cursor-grabbing"
                style="border-color: {theme.border}; color: {theme.textSecondary};"
                onmouseenter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = theme.text
                    ;(e.currentTarget as HTMLElement).style.color = theme.text
                }}
                onmouseleave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = theme.border
                    ;(e.currentTarget as HTMLElement).style.color = theme.textSecondary
                }}
                draggable="true"
                ondragstart={startDrag}
            >
                <span style="color: {theme.textSecondary};">⠿</span>
                <span class="hidden sm:inline">拖动入轴</span>
            </div>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto scrollbar-dark">
            <div class="flex flex-col gap-1 sm:gap-2">
                <div>
                    <span
                        class="mb-1 block sm:mb-1.5 text-[11px] sm:text-xs font-semibold"
                        style="color: {theme.textSecondary};">按键</span
                    >
                    <div
                        class="px-1 sm:px-1.5 grid {keySingleRow
                            ? 'grid-cols-10'
                            : 'grid-cols-3 sm:grid-cols-5'} gap-1 sm:gap-1.5"
                    >
                        {#each KEY_TYPES as kt}
                            <button
                                class="flex items-stretch gap-1 rounded px-1 py-1.5 sm:gap-1.5 sm:px-1.5 sm:py-2 transition-colors"
                                style="
							border: 1px solid {theme.nodeColors[kt.key] ?? theme.fallbackTrack}{selectedKey === kt.key
                                    ? '80'
                                    : '40'};
							background: {selectedKey === kt.key
                                    ? (theme.nodeColors[kt.key] ?? theme.fallbackTrack) + '25'
                                    : 'transparent'};
							color: {theme.text};
							{selectedKey === kt.key
                                    ? `box-shadow: 0 0 0 2px ${theme.nodeColors[kt.key] ?? theme.fallbackTrack};`
                                    : ''}
						"
                                onclick={() => (selectedKey = kt.key)}
                            >
                                <div
                                    class="flex items-center justify-center shrink-0 aspect-square"
                                >
                                    <KeyIcon
                                        key={kt.key}
                                        size="md"
                                        color={theme.nodeColors[kt.key]}
                                        mode={selectedKey === 'LMB' ? selectedMode : undefined}
                                    />
                                </div>
                                <span
                                    class="flex items-center font-bold leading-tight {keySingleRow
                                        ? 'hidden'
                                        : ''} {compact ? 'text-[8px]' : 'text-[10px] sm:text-xs'}"
                                    style="color: {theme.textSecondary};">{kt.desc}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div class="flex-3 min-w-0">
                        <span
                            class="mb-1 block sm:mb-1.5 text-[11px] sm:text-xs font-semibold"
                            style="color: {theme.textSecondary};">连段</span
                        >
                        {#snippet comboControls()}
                            <div class="flex items-center gap-1 flex-wrap px-1 sm:px-1.5">
                                <span
                                    class="text-[11px] font-medium shrink-0"
                                    style="color: {theme.textSecondary};">从第</span
                                >
                                <button
                                    class="flex h-6 w-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.border}; color: {theme.textSecondary};"
                                    onclick={() => setComboA(Math.max(0, comboA - 1))}>−</button
                                >
                                <div
                                    class="flex h-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.accentText}; color: {theme.accentText}; background: {theme.selectedModeBg}; min-width: 24px; padding: 0 5px;"
                                >
                                    {comboA}
                                </div>
                                <button
                                    class="flex h-6 w-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.border}; color: {theme.textSecondary};"
                                    onclick={() => setComboA(comboA + 1)}>+</button
                                >
                                <span
                                    class="text-[11px] font-medium shrink-0"
                                    style="color: {theme.textSecondary};">段至第</span
                                >
                                <button
                                    class="flex h-6 w-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.border}; color: {theme.textSecondary};"
                                    onclick={() => setComboB(comboB - 1)}>−</button
                                >
                                <div
                                    class="flex h-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.accentText}; color: {theme.accentText}; background: {theme.selectedModeBg}; min-width: 24px; padding: 0 5px;"
                                >
                                    {comboB}
                                </div>
                                <button
                                    class="flex h-6 w-6 items-center justify-center rounded border text-xs font-bold shrink-0"
                                    style="border-color: {theme.border}; color: {theme.textSecondary};"
                                    onclick={() => setComboB(comboB + 1)}>+</button
                                >
                                <span
                                    class="text-[11px] font-medium shrink-0"
                                    style="color: {theme.textSecondary};">段</span
                                >
                                <button
                                    class="rounded border px-2.5 py-1 text-[11px] font-medium shrink-0 transition-colors {compact
                                        ? 'hidden'
                                        : ''}"
                                    style="border-color: {theme.border}; color: {theme.mutedText};"
                                    onmouseenter={(e) => {
                                        ;(e.currentTarget as HTMLElement).style.background =
                                            theme.buttonHover
                                    }}
                                    onmouseleave={(e) => {
                                        ;(e.currentTarget as HTMLElement).style.background = ''
                                    }}
                                    onclick={resetCombo}>重置连段</button
                                >
                            </div>
                        {/snippet}
                        {@render comboControls()}
                    </div>

                    <div class="flex-2 min-w-0">
                        <span
                            class="mb-1 block sm:mb-1.5 text-[11px] sm:text-xs font-semibold"
                            style="color: {theme.textSecondary};">特殊</span
                        >
                        <div class="flex items-center gap-2 flex-wrap px-1 sm:px-1.5">
                            <button
                                class="flex h-7 w-7 items-center justify-center rounded border text-xs font-bold transition-colors"
                                style="border-color: {strong
                                    ? theme.accentText
                                    : theme.border}; background: {strong
                                    ? theme.selectedModeBg
                                    : 'transparent'}; color: {strong
                                    ? theme.accentText
                                    : theme.textSecondary};"
                                onclick={() => (strong = !strong)}
                                title="强化"
                            >
                                <StrongBadge size={16} />
                            </button>
                            <div class="flex items-center gap-1 flex-1 min-w-20">
                                <input
                                    type="text"
                                    class="flex-1 rounded border bg-transparent px-2 py-1 text-xs font-medium outline-none"
                                    style="border-color: {theme.border}; color: {theme.text};"
                                    placeholder="备注"
                                    value={comment}
                                    oninput={(e) => {
                                        const v = (e.target as HTMLInputElement).value.replace(
                                            /\s/g,
                                            '',
                                        )
                                        comment = v
                                        ;(e.target as HTMLInputElement).value = v
                                    }}
                                />
                                <button
                                    class="rounded border px-1.5 py-1 text-[10px] font-medium shrink-0 transition-colors {compact
                                        ? 'hidden'
                                        : ''}"
                                    style="border-color: {theme.border}; color: {theme.mutedText};"
                                    onmouseenter={(e) => {
                                        ;(e.currentTarget as HTMLElement).style.background =
                                            theme.buttonHover
                                    }}
                                    onmouseleave={(e) => {
                                        ;(e.currentTarget as HTMLElement).style.background = ''
                                    }}
                                    onclick={() => (comment = '')}
                                    title="清除备注">清空</button
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <span
                        class="mb-1 block sm:mb-1.5 text-[11px] sm:text-xs font-semibold"
                        style="color: {theme.textSecondary};">模式</span
                    >
                    <div class="px-1 sm:px-1.5 grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-1.5">
                        {#each MODE_OPTIONS as m}
                            <button
                                class={'flex flex-col items-center justify-center gap-0.5 rounded px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-sm transition-colors ' +
                                    (selectedMode === m.key ? '' : '')}
                                style="border: 1px solid {selectedMode === m.key
                                    ? theme.accentText
                                    : theme.border}; color: {theme.text}; background: {selectedMode ===
                                m.key
                                    ? theme.selectedModeBg
                                    : 'transparent'}; {selectedMode === m.key
                                    ? `box-shadow: 0 0 0 2px ${theme.selectedModeRing};`
                                    : ''}"
                                onclick={() => (selectedMode = m.key)}
                            >
                                <span class="font-bold leading-tight text-center">{m.title}</span>
                                <span
                                    class="text-[10px] sm:text-xs font-medium leading-tight text-center {compact
                                        ? 'hidden'
                                        : 'hidden sm:block'}"
                                    style="color: {theme.textSecondary};">{m.desc}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
