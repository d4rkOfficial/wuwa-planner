import type { Theme } from '$lib/types'

export interface KeyIconDef {
    id: string
    label: string
}

export const KEY_ICON_DEFS: KeyIconDef[] = [
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

export const NODE_COLOR_KEYS = [
    'LMB',
    'RMB',
    'Q',
    'E',
    'R',
    'T',
    'F',
    'X',
    'V',
    'jump',
    'intro',
    'swap',
    'click',
    'hold',
    'preinput_swap',
    'preinput_action',
    'rapid_click',
]

export const MODE_COLOR_KEYS = ['hold', 'preinput_swap', 'preinput_action', 'rapid_click']

export const NODE_GROUP_BASIC = ['LMB', 'RMB', 'Q', 'E', 'R', 'T', 'F', 'X', 'V', 'jump', 'intro']
export const NODE_GROUP_MODIFIERS = ['click', 'hold', 'swap']
export const NODE_GROUP_PREINPUT = ['preinput_swap', 'preinput_action', 'rapid_click']

export const COLOR_FIELDS: (keyof Theme)[] = [
    'name',
    'fontFamily',
    'background',
    'trackBg',
    'text',
    'textSecondary',
    'mutedText',
    'panelBg',
    'exportBg',
    'sidebarBg',
    'sidebarBorder',
    'sidebarText',
    'sidebarTextActive',
    'sidebarHover',
    'border',
    'borderLight',
    'divider',
    'inputBg',
    'inputBorder',
    'buttonBg',
    'buttonHover',
    'buttonText',
    'blockBorder',
    'blockCompactBorder',
    'blockCompactBg',
    'diagramItemBorder',
    'deleteBtnBorder',
    'deleteBtnHover',
    'scrollbarTrack',
    'scrollbarThumb',
    'scrollbarThumbHover',
    'ringOffset',
    'overlayBackdrop',
    'dragOverBg',
    'selectedModeBg',
    'selectedModeRing',
    'alertBtnBg',
    'confirmBtnBg',
    'modalBg',
    'modalBorder',
    'contextBg',
    'contextBorder',
    'contextHover',
    'badgeText',
    'avatarText',
    'accentText',
    'accentHover',
    'dangerText',
    'dangerHover',
    'segmentLabel',
    'comboText',
    'tagBg',
    'tagText',
    'stayField',
    'wrapIndicator',
    'fallbackTrack',
    'comboBg',
    'comboBorder',
    'starRarity5',
    'starRarity4',
    'starRoverGradient',
]

export function getPresetName(presets: { id: string; name: string }[], presetId: string): string {
    return presets.find((p) => p.id === presetId)?.name ?? presetId
}
