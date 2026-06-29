import type { Character, ActionBlock, StayFieldMarker } from './index'

export interface ProjectData {
    id: string
    title: string
    characters: Character[]
    blocks: ActionBlock[]
    stayFieldMarkers: StayFieldMarker[]
    description: string
    createdAt: string
    updatedAt: string
}
