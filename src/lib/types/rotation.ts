import type { Character } from './character'
import type { ActionBlock } from './node'
import type { StayFieldMarker } from './connection'
import type { Theme } from './theme'

export interface RotationExportV1 {
    version: '1.0'
    metadata: {
        title: string
        description: string
        createdAt: string
        updatedAt: string
    }
    team: Character[]
    rotation: {
        blocks: ActionBlock[]
        stayFieldMarkers: StayFieldMarker[]
    }
}

export interface RotationExportV2 {
    version: '2.0'
    metadata: {
        title: string
        description: string
        createdAt: string
        updatedAt: string
    }
    team: Character[]
    rotation: {
        blocks: ActionBlock[]
        stayFieldMarkers: StayFieldMarker[]
    }
    theme?: {
        id: string
        name: string
        baseTheme: 'dark' | 'light'
        overrides: Record<string, unknown>
    }
}

export type RotationExport = RotationExportV1 | RotationExportV2
