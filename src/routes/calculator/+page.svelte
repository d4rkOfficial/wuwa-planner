<script lang="ts">
    import { onMount } from 'svelte'
    import { planner } from '$lib/stores/planner.svelte'
    import { projects } from '$lib/stores/projects.svelte'

    onMount(() => {
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

    let t = $derived(planner.theme)
</script>

<div class="flex flex-col h-dvh" style="background: {t.background}; color: {t.text};">
    <div
        class="flex shrink-0 items-center justify-between px-5 py-3"
        style="border-bottom: 1px solid {t.border};"
    >
        <div class="flex items-center gap-3">
            <span class="text-sm font-black" style="color: {t.text};">{planner.title}</span>
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
    <div class="flex-1 min-h-0 flex items-center justify-center">
        <span class="text-xs" style="color: {t.mutedText};">开发中...</span>
    </div>
</div>
