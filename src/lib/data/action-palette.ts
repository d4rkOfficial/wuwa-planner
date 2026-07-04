import type { KeyType, KeyMode } from '$lib/types'

export interface KeyTypeDef {
    key: KeyType
    title: string
    desc: string
}

export interface ModeDef {
    key: KeyMode
    title: string
    desc: string
}

export const KEY_TYPES: KeyTypeDef[] = [
    { key: 'LMB', title: '左键', desc: '普攻 / 重击' },
    { key: 'RMB', title: '右键', desc: '闪避' },
    { key: 'Q', title: 'Q', desc: '声骸技能' },
    { key: 'E', title: 'E', desc: '共鸣技能' },
    { key: 'R', title: 'R', desc: '共鸣解放' },
    { key: 'T', title: 'T', desc: '探索工具' },
    { key: 'F', title: '处决', desc: '谐度破环' },
    { key: 'X', title: '下落', desc: '下落攻击' },
    { key: 'jump', title: '跳', desc: '跳跃' },
    { key: 'V', title: '', desc: '空操作' },
]

export const MODE_OPTIONS: ModeDef[] = [
    { key: 'click', title: '点按', desc: '按下即放' },
    { key: 'hold', title: '长按', desc: '按住持续' },
    { key: 'preinput_swap', title: '预↔', desc: '切人前预输入' },
    { key: 'preinput_action', title: '预→', desc: '动作间预输入' },
    { key: 'rapid_click', title: '连击', desc: '狂按' },
]

export function setComboA(
    v: number,
    prev: { comboA: number; comboB: number },
): { comboA: number; comboB: number } {
    if (v <= 0) return { comboA: 0, comboB: 0 }
    return {
        comboA: v > 9 ? 0 : v,
        comboB: v > 9 ? 0 : prev.comboB < v ? v : prev.comboB,
    }
}

export function setComboB(
    v: number,
    prev: { comboA: number; comboB: number },
): { comboA: number; comboB: number } {
    if (v <= 0) return { comboA: 0, comboB: 0 }
    return {
        comboB: v > 9 ? 0 : v,
        comboA: v > 9 ? 0 : prev.comboA > v ? v : prev.comboA,
    }
}
