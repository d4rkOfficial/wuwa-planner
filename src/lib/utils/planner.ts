export function isInputFocused(): boolean {
    const el = document.activeElement
    const tag = el?.tagName?.toLowerCase()
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement)?.isContentEditable === true
}
