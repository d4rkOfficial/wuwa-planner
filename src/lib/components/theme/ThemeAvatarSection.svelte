<script lang="ts">
    import type { Theme } from '$lib/types'
    import CollapsibleSection from './CollapsibleSection.svelte'
    import AvatarSelect from '../character/AvatarSelect.svelte'

    let {
        avatarEntries,
        usedAvatarIds,
        showAvatarSelect,
        t,
        onAddAvatar,
        onAvatarFileSelected,
        onAvatarRemove,
        onToggleAvatarSelect,
    }: {
        avatarEntries: { presetId: string; name: string; avatarUrl: string }[]
        usedAvatarIds: string[]
        showAvatarSelect: boolean
        t: Theme
        onAddAvatar: (presetId: string) => void
        onAvatarFileSelected: (index: number, file: File) => void
        onAvatarRemove: (index: number) => void
        onToggleAvatarSelect: () => void
    } = $props()
</script>

<CollapsibleSection label="角色头像" open={false}>
    {#each avatarEntries as entry, i}
        <div class="flex items-center gap-2">
            <div
                class="w-7 h-7 shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                style="border: 1px solid {t.border}; background: {t.inputBg};"
            >
                {#if entry.avatarUrl}
                    <img
                        src={entry.avatarUrl}
                        alt={entry.name}
                        class="h-full w-full object-cover"
                    />
                {:else}
                    <img
                        src="/images/avatars/{entry.presetId}.png"
                        alt={entry.name}
                        class="h-full w-full object-cover"
                        onerror={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                        }}
                    />
                {/if}
            </div>
            <span class="text-xs flex-1" style="color: {t.text};">{entry.name}</span>
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
                        if (file) onAvatarFileSelected(i, file)
                        ;(e.target as HTMLInputElement).value = ''
                    }}
                />
            </label>
            <button
                class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                style="color: {t.dangerText};"
                onclick={() => onAvatarRemove(i)}>删除</button
            >
        </div>
    {/each}

    <button
        class="my-3 w-full rounded px-2 py-1 text-xs transition-colors"
        style="color: {t.accentText}; border: 1px solid {t.accentText};"
        onclick={onToggleAvatarSelect}
        >{#if avatarEntries.length === 0}
            + 添加第一个自定义头像
        {:else}+ 继续添加自定义头像
        {/if}</button
    >
</CollapsibleSection>

{#if showAvatarSelect}
    <AvatarSelect
        excludeIds={usedAvatarIds}
        onselect={onAddAvatar}
        onclose={onToggleAvatarSelect}
    />
{/if}
