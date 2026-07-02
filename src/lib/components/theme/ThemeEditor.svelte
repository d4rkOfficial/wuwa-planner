<script lang="ts">
    import { planner } from '$lib/stores/planner.svelte'
    import { getCharacterPresets } from '$lib/data/characters'
    import { fileToDataURI } from '$lib/utils/assets'
    import ColorRow from './ColorRow.svelte'
    import CollapsibleSection from './CollapsibleSection.svelte'
    import AvatarSelect from '../character/AvatarSelect.svelte'
    import CropDialog from './CropDialog.svelte'
    import type { Theme, CharacterPreset } from '$lib/types'

    let {
        theme,
        onsave,
        oncancel,
    }: {
        theme: Theme
        onsave: (updated: Theme) => void
        oncancel: () => void
    } = $props()

    let t = $derived(planner.theme)
    let allPresets = $derived(getCharacterPresets())

    let formData = $state<Record<string, string>>({})
    let nodeColorValues = $state<Record<string, string>>({})
    let modeColorValues = $state<Record<string, string>>({})
    let keyIconValues = $state<Record<string, string>>({})
    let avatarEntries = $state<{ presetId: string; name: string; avatarUrl: string }[]>([])
    let showAvatarSelect = $state(false)
    let showCropDialog = $state(false)
    let cropImageUrl = $state('')
    let cropTarget = $state<{ type: 'icon'; iconId: string } | { type: 'avatar'; index: number } | null>(null)

    let initialFormData = $state<Record<string, string>>({})
    let initialNodeColors = $state<Record<string, string>>({})
    let initialModeColors = $state<Record<string, string>>({})

    const KEY_ICON_DEFS = [
        { id: 'lmb', label: '左键' },
        { id: 'lmb_hold', label: '左键长按' },
        { id: 'rmb', label: '闪避' },
        { id: 'q', label: 'Q' },
        { id: 'e', label: 'E' },
        { id: 'r', label: 'R' },
        { id: 't', label: 'T' },
        { id: 'f', label: 'F / 处决' },
        { id: 'x', label: 'X / 下落' },

        { id: 'v', label: 'V / 空' },
        { id: 'intro', label: '变奏' },
        { id: 'jump', label: '跳跃' },
    ]

    const NODE_COLOR_KEYS = [
        'LMB', 'RMB', 'Q', 'E', 'R', 'T', 'F', 'X', 'V',
        'jump', 'intro', 'swap',
        'click', 'hold', 'preinput_swap', 'preinput_action', 'rapid_click',
    ]

    const MODE_COLOR_KEYS = ['hold', 'preinput_swap', 'preinput_action', 'rapid_click']

    const NODE_GROUP_BASIC = ['LMB', 'RMB', 'Q', 'E', 'R', 'T', 'F', 'X', 'V', 'jump', 'intro']
    const NODE_GROUP_MODIFIERS = ['click', 'hold', 'swap']
    const NODE_GROUP_PREINPUT = ['preinput_swap', 'preinput_action', 'rapid_click']

    const COLOR_FIELDS: (keyof Theme)[] = [
        'name', 'fontFamily',
        'background', 'trackBg', 'text', 'textSecondary', 'mutedText',
        'panelBg', 'exportBg', 'sidebarBg', 'sidebarBorder',
        'sidebarText', 'sidebarTextActive', 'sidebarHover',
        'border', 'borderLight', 'divider', 'inputBg', 'inputBorder',
        'buttonBg', 'buttonHover', 'buttonText',
        'blockBorder', 'blockCompactBorder', 'blockCompactBg',
        'diagramItemBorder', 'deleteBtnBorder', 'deleteBtnHover',
        'scrollbarTrack', 'scrollbarThumb', 'scrollbarThumbHover',
        'ringOffset', 'overlayBackdrop', 'dragOverBg',
        'selectedModeBg', 'selectedModeRing',
        'alertBtnBg', 'confirmBtnBg',
        'modalBg', 'modalBorder', 'contextBg', 'contextBorder', 'contextHover',
        'badgeText', 'avatarText', 'accentText', 'accentHover',
        'dangerText', 'dangerHover',
        'segmentLabel', 'comboText', 'strongBadgeColor',
        'tagBg', 'tagText',
        'stayField', 'wrapIndicator', 'fallbackTrack',
        'comboBg', 'comboBorder',
        'starRarity5', 'starRarity4', 'starRoverGradient',
    ]

    function getPresetName(presetId: string): string {
        return allPresets.find((p) => p.id === presetId)?.name ?? presetId
    }

    function initForm() {
        formData = {}
        for (const k of COLOR_FIELDS) {
            formData[k] = String((theme as any)[k] ?? '')
        }
        initialFormData = { ...formData }

        nodeColorValues = {}
        for (const k of NODE_COLOR_KEYS) {
            nodeColorValues[k] = theme.nodeColors[k] ?? '#888888'
        }
        initialNodeColors = { ...nodeColorValues }

        modeColorValues = {}
        for (const k of MODE_COLOR_KEYS) {
            modeColorValues[k] = theme.modeColors[k] ?? '#888888'
        }
        initialModeColors = { ...modeColorValues }

        keyIconValues = {}
        if (theme.keyIcons) {
            for (const [k, v] of Object.entries(theme.keyIcons)) {
                if (v && !v.startsWith('/')) keyIconValues[k] = v
            }
        }
        avatarEntries = []
        if (theme.avatarOverrides) {
            for (const [presetId, url] of Object.entries(theme.avatarOverrides)) {
                if (url) {
                    avatarEntries.push({ presetId, name: getPresetName(presetId), avatarUrl: url })
                }
            }
        }
    }

    initForm()

    function handleSave() {
        const updated = {
            ...theme,
            ...formData,
            nodeColors: nodeColorValues,
            modeColors: modeColorValues,
            keyIcons: { ...theme.keyIcons, ...keyIconValues },
            avatarOverrides: Object.fromEntries(
                avatarEntries.filter((e) => e.presetId).map((e) => [e.presetId, e.avatarUrl]),
            ),
            id: theme.id,
        } as Theme
        onsave(updated)
    }

    function handleIconReset(iconId: string) {
        const next = { ...keyIconValues }
        delete next[iconId]
        keyIconValues = next
    }

    async function handleIconFileSelected(iconId: string, file: File) {
        cropImageUrl = await fileToDataURI(file)
        cropTarget = { type: 'icon', iconId }
        showCropDialog = true
    }

    function handleAddAvatar(presetId: string) {
        if (avatarEntries.some((e) => e.presetId === presetId)) return
        avatarEntries = [
            ...avatarEntries,
            { presetId, name: getPresetName(presetId), avatarUrl: '' },
        ]
    }

    async function handleAvatarFileSelected(index: number, file: File) {
        cropImageUrl = await fileToDataURI(file)
        cropTarget = { type: 'avatar', index }
        showCropDialog = true
    }

    function handleAvatarRemove(index: number) {
        avatarEntries = avatarEntries.filter((_, i) => i !== index)
    }

    function handleCropResult(croppedUrl: string) {
        const t = cropTarget
        if (!t) return
        if (t.type === 'icon') {
            keyIconValues = { ...keyIconValues, [t.iconId]: croppedUrl }
        } else {
            avatarEntries = avatarEntries.map((e, i) =>
                i === t.index ? { ...e, avatarUrl: croppedUrl } : e,
            )
        }
        showCropDialog = false
        cropTarget = null
    }

    function handleCropCancel() {
        showCropDialog = false
        cropTarget = null
    }

    let usedAvatarIds = $derived(avatarEntries.map((e) => e.presetId))
