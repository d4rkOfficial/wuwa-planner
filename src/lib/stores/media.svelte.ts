function createMediaStore() {
    let w = $state(typeof window !== 'undefined' ? window.innerWidth : 1024)

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
            w = window.innerWidth
        })
    }

    return {
        get windowWidth() {
            return w
        },
        get isMobile() {
            return w < 768
        },
    }
}

export const mediaStore = createMediaStore()
