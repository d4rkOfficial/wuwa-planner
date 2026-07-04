import { ELEMENT_BORDER_COLORS } from '$lib/data/themes'
import type { CharacterPreset } from '$lib/types'
import type { ProjectData } from '$lib/types/project'

export function getAvatarSrc(
    project: ProjectData,
    slotIndex: number,
    avatarOverrides?: Record<string, string>,
): string | null {
    const char = project.characters[slotIndex]
    if (!char?.presetId) return null
    return avatarOverrides?.[char.presetId] ?? `/images/avatars/${char.presetId}.png`
}

export function getCharName(project: ProjectData, slotIndex: number): string {
    const char = project.characters[slotIndex]
    if (!char) return '?'
    return char.name.charAt(0)
}

export function getElementColor(
    project: ProjectData,
    slotIndex: number,
    presets: CharacterPreset[],
    fallbackTrack: string,
): string {
    const char = project.characters[slotIndex]
    if (!char?.presetId) return fallbackTrack
    const preset = presets.find((p) => p.id === char.presetId)
    if (!preset) return fallbackTrack
    return (ELEMENT_BORDER_COLORS[preset.element] ?? [fallbackTrack])[0]
}
