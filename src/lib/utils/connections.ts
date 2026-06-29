import type { ActionBlock } from '../types'

export interface ArrowPath {
    id: string
    path: string
    color: string
    fromColor: string
    toColor: string
    type: 'intro' | 'swap'
}

export interface StayFieldRect {
    id: string
    x: number
    y: number
    width: number
    height: number
}

export function calculateArrowPaths(
    fromBlock: ActionBlock,
    toBlock: ActionBlock,
    fromRect: DOMRect,
    toRect: DOMRect,
    trackHeight: number,
    color: string,
    type: 'intro' | 'swap',
): ArrowPath {
    const startX = fromRect.right
    const startY = fromRect.top + fromRect.height / 2
    const endX = toRect.left
    const endY = toRect.top + toRect.height / 2

    const midY = startY + (endY - startY) / 2
    const path = `M ${startX} ${startY} C ${startX + 40} ${startY}, ${startX + 40} ${midY}, ${endX - 20} ${midY} C ${endX - 10} ${midY}, ${endX - 5} ${endY - 5}, ${endX} ${endY}`

    // Arrowhead
    const arrowSize = 8
    const arrowPath = `M ${endX} ${endY} L ${endX - arrowSize} ${endY - arrowSize} M ${endX} ${endY} L ${endX - arrowSize} ${endY + arrowSize}`

    return {
        id: `arrow-${fromBlock.id}-${toBlock.id}`,
        path: path + ' ' + arrowPath,
        color,
        fromColor: color,
        toColor: color,
        type,
    }
}

export function calculateStayFieldRect(
    fromBlock: ActionBlock,
    toBlock: ActionBlock,
    fromRect: DOMRect,
    toRect: DOMRect,
): StayFieldRect {
    return {
        id: `stay-${fromBlock.id}-${toBlock.id}`,
        x: fromRect.left,
        y: fromRect.top - 4,
        width: toRect.right - fromRect.left,
        height: fromRect.height + 8,
    }
}
