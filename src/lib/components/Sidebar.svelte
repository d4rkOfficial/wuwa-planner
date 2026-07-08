<script lang="ts">
    import { onMount } from 'svelte'
    import { projects } from '$lib/stores/projects.svelte'
    import { planner } from '$lib/stores/planner.svelte'
    import { dialog } from '$lib/stores/dialog.svelte'
    import { getCharacterPresets } from '$lib/data/characters'
    import { exportRotation, importRotation } from '$lib/utils/export'
    import { downloadJSON } from '$lib/utils/download'
    import {
        getAvatarSrc as getAvatarSrcUtil,
        getCharName as getCharNameUtil,
        getElementColor as getElementColorUtil,
    } from '$lib/utils/sidebar'
    import type { ProjectData } from '$lib/types/project'

    let {
        collapsed = false,
        ontoggle,
        overlay = false,
        onclose,
    }: {
        collapsed?: boolean
        ontoggle?: () => void
        overlay?: boolean
        onclose?: () => void
    } = $props()

    let isTouch = $state(false)
    let renamingId = $state<string | null>(null)
    let renameValue = $state('')
    let menuTarget = $state<{ id: string; x: number; y: number } | null>(null)
    let menuAdjX = $state(0)
    let menuAdjY = $state(0)
    let menuRef = $state<HTMLDivElement>()
    let fileInput: HTMLInputElement

    onMount(() => {
        isTouch = 'ontouchstart' in window
    })

    let presets = $derived(getCharacterPresets())
    let t = $derived(planner.theme)

    function getAvatarSrc(project: ProjectData, slotIndex: number): string | null {
        return getAvatarSrcUtil(project, slotIndex, planner.theme.avatarOverrides)
    }

    function getCharName(project: ProjectData, slotIndex: number): string {
        return getCharNameUtil(project, slotIndex)
    }

    function handleSelect(id: string) {
        if (id === projects.activeId) return
        projects.loadProjectToPlanner(id)
    }

    function handleRenameStart(id: string, current: string) {
        renamingId = id
        renameValue = current
    }
    function handleRenameConfirm() {
        if (renamingId && renameValue.trim()) {
            projects.renameProject(renamingId, renameValue.trim())
        }
        renamingId = null
    }
    function handleRenameKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') handleRenameConfirm()
        if (e.key === 'Escape') renamingId = null
    }

    function handleNewProject() {
        const id = projects.addProject('未命名轴')
        projects.loadProjectToPlanner(id)
        planner.initDefaults()
        projects.syncPlannerToActive()
    }

    function handleContextMenu(e: MouseEvent, id: string) {
        e.preventDefault()
        e.stopPropagation()
        menuTarget = { id, x: e.clientX, y: e.clientY }
    }
    function handleMenuClick(e: MouseEvent, id: string) {
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        menuTarget = { id, x: rect.left - 80, y: rect.bottom + 4 }
    }

    function handleExportJSON(id: string) {
        syncAndLoad(id)
        const data = planner.exportRotation()
        const json = exportRotation(data)
        const proj = projects.projects.find((p) => p.id === id)
        downloadJSON(json, `${proj?.title || 'rotation'}.json`)
        menuTarget = null
    }

    function handleImportProjectJSON() {
        fileInput?.click()
    }
    function handleFileSelected(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async () => {
            try {
                const data = importRotation(reader.result as string)
                if (!data) {
                    await dialog.alert('导入失败：无法解析文件格式')
                    return
                }
                const id = projects.addProject(data.metadata.title || '导入的工程')
                planner.importRotation(data)
                projects.setActiveId(id)
                projects.syncPlannerToActive()
            } catch {
                await dialog.alert('导入失败：文件格式错误')
            }
        }
        reader.readAsText(file)
        ;(e.target as HTMLInputElement).value = ''
    }

    function syncAndLoad(id: string) {
        if (id === projects.activeId) {
            projects.syncPlannerToActive()
        } else {
            projects.loadProjectToPlanner(id)
        }
    }

    async function handleDeleteProject(id: string) {
        if (projects.projects.length <= 1) return
        const title = projects.projects.find((p) => p.id === id)?.title
        const ok = await dialog.confirm(`确认删除工程「${title}」？`)
        if (!ok) return
        projects.deleteProject(id)
        menuTarget = null
    }

    function handleDuplicateProject(id: string) {
        projects.duplicateProject(id)
        menuTarget = null
    }

    function getElementColor(project: ProjectData, slotIndex: number): string {
        return getElementColorUtil(project, slotIndex, presets, t.fallbackTrack)
    }

    $effect(() => {
        if (!menuTarget) {
            menuAdjX = 0
            menuAdjY = 0
            return
        }
        const m = menuTarget
        menuAdjX = m.x
        menuAdjY = m.y
        requestAnimationFrame(() => {
            if (!menuRef) return
            const r = menuRef.getBoundingClientRect()
            menuAdjX = Math.max(4, Math.min(m.x, innerWidth - r.width - 4))
            menuAdjY = Math.max(4, Math.min(m.y, innerHeight - r.height - 4))
        })
    })

    function handleDocClick() {
        menuTarget = null
    }
</script>

<svelte:window onclick={handleDocClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="flex h-dvh flex-col overflow-hidden transition-all duration-200"
    style="width: {collapsed && !overlay
        ? '0px'
        : '220px'}; flex-shrink: 0; background: {t.sidebarBg}; border-right: 1px solid {t.sidebarBorder}; {overlay
        ? 'position: fixed; left: 0; top: 0; z-index: 50; box-shadow: 4px 0 20px rgba(0,0,0,0.3);'
        : collapsed
          ? 'overflow: hidden;'
          : ''};"
    oncontextmenu={(e) => e.preventDefault()}
