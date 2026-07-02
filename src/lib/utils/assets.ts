export function fileToDataURI(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

export function cropToSquare(dataUri: string, size: number = 256): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const side = Math.min(img.width, img.height)
            const offsetX = (img.width - side) / 2
            const offsetY = (img.height - side) / 2
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
            }
            ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, size, size)
            resolve(canvas.toDataURL())
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = dataUri
    })
}

export async function urlToDataURI(url: string): Promise<string> {
    if (url.startsWith('data:')) return url
    const resp = await fetch(url)
    const blob = await resp.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to convert URL to data URI'))
        reader.readAsDataURL(blob)
    })
}

export async function embedThemeAssets(
    theme: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    const result = { ...theme }
    const keyIcons = result.keyIcons as Record<string, string> | undefined
    if (keyIcons) {
        const embedded: Record<string, string> = {}
        for (const [k, v] of Object.entries(keyIcons)) {
            embedded[k] = v.startsWith('http') || v.startsWith('/') ? await urlToDataURI(v) : v
        }
        result.keyIcons = embedded
    }
    const badgeIcon = result.strongBadgeIcon as string | undefined
    if (badgeIcon && !badgeIcon.startsWith('data:')) {
        result.strongBadgeIcon = await urlToDataURI(badgeIcon)
    }
    const avatars = result.avatarOverrides as Record<string, string> | undefined
    if (avatars) {
        const embedded: Record<string, string> = {}
        for (const [k, v] of Object.entries(avatars)) {
            embedded[k] = v.startsWith('http') || v.startsWith('/') ? await urlToDataURI(v) : v
        }
        result.avatarOverrides = embedded
    }
    return result
}
