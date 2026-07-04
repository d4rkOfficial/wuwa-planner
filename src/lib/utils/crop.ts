export function getHandleAt(
    mx: number,
    my: number,
    cropDispX: number,
    cropDispY: number,
    cropDispSize: number,
    handleSize: number = 14,
): string | null {
    const checks: [string, number, number][] = [
        ['resize-tl', cropDispX, cropDispY],
        ['resize-tr', cropDispX + cropDispSize, cropDispY],
        ['resize-bl', cropDispX, cropDispY + cropDispSize],
        ['resize-br', cropDispX + cropDispSize, cropDispY + cropDispSize],
    ]
    for (const [mode, hx, hy] of checks) {
        if (Math.abs(mx - hx) <= handleSize && Math.abs(my - hy) <= handleSize) return mode
    }
    return null
}

export function cursorStyle(dragMode: string | null): string {
    if (dragMode) return 'grabbing'
    return 'default'
}

export function clampCropResize(
    dragMode: string,
    dragStart: { cx: number; cy: number; cs: number },
    dx: number,
    dy: number,
    nw: number,
    nh: number,
    minSize: number = 20,
): { cropX: number; cropY: number; cropSize: number } {
    const { cx, cy, cs } = dragStart
    let nx = cx,
        ny = cy,
        ns = cs

    if (dragMode === 'resize-br') {
        ns = Math.max(minSize, cs + Math.max(dx, dy))
        ns = Math.min(ns, nw - cx, nh - cy)
    } else if (dragMode === 'resize-tr') {
        ns = Math.max(minSize, cs + Math.max(-dx, dy))
        ns = Math.min(ns, cx + cs, nh - cy)
        nx = cx + cs - ns
        ny = cy
    } else if (dragMode === 'resize-bl') {
        ns = Math.max(minSize, cs + Math.max(dx, -dy))
        ns = Math.min(ns, nw - cx, cy + cs)
        nx = cx
        ny = cy + cs - ns
    } else if (dragMode === 'resize-tl') {
        ns = Math.max(minSize, cs + Math.max(-dx, -dy))
        ns = Math.min(ns, cx + cs, cy + cs)
        nx = cx + cs - ns
        ny = cy + cs - ns
    }

    return { cropX: nx, cropY: ny, cropSize: ns }
}

export function rotateImageDataUrl(
    dataUrl: string,
    degrees: number,
    nw: number,
    nh: number,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const rad = (degrees * Math.PI) / 180
            const cos = Math.abs(Math.cos(rad))
            const sin = Math.abs(Math.sin(rad))
            canvas.width = Math.round(nh * sin + nw * cos)
            canvas.height = Math.round(nh * cos + nw * sin)
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('no ctx'))
                return
            }
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(rad)
            ctx.drawImage(img, -nw / 2, -nh / 2)
            resolve(canvas.toDataURL())
        }
        img.onerror = () => reject(new Error('load failed'))
        img.src = dataUrl
    })
}
