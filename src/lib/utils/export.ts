import type { RotationExport } from '../types'

export function exportRotation(data: RotationExport): string {
    return JSON.stringify(data, null, 2)
}

export function importRotation(json: string): RotationExport | null {
    try {
        const data = JSON.parse(json)
        if (data.version === '1.0' || data.version === '2.0') {
            return data as RotationExport
        }
        console.warn('Unknown version:', data.version)
        return data as RotationExport
    } catch (e) {
        console.error('Failed to parse rotation data:', e)
        return null
    }
}
