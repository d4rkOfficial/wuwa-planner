import type { RotationExport } from '../types'

export function exportRotation(data: RotationExport): string {
    return JSON.stringify(data, null, 2)
}

export function importRotation(json: string): RotationExport | null {
    try {
        const data = JSON.parse(json)
        if (data.version !== '1.0') {
            console.warn('Unknown version:', data.version)
        }
        return data as RotationExport
    } catch (e) {
        console.error('Failed to parse rotation data:', e)
        return null
    }
}

export function downloadJSON(data: string, filename: string = 'rotation.json') {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
