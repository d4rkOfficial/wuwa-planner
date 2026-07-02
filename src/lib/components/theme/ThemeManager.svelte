<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'
    import { themeStore } from '$lib/stores/themes.svelte'
    import { dialog } from '$lib/stores/dialog.svelte'
    import { downloadJSON } from '$lib/utils/export'
    import ThemeEditor from './ThemeEditor.svelte'
    import type { Theme } from '$lib/types'

    let { onclose }: { onclose?: () => void } = $props()

    let t = $derived(planner.theme)
    let allThemes = $derived(themeStore.getAllThemes())
    let activeTheme = $derived(themeStore.getActiveTheme())
    let isActiveBuiltin = $derived(!!activeTheme.isBuiltin)

    let editingTheme = $state<Theme | null>(null)
    let showEditor = $state(false)

    function selectTheme(id: string) {
        planner.setTheme(id)
    }

    function startNewTheme() {
        showEditor = true
        editingTheme = null
    }

    function startEdit(theme: Theme) {
        editingTheme = theme
        showEditor = true
    }

    function handleSave(updated: Theme) {
        if (editingTheme && !editingTheme.isBuiltin) {
            themeStore.updateCustomTheme(editingTheme.id, updated)
        } else {
            const { id: _id, isBuiltin: _ib, ...rest } = updated
            themeStore.addCustomTheme(rest)
        }
        showEditor = false
        editingTheme = null
    }

    async function handleDelete(themeId: string) {
        const theme = allThemes.find((t) => t.id === themeId)
        if (!theme) return
        const ok = await dialog.confirm(`确定要删除主题「${theme.name}」吗？`)
        if (!ok) return
        themeStore.removeCustomTheme(themeId)
    }

    function handleCancel() {
        showEditor = false
        editingTheme = null
    }

    function handleExportTheme() {
        const active = themeStore.getActiveTheme()
        const json = JSON.stringify(active, null, 2)
        const name = active.name.replace(/[/\\?%*:|"<>]/g, '_')
        downloadJSON(json, `${name}.theme.json`)
    }

    function handleImportTheme() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return
            try {
                const text = await file.text()
                const data = JSON.parse(text)
                themeStore.addCustomTheme(data)
            } catch {
                await dialog.alert('导入失败：无效的主题文件')
            }
        }
        input.click()
    }
</script>

<div
    class="flex flex-col gap-3"
    style="min-width: 360px; max-height: 500px; --scrollbar-track: {t.scrollbarTrack}; --scrollbar-thumb: {t.scrollbarThumb}; --scrollbar-thumb-hover: {t.scrollbarThumbHover};"
>
    {#if showEditor}
        {#if editingTheme}
            <ThemeEditor
                theme={editingTheme}
                onsave={handleSave}
                oncancel={handleCancel}
            />
        {:else}
            <ThemeEditor
                theme={themeStore.getTheme('dark')!}
                onsave={handleSave}
                oncancel={handleCancel}
            />
        {/if}
    {:else}
        <div class="flex flex-col gap-1 overflow-y-auto min-h-0 scrollable-area" style="flex: 1;">
            {#each allThemes as theme}
                <div
                    class="flex items-center gap-2 rounded px-3 py-2 cursor-pointer transition-colors"
                    style="background: {themeStore.activeThemeId === theme.id ? t.selectedModeBg : 'transparent'}; border: 1px solid {themeStore.activeThemeId === theme.id ? t.selectedModeRing : 'transparent'};"
                    onclick={() => selectTheme(theme.id)}
                    onkeydown={(e) => e.key === 'Enter' && selectTheme(theme.id)}
                    role="option"
                    aria-selected={themeStore.activeThemeId === theme.id}
                    tabindex="0"
                >
                    <div
                        class="w-4 h-4 rounded-full shrink-0"
                        style="background: {theme.background}; border: 1px solid {theme.border};"
                    ></div>
                    <span class="text-xs font-medium flex-1" style="color: {t.text};">
                        {theme.name}
                        {#if theme.isBuiltin}
                            <span class="text-[10px]" style="color: {t.mutedText};">(内置)</span>
                        {/if}
                    </span>
                    {#if themeStore.activeThemeId === theme.id}
                        <span class="text-[10px]" style="color: {t.accentText};">使用中</span>
                    {/if}
                </div>
            {/each}
        </div>
        {#if onclose}
            <div class="shrink-0" style="border-top: 1px solid {t.divider};"></div>
            <div class="flex items-center justify-between shrink-0 pt-1">
                <div class="flex items-center gap-0">
                    {#if !isActiveBuiltin}
                        <button class="px-1.5 py-0.5 text-[11px] transition-colors rounded"
                            style="color: {t.dangerText};"
                            onmouseenter={(e) => (e.currentTarget.style.opacity = '0.7')}
                            onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
                            onclick={() => handleDelete(activeTheme.id)}>删除</button>
                        <button class="px-1.5 py-0.5 text-[11px] transition-colors rounded"
                            style="color: {t.textSecondary};"
                            onmouseenter={(e) => (e.currentTarget.style.color = t.text)}
                            onmouseleave={(e) => (e.currentTarget.style.color = t.textSecondary)}
                            onclick={() => startEdit(activeTheme)}>编辑</button>
                        <button class="px-1.5 py-0.5 text-[11px] transition-colors rounded"
                            style="color: {t.textSecondary};"
                            onmouseenter={(e) => (e.currentTarget.style.color = t.text)}
                            onmouseleave={(e) => (e.currentTarget.style.color = t.textSecondary)}
                            onclick={handleExportTheme}>导出</button>
                    {/if}
                </div>
                <div class="flex items-center gap-0">
                    <button class="px-1.5 py-0.5 text-[11px] transition-colors rounded"
                        style="color: {t.textSecondary};"
                        onmouseenter={(e) => (e.currentTarget.style.color = t.text)}
                        onmouseleave={(e) => (e.currentTarget.style.color = t.textSecondary)}
                        onclick={handleImportTheme}>导入</button>
                    <button class="px-1.5 py-0.5 text-[11px] transition-colors rounded"
                        style="color: {t.accentText};"
                        onmouseenter={(e) => (e.currentTarget.style.opacity = '0.7')}
                        onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
                        onclick={startNewTheme}>+ 新建</button>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .scrollable-area::-webkit-scrollbar {
        width: 6px;
    }
    .scrollable-area::-webkit-scrollbar-track {
        background: var(--scrollbar-track, #27272a);
    }
    .scrollable-area::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb, #3f3f46);
        border-radius: 3px;
    }
    .scrollable-area::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover, #52525b);
    }
</style>
