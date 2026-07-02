import type { CharacterPreset, ElementType, WeaponType } from '../types'
import { generateId } from '../utils/id'

const STORAGE_KEY = 'wuwa-custom-presets'

function createCustomPresetsStore() {
    let presets = $state<CharacterPreset[]>([])

    function saveToStorage() {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
    }

    function loadFromStorage() {
        if (typeof localStorage === 'undefined') return
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            try {
                presets = JSON.parse(raw)
            } catch {
                presets = []
            }
        }
    }

    function getCustomPresets(): CharacterPreset[] {
        return presets
    }

    function addPreset(data: {
        name: string
        nameEn?: string
        aliases: string[]
        element: ElementType
        weaponType: WeaponType
        rarity: 4 | 5
    }): CharacterPreset {
        const preset: CharacterPreset = {
            id: 'custom_' + generateId(),
            name: data.name,
            nameEn: data.nameEn ?? data.name,
            aliases: data.aliases,
            element: data.element,
            weaponType: data.weaponType,
            rarity: data.rarity,
        }
        presets = [...presets, preset]
        saveToStorage()
        return preset
    }

    function updatePreset(id: string, partial: Partial<CharacterPreset>) {
        presets = presets.map((p) => (p.id === id ? { ...p, ...partial } : p))
        saveToStorage()
    }

    function removePreset(id: string) {
        presets = presets.filter((p) => p.id !== id)
        saveToStorage()
    }

    return {
        get presets() {
            return presets
        },
        getCustomPresets,
        addPreset,
        updatePreset,
        removePreset,
        loadFromStorage,
    }
}

export const customPresetsStore = createCustomPresetsStore()
customPresetsStore.loadFromStorage()