</script>

<div
    class="flex flex-col gap-3 min-h-0"
    style="min-width: 440px; flex: 1; --scrollbar-track: {t.scrollbarTrack}; --scrollbar-thumb: {t.scrollbarThumb}; --scrollbar-thumb-hover: {t.scrollbarThumbHover};"
>
    <div class="flex items-center shrink-0">
        <span class="text-sm font-semibold" style="color: {t.text};">
            {theme.isBuiltin ? '基于内置主题创建新主题' : '编辑主题'}
        </span>
    </div>

    <div class="flex flex-col gap-3 overflow-y-auto min-h-0 scrollable-area" style="flex: 1;">
        <!-- 基本信息 -->
        <CollapsibleSection label="基本信息" open={true}>
            <div class="flex items-center gap-3">
                <span class="text-xs w-20 shrink-0" style="color: {t.textSecondary};">名称</span>
                <input type="text" class="flex-1 rounded border bg-transparent px-2 py-1.5 text-xs outline-none"
                    style="border-color: {t.inputBorder}; color: {t.text};" bind:value={formData.name} />
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs w-20 shrink-0" style="color: {t.textSecondary};">字体</span>
                <input type="text" class="flex-1 rounded border bg-transparent px-2 py-1.5 text-xs outline-none"
                    style="border-color: {t.inputBorder}; color: {t.text};" bind:value={formData.fontFamily} />
            </div>
        </CollapsibleSection>

        <!-- 配色 -->
        <CollapsibleSection label="配色">
            <CollapsibleSection label="核心">
                <ColorRow label="背景" bind:value={formData.background} defaultValue={initialFormData.background} theme={t} />
                <ColorRow label="轨道" bind:value={formData.trackBg} defaultValue={initialFormData.trackBg} theme={t} />
                <ColorRow label="回退轨道" bind:value={formData.fallbackTrack} defaultValue={initialFormData.fallbackTrack} theme={t} />
                <ColorRow label="面板" bind:value={formData.panelBg} defaultValue={initialFormData.panelBg} theme={t} />
                <ColorRow label="导出背景" bind:value={formData.exportBg} defaultValue={initialFormData.exportBg} theme={t} />
                <ColorRow label="文字" bind:value={formData.text} defaultValue={initialFormData.text} theme={t} />
                <ColorRow label="次要文字" bind:value={formData.textSecondary} defaultValue={initialFormData.textSecondary} theme={t} />
                <ColorRow label="弱化文字" bind:value={formData.mutedText} defaultValue={initialFormData.mutedText} theme={t} />
            </CollapsibleSection>
            <CollapsibleSection label="侧栏">
                <ColorRow label="侧栏背景" bind:value={formData.sidebarBg} defaultValue={initialFormData.sidebarBg} theme={t} />
                <ColorRow label="侧栏边框" bind:value={formData.sidebarBorder} defaultValue={initialFormData.sidebarBorder} theme={t} />
                <ColorRow label="侧栏文字" bind:value={formData.sidebarText} defaultValue={initialFormData.sidebarText} theme={t} />
                <ColorRow label="侧栏激活" bind:value={formData.sidebarTextActive} defaultValue={initialFormData.sidebarTextActive} theme={t} />
                <ColorRow label="侧栏悬停" bind:value={formData.sidebarHover} defaultValue={initialFormData.sidebarHover} theme={t} />
            </CollapsibleSection>
            <CollapsibleSection label="UI">
                <ColorRow label="边框" bind:value={formData.border} defaultValue={initialFormData.border} theme={t} />
                <ColorRow label="浅边框" bind:value={formData.borderLight} defaultValue={initialFormData.borderLight} theme={t} />
                <ColorRow label="分割线" bind:value={formData.divider} defaultValue={initialFormData.divider} theme={t} />
                <ColorRow label="段标签" bind:value={formData.segmentLabel} defaultValue={initialFormData.segmentLabel} theme={t} />
                <ColorRow label="输入框背景" bind:value={formData.inputBg} defaultValue={initialFormData.inputBg} theme={t} />
                <ColorRow label="输入框边框" bind:value={formData.inputBorder} defaultValue={initialFormData.inputBorder} theme={t} />
                <ColorRow label="按钮背景" bind:value={formData.buttonBg} defaultValue={initialFormData.buttonBg} theme={t} />
                <ColorRow label="按钮悬停" bind:value={formData.buttonHover} defaultValue={initialFormData.buttonHover} theme={t} />
                <ColorRow label="按钮文字" bind:value={formData.buttonText} defaultValue={initialFormData.buttonText} theme={t} />
                <ColorRow label="Block边框" bind:value={formData.blockBorder} defaultValue={initialFormData.blockBorder} theme={t} />
                <ColorRow label="Block紧凑边框" bind:value={formData.blockCompactBorder} defaultValue={initialFormData.blockCompactBorder} theme={t} />
                <ColorRow label="Block紧凑背景" bind:value={formData.blockCompactBg} defaultValue={initialFormData.blockCompactBg} theme={t} />
                <ColorRow label="图项边框" bind:value={formData.diagramItemBorder} defaultValue={initialFormData.diagramItemBorder} theme={t} />
                <ColorRow label="删除按钮边框" bind:value={formData.deleteBtnBorder} defaultValue={initialFormData.deleteBtnBorder} theme={t} />
                <ColorRow label="删除按钮悬停" bind:value={formData.deleteBtnHover} defaultValue={initialFormData.deleteBtnHover} theme={t} />
                <ColorRow label="滚动条轨道" bind:value={formData.scrollbarTrack} defaultValue={initialFormData.scrollbarTrack} theme={t} />
                <ColorRow label="滚动条滑块" bind:value={formData.scrollbarThumb} defaultValue={initialFormData.scrollbarThumb} theme={t} />
                <ColorRow label="滚动条悬停" bind:value={formData.scrollbarThumbHover} defaultValue={initialFormData.scrollbarThumbHover} theme={t} />
                <ColorRow label="Ring偏移" bind:value={formData.ringOffset} defaultValue={initialFormData.ringOffset} theme={t} />
            </CollapsibleSection>
            <CollapsibleSection label="弹窗/菜单">
                <ColorRow label="弹窗背景" bind:value={formData.modalBg} defaultValue={initialFormData.modalBg} theme={t} />
                <ColorRow label="弹窗边框" bind:value={formData.modalBorder} defaultValue={initialFormData.modalBorder} theme={t} />
                <ColorRow label="确认按钮" bind:value={formData.confirmBtnBg} defaultValue={initialFormData.confirmBtnBg} theme={t} />
                <ColorRow label="警告按钮" bind:value={formData.alertBtnBg} defaultValue={initialFormData.alertBtnBg} theme={t} />
                <ColorRow label="菜单背景" bind:value={formData.contextBg} defaultValue={initialFormData.contextBg} theme={t} />
                <ColorRow label="菜单边框" bind:value={formData.contextBorder} defaultValue={initialFormData.contextBorder} theme={t} />
                <ColorRow label="菜单悬停" bind:value={formData.contextHover} defaultValue={initialFormData.contextHover} theme={t} />
                <ColorRow label="遮罩" bind:value={formData.overlayBackdrop} defaultValue={initialFormData.overlayBackdrop} theme={t} />
            </CollapsibleSection>
            <CollapsibleSection label="标签/角标">
                <ColorRow label="标签背景" bind:value={formData.tagBg} defaultValue={initialFormData.tagBg} theme={t} />
                <ColorRow label="标签文字" bind:value={formData.tagText} defaultValue={initialFormData.tagText} theme={t} />
                <ColorRow label="强颜色" bind:value={formData.strongBadgeColor} defaultValue={initialFormData.strongBadgeColor} theme={t} />
                <ColorRow label="连段背景" bind:value={formData.comboBg} defaultValue={initialFormData.comboBg} theme={t} />
                <ColorRow label="连段边框" bind:value={formData.comboBorder} defaultValue={initialFormData.comboBorder} theme={t} />
                <ColorRow label="连段文字" bind:value={formData.comboText} defaultValue={initialFormData.comboText} theme={t} />
                <ColorRow label="角标文字" bind:value={formData.badgeText} defaultValue={initialFormData.badgeText} theme={t} />
                <ColorRow label="头像文字" bind:value={formData.avatarText} defaultValue={initialFormData.avatarText} theme={t} />
                <ColorRow label="星级5" bind:value={formData.starRarity5} defaultValue={initialFormData.starRarity5} theme={t} />
                <ColorRow label="星级4" bind:value={formData.starRarity4} defaultValue={initialFormData.starRarity4} theme={t} />
                <div class="flex items-center gap-3">
                    <span class="text-xs min-w-28 shrink-0 truncate" style="color: {t.textSecondary};">漂泊者渐变</span>
                    <input type="text" class="flex-1 rounded border bg-transparent px-2 py-1.5 text-xs outline-none font-mono"
                        style="border-color: {t.inputBorder}; color: {t.text};" bind:value={formData.starRoverGradient} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection label="交互">
                <ColorRow label="强调文字" bind:value={formData.accentText} defaultValue={initialFormData.accentText} theme={t} />
                <ColorRow label="强调悬停" bind:value={formData.accentHover} defaultValue={initialFormData.accentHover} theme={t} />
                <ColorRow label="危险文字" bind:value={formData.dangerText} defaultValue={initialFormData.dangerText} theme={t} />
                <ColorRow label="危险悬停" bind:value={formData.dangerHover} defaultValue={initialFormData.dangerHover} theme={t} />
                <ColorRow label="驻场" bind:value={formData.stayField} defaultValue={initialFormData.stayField} theme={t} />
                <ColorRow label="换行指示" bind:value={formData.wrapIndicator} defaultValue={initialFormData.wrapIndicator} theme={t} />
                <ColorRow label="拖放背景" bind:value={formData.dragOverBg} defaultValue={initialFormData.dragOverBg} theme={t} />
                <ColorRow label="选择模式背景" bind:value={formData.selectedModeBg} defaultValue={initialFormData.selectedModeBg} theme={t} />
                <ColorRow label="选择模式边框" bind:value={formData.selectedModeRing} defaultValue={initialFormData.selectedModeRing} theme={t} />
                <CollapsibleSection label="模式颜色">
                    {#each MODE_COLOR_KEYS as key}
                        <ColorRow label={key} bind:value={modeColorValues[key]} defaultValue={initialModeColors[key]} theme={t} />
                    {/each}
                </CollapsibleSection>
                <CollapsibleSection label="按键颜色">
                    <div class="flex flex-col gap-0">
                        <span class="text-[10px] font-semibold px-1 py-0.5" style="color: {t.mutedText};">基础操作</span>
                        {#each NODE_GROUP_BASIC as key}
                            <ColorRow label={key} bind:value={nodeColorValues[key]} defaultValue={initialNodeColors[key]} theme={t} />
                        {/each}
                    </div>
                    <div class="flex flex-col gap-0">
                        <span class="text-[10px] font-semibold px-1 py-0.5" style="color: {t.mutedText};">修饰</span>
                        {#each NODE_GROUP_MODIFIERS as key}
                            <ColorRow label={key} bind:value={nodeColorValues[key]} defaultValue={initialNodeColors[key]} theme={t} />
                        {/each}
                    </div>
                    <div class="flex flex-col gap-0">
                        <span class="text-[10px] font-semibold px-1 py-0.5" style="color: {t.mutedText};">预输入</span>
                        {#each NODE_GROUP_PREINPUT as key}
                            <ColorRow label={key} bind:value={nodeColorValues[key]} defaultValue={initialNodeColors[key]} theme={t} />
                        {/each}
                    </div>
                </CollapsibleSection>
            </CollapsibleSection>
        </CollapsibleSection>

        <!-- 按键图标 -->
        <CollapsibleSection label="按键图标" open={false}>
            <div class="grid grid-cols-2 gap-2">
            {#each KEY_ICON_DEFS as def}
                <div class="flex items-center gap-2">
                    <span class="text-xs w-20 shrink-0" style="color: {t.textSecondary};">{def.label}</span>
                    <div class="w-7 h-7 shrink-0 flex items-center justify-center rounded"
                        style="border: 1px solid {t.border}; background: {t.inputBg};">
                        {#if keyIconValues[def.id]}
                            <img src={keyIconValues[def.id]} alt={def.label} class="h-5 w-5 object-contain" />
                        {:else if theme.keyIcons?.[def.id]}
                            <img src={theme.keyIcons[def.id]} alt={def.label} class="h-5 w-5 object-contain"
                                onerror={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        {:else}
                            <span class="text-[10px]" style="color: {t.mutedText};">无</span>
                        {/if}
                    </div>
                    <label
                        class="text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        style="color: {t.accentText}; border: 1px solid {t.accentText};"
                    >
                        上传
                        <input type="file" accept="image/*" class="hidden"
                            onchange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleIconFileSelected(def.id, file);
                                (e.target as HTMLInputElement).value = '';
                            }}
                        />
                    </label>
                    {#if keyIconValues[def.id]}
                        <button
                            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                            style="color: {t.dangerText};"
                            onclick={() => handleIconReset(def.id)}
                        >重置</button>
                    {/if}
                </div>
            {/each}
            </div>
        </CollapsibleSection>

        <!-- 角色头像 -->
        <CollapsibleSection label="角色头像" open={false}>
            <button
                class="w-full rounded px-2 py-1 text-xs transition-colors"
                style="color: {t.accentText}; border: 1px solid {t.accentText};"
                onclick={() => (showAvatarSelect = true)}
            >+ 添加角色</button>
            {#each avatarEntries as entry, i}
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                        style="border: 1px solid {t.border}; background: {t.inputBg};">
                        {#if entry.avatarUrl}
                            <img src={entry.avatarUrl} alt={entry.name} class="h-full w-full object-cover" />
                        {:else}
                            <img src="/images/avatars/{entry.presetId}.png" alt={entry.name} class="h-full w-full object-cover"
                                onerror={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        {/if}
                    </div>
                    <span class="text-xs flex-1" style="color: {t.text};">{entry.name}</span>
                    <label
                        class="text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        style="color: {t.accentText}; border: 1px solid {t.accentText};"
                    >
                        上传
                        <input type="file" accept="image/*" class="hidden"
                            onchange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleAvatarFileSelected(i, file);
                                (e.target as HTMLInputElement).value = '';
                            }}
                        />
                    </label>
                    <button
                        class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                        style="color: {t.dangerText};"
                        onclick={() => handleAvatarRemove(i)}
                    >删除</button>
                </div>
            {/each}
            {#if avatarEntries.length === 0}
                <div class="text-xs py-2 text-center" style="color: {t.mutedText};">尚未添加自定义角色头像</div>
            {/if}
        </CollapsibleSection>
    </div>

    <div class="flex justify-end gap-2 shrink-0">
        <button class="rounded px-3 py-1.5 text-xs transition-colors"
            style="background: {t.buttonBg}; color: {t.buttonText}; border: 1px solid {t.border};"
            onclick={oncancel}>取消</button>
        <button class="rounded px-3 py-1.5 text-xs transition-colors"
            style="background: {t.confirmBtnBg}; color: #ffffff;"
            onclick={handleSave}>保存</button>
    </div>
</div>

{#if showAvatarSelect}
    <AvatarSelect
        excludeIds={usedAvatarIds}
        onselect={handleAddAvatar}
        onclose={() => (showAvatarSelect = false)}
    />
{/if}

{#if showCropDialog && cropImageUrl}
    <CropDialog
        imageUrl={cropImageUrl}
        outputSize={cropTarget?.type === 'icon' ? 64 : 128}
        oncrop={handleCropResult}
        oncancel={handleCropCancel}
    />
{/if}

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
