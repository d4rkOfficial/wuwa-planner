import type { Character } from './character'
import type { ActionBlock, ActionBlockV2 } from './node'
import type { StayFieldMarker } from './connection'

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
        blocks: ActionBlockV2[]
        stayFieldMarkers: StayFieldMarker[]
    }
}

export type RotationExport = RotationExportV1 | RotationExportV2
