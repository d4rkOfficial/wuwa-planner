import type { CharacterPreset, ElementType } from '$lib/types'
import { customPresetsStore } from '$lib/stores/customPresets.svelte'

let _cache: CharacterPreset[] | null = null

function isRover(preset: CharacterPreset): boolean {
    return preset.id.startsWith('piaoBoZhe')
}

function sortPresets(presets: CharacterPreset[]): CharacterPreset[] {
    return presets.sort((a, b) => {
        const aRover = isRover(a)
        const bRover = isRover(b)
        if (aRover && !bRover) return -1
        if (!aRover && bRover) return 1
        if (a.rarity !== b.rarity) return b.rarity - a.rarity
        return a.id.toLowerCase().localeCompare(b.id.toLowerCase())
    })
}

function parseCSV(text: string): CharacterPreset[] {
    const lines = text.trim().split('\n')
    const presets: CharacterPreset[] = []
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const cols = line.split(',')
        if (cols.length < 7) continue
        presets.push({
            id: cols[0],
            name: cols[1],
            nameEn: cols[2],
            aliases: cols[6].split('|'),
            element: cols[3] as ElementType,
            weaponType: cols[4] as any,
            rarity: parseInt(cols[5], 10) as 4 | 5,
        })
    }
    return sortPresets(presets)
}

let _loading: Promise<CharacterPreset[]> | null = null

export async function loadCharacterPresets(): Promise<CharacterPreset[]> {
    if (_cache) return _cache
    if (_loading) return _loading
    _loading = fetch('/data/characters.csv?t=' + Date.now())
        .then((r) => r.text())
        .then(parseCSV)
        .then((p) => {
            _cache = p
            return p
        })
    return _loading
}

export function getCharacterPresets(): CharacterPreset[] {
    const builtin = _cache ?? []
    return sortPresets([...builtin, ...customPresetsStore.getCustomPresets()])
}