>
    <div
        class="shrink-0 px-4 py-3"
        class:hidden={collapsed}
        style="border-bottom: 1px solid {t.sidebarBorder};"
    >
        <h1 class="text-sm font-bold" style="color: {t.sidebarTextActive};">鸣潮椰果排轴工具</h1>
    </div>

    <div class="flex-1 overflow-y-auto" class:hidden={collapsed} style="scrollbar-width: thin;">
        {#each projects.projects as proj (proj.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            {@const isActive = proj.id === projects.activeId}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class="cursor-pointer px-3 py-2 transition-colors"
                style="border-bottom: 1px solid {t.divider}; background: {isActive
                    ? t.sidebarHover
                    : 'transparent'};"
                onmouseenter={(e) => {
                    if (!isActive)
                        (e.currentTarget as HTMLElement).style.background = t.sidebarHover
                }}
                onmouseleave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
                onclick={() => handleSelect(proj.id)}
                oncontextmenu={(e) => handleContextMenu(e, proj.id)}
                ondblclick={isTouch ? (e) => handleContextMenu(e, proj.id) : undefined}
            >
                {#if renamingId === proj.id}
                    <!-- svelte-ignore a11y_autofocus -->
                    <input
                        type="text"
                        bind:value={renameValue}
                        class="mb-1 w-full rounded px-1.5 py-0.5 text-xs"
                        style="border: 1px solid {t.inputBorder}; background: {t.inputBg}; color: {t.text};"
                        onkeydown={handleRenameKeydown}
                        onblur={handleRenameConfirm}
                        autofocus
                    />
                {:else}
                    <div
                        class="mb-1 truncate text-xs {proj.title ? 'font-bold' : ''}"
                        style="color: {isActive ? t.sidebarTextActive : t.sidebarText};"
                        ondblclick={isTouch
                            ? undefined
                            : () => handleRenameStart(proj.id, proj.title)}
                    >
                        {proj.title || '无名称'}
                    </div>
                {/if}

                <div class="mb-1.5 flex items-center gap-1">
                    {#each [0, 1, 2] as slot}
                        <div
                            class="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold"
                            style="border: 1.5px solid {getElementColor(proj, slot)};"
                        >
                            {#if getAvatarSrc(proj, slot)}
                                <img
                                    src={getAvatarSrc(proj, slot)}
                                    alt=""
                                    class="absolute inset-0 h-full w-full object-cover"
                                    onerror={(e) =>
                                        ((e.target as HTMLElement).style.display = 'none')}
                                />
                            {/if}
                            <span style="color: {t.avatarText};">{getCharName(proj, slot)}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div
        class="p-3 flex flex-col gap-1.5 shrink-0"
        class:hidden={collapsed}
        style="border-top: 1px solid {t.sidebarBorder};"
    >
        <button
            class="font-black w-full rounded py-2 sm:py-1.5 text-xs transition-colors min-h-[36px]"
            style="background: {t.buttonBg}; color: {t.buttonText}; border: 1px solid {t.buttonHover};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.buttonHover)}
            onmouseleave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = t.buttonBg
            }}
            onclick={handleNewProject}>创建空白工程</button
        >
        <button
            class="font-black w-full rounded py-2 sm:py-1.5 text-xs transition-colors min-h-[36px]"
            style="background: {t.buttonBg}; color: {t.buttonText}; border: 1px solid {t.buttonHover};"
            onmouseenter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.buttonHover)}
            onmouseleave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = t.buttonBg
            }}
            onclick={handleImportProjectJSON}>从 JSON 导入工程</button
        >
    </div>
</div>

<input
    type="file"
    accept=".json"
    class="hidden"
    bind:this={fileInput}
    onchange={handleFileSelected}
/>

{#if overlay}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="fixed inset-0 z-40"
        style="background: {t.overlayBackdrop};"
        onclick={() => onclose?.()}
    ></div>
{/if}

{#snippet projectContextMenu()}
    {#if menuTarget}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            bind:this={menuRef}
            class="fixed z-50 w-40 rounded-lg py-1 shadow-xl"
            style="left: {menuAdjX}px; top: {menuAdjY}px; border: 1px solid {t.contextBorder}; background: {t.contextBg};"
            onclick={() => {}}
        >
            <button
                class="flex w-full items-center px-3 py-2 text-left text-xs transition-colors"
                style="color: {t.text};"
                onmouseenter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = t.contextHover)}
                onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                onclick={() => handleExportJSON(menuTarget!.id)}>导出 JSON</button
            >
            <div style="border-top: 1px solid {t.divider};"></div>
            <button
                class="flex w-full items-center px-3 py-2 text-left text-xs transition-colors"
                style="color: {t.text};"
                onmouseenter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = t.contextHover)}
                onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                onclick={() => handleDuplicateProject(menuTarget!.id)}>复制工程</button
            >
            <button
                class="flex w-full items-center px-3 py-2 text-left text-xs transition-colors"
                style="color: {t.dangerText};"
                class:hidden={projects.projects.length <= 1}
                onmouseenter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = t.dangerHover)}
                onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                onclick={() => handleDeleteProject(menuTarget!.id)}>删除工程</button
            >
        </div>
    {/if}
{/snippet}
{@render projectContextMenu()}
