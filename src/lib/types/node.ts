export type KeyType = 'LMB' | 'RMB' | 'Q' | 'E' | 'R' | 'T' | 'F' | 'X' | 'V' | 'intro' | 'jump'

export type KeyMode = 'click' | 'hold' | 'preinput_swap' | 'preinput_action' | 'rapid_click'

export interface KeyOperation {
    key: KeyType
    mode: KeyMode
    comboStart?: number
    comboEnd?: number
    strong?: boolean
    comment?: string
}

/** @todo 疑似deadcode */
export interface IconTextPair {
    icon: string
    text: string
}

export interface ActionBlock {
    id: string
    characterId: string
    label: string
    x: number
    isIntro: boolean
    introOverride: boolean | null
    isOffHand: boolean
    keyOps: KeyOperation[]
    /** @todo 疑似deadcode */
    customIcons: IconTextPair[]
}

// 带拉表工具数据的 KeyOperation
export interface KeyOperationV2 extends KeyOperation {}

// 带拉表工具数据的 ActionBlock
export interface ActionBlockV2 extends ActionBlock {
    keyOps: KeyOperationV2[]
}
