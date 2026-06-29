import type { Character } from './character'
import type { ActionBlock } from './node'
import type { StayFieldMarker } from './connection'

export interface RotationExport {
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
        swapLinks: { from: string; to: string }[]
        stayFieldMarkers: StayFieldMarker[]
    }
}
