export interface Theme {
    id: string
    name: string
    key: string
    isBuiltin?: boolean
    baseTheme?: 'dark' | 'light'
    fontFamily: string

    background: string
    trackBg: string
    sidebarBg: string
    sidebarBorder: string
    sidebarText: string
    sidebarTextActive: string
    sidebarHover: string
    border: string
    borderLight: string
    panelBg: string
    exportBg: string
    modalBg: string
    modalBorder: string
    contextBg: string
    contextBorder: string
    contextHover: string
    inputBg: string
    inputBorder: string
    buttonBg: string
    buttonHover: string
    buttonText: string
    blockBorder: string
    blockCompactBorder: string
    blockCompactBg: string
    diagramItemBorder: string
    deleteBtnBorder: string
    deleteBtnHover: string
    scrollbarTrack: string
    scrollbarThumb: string
    scrollbarThumbHover: string
    divider: string
    ringOffset: string
    overlayBackdrop: string
    dragOverBg: string
    selectedModeBg: string
    selectedModeRing: string
    alertBtnBg: string
    confirmBtnBg: string

    text: string
    textSecondary: string
    mutedText: string
    badgeText: string
    avatarText: string
    accentText: string
    dangerText: string
    dangerHover: string
    accentHover: string
    segmentLabel: string
    comboText: string
    tagText: string

    nodeColors: Record<string, string>
    modeColors: Record<string, string>
    stayField: string
    wrapIndicator: string
    starRarity5: string
    starRarity4: string
    starRoverGradient: string
    fallbackTrack: string

    comboBg: string
    comboBorder: string
    tagBg: string

    keyIconPath?: string
    keyIcons?: Record<string, string>
    strongBadgeIcon?: string
    avatarOverrides?: Record<string, string>
}
