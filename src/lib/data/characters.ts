import type { CharacterPreset, ElementType } from '$lib/types'

export const elementTypeMap: Record<string, string> = {
    glacio: '冷凝',
    fusion: '热熔',
    electro: '导电',
    aero: '气动',
    spectro: '衍射',
    havoc: '湮灭',
}

let _cache: CharacterPreset[] | null = null

function isRover(preset: CharacterPreset): boolean {
    return preset.id.startsWith('piaoBoZhe')
}

function comparePinyinInitial(a: string, b: string): number {
    return a.localeCompare(b)
}

function sortPresets(presets: CharacterPreset[]): CharacterPreset[] {
    return presets.sort((a, b) => {
        const aRover = isRover(a)
        const bRover = isRover(b)
        if (aRover && !bRover) return -1
        if (!aRover && bRover) return 1
        if (a.rarity !== b.rarity) return b.rarity - a.rarity
        return comparePinyinInitial(a.pinyin, b.pinyin)
    })
}

function parseCSV(text: string): CharacterPreset[] {
    const lines = text.trim().split('\n')
    const presets: CharacterPreset[] = []
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const cols = line.split(',')
        if (cols.length < 8) continue
        presets.push({
            id: cols[0],
            name: cols[1],
            nameEn: cols[2],
            pinyin: cols[3],
            element: cols[4] as ElementType,
            weaponType: cols[5] as any,
            rarity: parseInt(cols[6], 10) as 4 | 5,
            alias: cols[7],
        })
    }
    return sortPresets(presets)
}

let _loading: Promise<CharacterPreset[]> | null = null

export async function loadCharacterPresets(): Promise<CharacterPreset[]> {
    if (_cache) return _cache
    if (_loading) return _loading
    _loading = fetch('/data/characters.csv')
        .then((r) => r.text())
        .then(parseCSV)
        .then((p) => {
            _cache = p
            return p
        })
    return _loading
}

export function getCharacterPresets(): CharacterPreset[] {
    return _cache ?? []
}
