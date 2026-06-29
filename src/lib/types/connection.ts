export type SwapType = 'intro' | 'swap'

export interface SwapLink {
    id: string
    fromCharacterId: string
    toCharacterId: string
    fromBlockId: string
    toBlockId: string
    type: SwapType
}

export interface StayFieldMarker {
    id: string
    characterId: string
    fromBlockId: string
    toBlockId: string
}
