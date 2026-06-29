export type ElementType =
    | 'glacio'
    | 'fusion'
    | 'electro'
    | 'aero'
    | 'spectro'
    | 'havoc'
export type WeaponType =
    | 'sword'
    | 'broadblade'
    | 'pistols'
    | 'gauntlets'
    | 'rectifier'

export interface CharacterPreset {
    id: string
    name: string
    nameEn: string
    pinyin: string
    element: ElementType
    weaponType: WeaponType
    rarity: 4 | 5
    alias: string
}

export interface Character {
    id: string
    name: string
    presetId: string | null
}
