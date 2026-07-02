import type { RotationExport, Theme } from '../types'
import { embedThemeAssets } from './assets'

export function exportRotation(data: RotationExport): string {
    return JSON.stringify(data, null, 2)
}

export async function exportRotationV2(
    data: RotationExport,
    theme?: Theme,
    embedAssets = false,
): Promise<string> {
    const exportData = JSON.parse(JSON.stringify(data)) as RotationExport
    if (exportData.version === '1.0') {
        ;(exportData as any).version = '2.0'
    }
    if (theme && !theme.isBuiltin) {
        const overrides: Record<string, unknown> = {}
        const baseKeys = new Set([
            'id', 'name', 'key', 'isBuiltin', 'baseTheme', 'fontFamily',
            'nodeColors', 'modeColors', 'keyIconPath', 'keyIcons',
            'strongBadgeIcon', 'avatarOverrides',
        ])
        for (const [k, v] of Object.entries(theme)) {
            if (k === 'id' || k === 'name' || k === 'isBuiltin') continue
            if (k === 'baseTheme' || k === 'key' || k === 'fontFamily') {
                overrides[k] = v
                continue
            }
            if (!baseKeys.has(k)) {
                overrides[k] = v
            }
        }
        overrides.keyIcons = theme.keyIcons
        overrides.keyIconPath = theme.keyIconPath
        overrides.strongBadgeIcon = theme.strongBadgeIcon
        overrides.avatarOverrides = theme.avatarOverrides
        overrides.nodeColors = theme.nodeColors
        overrides.modeColors = theme.modeColors

        let processed = overrides
        if (embedAssets) {
            processed = await embedThemeAssets(processed)
        }
        ;(exportData as any).theme = {
            id: theme.id,
            name: theme.name,
            baseTheme: theme.baseTheme ?? 'dark',
            overrides: processed,
        }
    }
    return JSON.stringify(exportData, null, 2)
}

export function importRotation(json: string): RotationExport | null {
    try {
        const data = JSON.parse(json)
        if (data.version === '1.0' || data.version === '2.0') {
            return data as RotationExport
        }
        console.warn('Unknown version:', data.version)
        return data as RotationExport
    } catch (e) {
        console.error('Failed to parse rotation data:', e)
        return null
    }
}

export function downloadJSON(data: string, filename: string = 'rotation.json') {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
