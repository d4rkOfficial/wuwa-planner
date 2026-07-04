export function roundRect(
    cx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    cx.beginPath()
    cx.moveTo(x + r, y)
    cx.lineTo(x + w - r, y)
    cx.arcTo(x + w, y, x + w, y + r, r)
    cx.lineTo(x + w, y + h - r)
    cx.arcTo(x + w, y + h, x + w - r, y + h, r)
    cx.lineTo(x + r, y + h)
    cx.arcTo(x, y + h, x, y + h - r, r)
    cx.lineTo(x, y + r)
    cx.arcTo(x, y, x + r, y, r)
    cx.closePath()
}

export function drawArrow(
    cx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    alpha: number = 0.7,
) {
    cx.strokeStyle = color
    cx.lineWidth = 2
    cx.globalAlpha = alpha
    cx.lineCap = 'round'
    cx.beginPath()
    cx.moveTo(x1, y1)
    cx.lineTo(x2, y2)
    cx.stroke()
    cx.globalAlpha = 1
    const a = Math.atan2(y2 - y1, x2 - x1)
    cx.fillStyle = color
    cx.globalAlpha = alpha
    cx.beginPath()
    cx.moveTo(x2, y2)
    cx.lineTo(x2 - 7 * Math.cos(a - Math.PI / 6), y2 - 7 * Math.sin(a - Math.PI / 6))
    cx.lineTo(x2 - 7 * Math.cos(a + Math.PI / 6), y2 - 7 * Math.sin(a + Math.PI / 6))
    cx.closePath()
    cx.fill()
    cx.globalAlpha = 1
}

export function drawStayRect(
    cx: CanvasRenderingContext2D,
    x: number,
    y: number,
    right: number,
    h: number,
    color: string,
) {
    const w = right - x
    if (w <= 0 || h <= 0) return
    cx.strokeStyle = color
    cx.lineWidth = 1.5
    cx.setLineDash([4, 3])
    roundRect(cx, x, y, w, h, 4)
    cx.stroke()
    cx.setLineDash([])
}

export function drawFollowCurve(
    cx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    corner: number = 4,
    goRight: number = 16,
) {
    const yGap = (y1 + y2) / 2
    const xR = x1 + goRight
    const xT = x2 - corner * 3

    cx.beginPath()
    cx.moveTo(x1, y1)
    cx.lineTo(xR, y1)
    cx.arcTo(xR + corner, y1, xR + corner, y1 + corner, corner)
    cx.lineTo(xR + corner, yGap)
    cx.arcTo(xR + corner, yGap + corner, xR, yGap + corner, corner)
    cx.lineTo(xT, yGap + corner)
    cx.arcTo(xT - corner, yGap + corner, xT - corner, yGap + corner * 2, corner)
    cx.lineTo(xT - corner, y2 - corner)
    cx.arcTo(xT, y2, x2, y2, corner)
    cx.strokeStyle = color
    cx.lineWidth = 2
    cx.globalAlpha = 0.5
    cx.lineCap = 'round'
    cx.lineJoin = 'round'
    cx.stroke()
    cx.globalAlpha = 1

    cx.fillStyle = color
    cx.globalAlpha = 0.5
    cx.beginPath()
    cx.moveTo(x2, y2)
    cx.lineTo(x2 - 7 * Math.cos(Math.PI / 6), y2 - 7 * Math.sin(Math.PI / 6))
    cx.lineTo(x2 - 7 * Math.cos(-Math.PI / 6), y2 - 7 * Math.sin(-Math.PI / 6))
    cx.closePath()
    cx.fill()
    cx.globalAlpha = 1
}
