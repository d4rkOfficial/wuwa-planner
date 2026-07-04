<script lang="ts">
    import type { Theme } from '$lib/types'
    import { KEY_ICON_DEFS } from '$lib/data/theme-editor-constants'
    import CollapsibleSection from './CollapsibleSection.svelte'
    import StrongBadge from '../timeline/StrongBadge.svelte'

    let {
        keyIconValues,
        strongIconValue,
        theme,
        t,
        onIconFileSelected,
        onIconReset,
        onStrongIconFileSelected,
        onStrongIconReset,
    }: {
        keyIconValues: Record<string, string>
        strongIconValue: string
        theme: Theme
        t: Theme
        onIconFileSelected: (iconId: string, file: File) => void
        onIconReset: (iconId: string) => void
        onStrongIconFileSelected: (file: File) => void
        onStrongIconReset: () => void
    } = $props()
</script>

<CollapsibleSection label="按键图标" open={false}>
    <div class="grid grid-cols-2 gap-2">
        {#each KEY_ICON_DEFS as def}
            <div class="flex items-center gap-2">
                <span class="text-xs w-20 shrink-0" style="color: {t.textSecondary};"
                    >{def.label}</span
                >
                <div
                    class="w-7 h-7 shrink-0 flex items-center justify-center rounded"
                    style="border: 1px solid {t.border}; background: {t.inputBg};"
                >
                    {#if keyIconValues[def.id]}
                        <img
                            src={keyIconValues[def.id]}
                            alt={def.label}
                            class="h-5 w-5 object-contain"
                        />
                    {:else if theme.keyIcons?.[def.id]}
                        <img
                            src={theme.keyIcons[def.id]}
                            alt={def.label}
                            class="h-5 w-5 object-contain"
                            onerror={(e) => {
                                ;(e.target as HTMLElement).style.display = 'none'
                            }}
                        />
                    {:else}
                        <span class="text-[10px]" style="color: {t.mutedText};">无</span>
                    {/if}
                </div>
                <label
                    class="text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    style="color: {t.accentText}; border: 1px solid {t.accentText};"
                >
                    上传
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onchange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) onIconFileSelected(def.id, file)
                            ;(e.target as HTMLInputElement).value = ''
                        }}
                    />
                </label>
                {#if keyIconValues[def.id]}
                    <button
                        class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                        style="color: {t.dangerText};"
                        onclick={() => onIconReset(def.id)}>重置</button
                    >
                {/if}
            </div>
        {/each}
    </div>
    <div class="flex items-center gap-2 mt-1">
        <span class="text-xs min-w-20 shrink-0 truncate" style="color: {t.textSecondary};"
            >强化</span
        >
        <div
            class="w-7 h-7 shrink-0 flex items-center justify-center rounded"
            style="border: 1px solid {t.border}; background: {t.inputBg};"
        >
            {#if strongIconValue}
                <img src={strongIconValue} alt="强" class="h-5 w-5 object-contain" />
            {:else if theme.strongBadgeIcon}
                <img
                    src={theme.strongBadgeIcon}
                    alt="强"
                    class="h-5 w-5 object-contain"
                    onerror={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                    }}
                />
            {:else}
                <StrongBadge />
            {/if}
        </div>
        <label
            class="text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            style="color: {t.accentText}; border: 1px solid {t.accentText};"
        >
            上传
            <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) onStrongIconFileSelected(file)
                    ;(e.target as HTMLInputElement).value = ''
                }}
            />
        </label>
        {#if strongIconValue}
            <button
                class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                style="color: {t.dangerText};"
                onclick={onStrongIconReset}>重置</button
            >
        {/if}
    </div>
</CollapsibleSection>
