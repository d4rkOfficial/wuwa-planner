import { planner } from './planner.svelte'
import { generateId } from '../utils/id'
import type { ProjectData } from '../types/project'

const STORAGE_KEY = 'wuwa-projects'

function createProjectsStore() {
    let projects = $state<ProjectData[]>([])
    let activeId = $state<string | null>(null)

    function saveToStorage() {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }

    function loadFromStorage() {
        if (typeof localStorage === 'undefined') return
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            try {
                projects = JSON.parse(raw)
            } catch {
                projects = []
            }
        }
    }

    function getActiveProject(): ProjectData | null {
        if (!activeId) return null
        return projects.find((p) => p.id === activeId) ?? null
    }

    function syncPlannerToActive() {
        if (!activeId) return
        const idx = projects.findIndex((p) => p.id === activeId)
        if (idx < 0) return
        const data = planner.toProjectData()
        data.id = activeId
        data.updatedAt = new Date().toISOString()
        projects[idx] = data
        saveToStorage()
    }

    function loadProjectToPlanner(id: string) {
        const data = projects.find((p) => p.id === id)
        if (!data) return
        syncPlannerToActive()
        planner.loadFromProjectData(data)
        activeId = id
    }

    function addProject(title: string = '未命名轴'): string {
        const project: ProjectData = {
            id: generateId(),
            title,
            characters: [
                { id: generateId(), name: '1号角色', presetId: null },
                { id: generateId(), name: '2号角色', presetId: null },
                { id: generateId(), name: '3号角色', presetId: null },
            ],
            blocks: [],
            stayFieldMarkers: [],
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        projects = [...projects, project]
        saveToStorage()
        return project.id
    }

    function deleteProject(id: string) {
        projects = projects.filter((p) => p.id !== id)
        if (activeId === id) {
            const newActiveId = projects.length > 0 ? projects[0].id : null
            if (newActiveId) {
                loadProjectToPlanner(newActiveId)
            } else {
                activeId = null
            }
        }
        saveToStorage()
    }

    function renameProject(id: string, title: string) {
        projects = projects.map((p) => (p.id === id ? { ...p, title } : p))
        if (activeId === id) planner.title = title
        saveToStorage()
    }

    function duplicateProject(id: string): string | null {
        const src = projects.find((p) => p.id === id)
        if (!src) return null
        const newId = generateId()
        const charIdMap = new Map<string, string>()
        const chars = src.characters.map((c) => {
            const cid = generateId()
            charIdMap.set(c.id, cid)
            return { ...c, id: cid }
        })
        const blockIdMap = new Map<string, string>()
        const newBlocks = src.blocks.map((b) => {
            const bid = generateId()
            blockIdMap.set(b.id, bid)
            return {
                ...b,
                id: bid,
                characterId: charIdMap.get(b.characterId) ?? b.characterId,
            }
        })
        const copy: ProjectData = {
            ...src,
            id: newId,
            title: src.title + ' (副本)',
            characters: chars,
            blocks: newBlocks,
            stayFieldMarkers: src.stayFieldMarkers.map((m) => ({
                ...m,
                id: generateId(),
                characterId: charIdMap.get(m.characterId) ?? m.characterId,
                fromBlockId: blockIdMap.get(m.fromBlockId) ?? m.fromBlockId,
                toBlockId: blockIdMap.get(m.toBlockId) ?? m.toBlockId,
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        projects = [...projects, copy]
        saveToStorage()
        return newId
    }

    function setActiveId(id: string | null) {
        activeId = id
    }

    return {
        get projects() {
            return projects
        },
        get activeId() {
            return activeId
        },
        get activeProject() {
            return getActiveProject()
        },
        get count() {
            return projects.length
        },
        syncPlannerToActive,
        loadProjectToPlanner,
        addProject,
        deleteProject,
        renameProject,
        duplicateProject,
        setActiveId,
        getActiveProject,
        loadFromStorage,
        saveToStorage,
    }
}

export const projects = createProjectsStore()
