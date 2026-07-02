import type { Theme } from '../types'
import { PRESET_THEMES, getDefaultTheme } from '../data/themes'
import { generateId } from '../utils/id'

const STORAGE_KEY_CUSTOM = 'wuwa-custom-themes'
const STORAGE_KEY_ACTIVE = 'wuwa-active-theme-id'

function createThemesStore() {
    let customThemes = $state<Theme[]>([])
    let activeThemeId = $state<string>('dark')

    function saveCustomThemes() {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customThemes))
    }

    function saveActiveThemeId() {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeThemeId)
    }

    function loadFromStorage() {
        if (typeof localStorage === 'undefined') return
        const raw = localStorage.getItem(STORAGE_KEY_CUSTOM)
        if (raw) {
            try {
                customThemes = JSON.parse(raw)
            } catch {
                customThemes = []
            }
        }
        const activeRaw = localStorage.getItem(STORAGE_KEY_ACTIVE)
        if (activeRaw) {
            activeThemeId = activeRaw
        }
    }

    function getAllThemes(): Theme[] {
        return [...PRESET_THEMES, ...customThemes]
    }

    function getTheme(id: string): Theme | undefined {
        return getAllThemes().find((t) => t.id === id)
    }

    function getActiveTheme(): Theme {
        return getTheme(activeThemeId) ?? getDefaultTheme()
    }

    function setActiveTheme(id: string) {
        const theme = getTheme(id)
        if (!theme) return
        activeThemeId = id
        saveActiveThemeId()
    }

    function addCustomTheme(theme: Omit<Theme, 'id' | 'isBuiltin'> & Partial<Pick<Theme, 'id' | 'isBuiltin'>>): Theme {
        const newTheme: Theme = {
            ...theme,
            id: theme.id || generateId(),
            isBuiltin: false,
        }
        customThemes = [...customThemes, newTheme]
        saveCustomThemes()
        return newTheme
    }

    function updateCustomTheme(id: string, partial: Partial<Theme>) {
        customThemes = customThemes.map((t) =>
            t.id === id ? { ...t, ...partial } : t,
        )
        saveCustomThemes()
    }

    function removeCustomTheme(id: string) {
        customThemes = customThemes.filter((t) => t.id !== id)
        if (activeThemeId === id) {
            activeThemeId = 'dark'
            saveActiveThemeId()
        }
        saveCustomThemes()
    }

    function duplicateCustomTheme(id: string): Theme | null {
        const src = customThemes.find((t) => t.id === id)
        if (!src) return null
        const newTheme: Theme = {
            ...src,
            id: generateId(),
            name: src.name + ' (副本)',
        }
        customThemes = [...customThemes, newTheme]
        saveCustomThemes()
        return newTheme
    }

    return {
        get customThemes() {
            return customThemes
        },
        get activeThemeId() {
            return activeThemeId
        },
        getAllThemes,
        getTheme,
        getActiveTheme,
        setActiveTheme,
        addCustomTheme,
        updateCustomTheme,
        removeCustomTheme,
        duplicateCustomTheme,
        loadFromStorage,
    }
}

export const themeStore = createThemesStore()
themeStore.loadFromStorage()
