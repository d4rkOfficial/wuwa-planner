interface DialogState {
    visible: boolean
    message: string
    type: 'alert' | 'confirm'
    resolve: (value: boolean) => void
}

function createDialogStore() {
    let state = $state<DialogState>({
        visible: false,
        message: '',
        type: 'alert',
        resolve: () => {},
    })

    function alert(message: string): Promise<void> {
        return new Promise((resolve) => {
            state = {
                visible: true,
                message,
                type: 'alert',
                resolve: () => {
                    close()
                    resolve()
                },
            }
        })
    }

    function confirm(message: string): Promise<boolean> {
        return new Promise((resolve) => {
            state = {
                visible: true,
                message,
                type: 'confirm',
                resolve: (v: boolean) => {
                    close()
                    resolve(v)
                },
            }
        })
    }

    function close() {
        state = { ...state, visible: false }
    }

    return {
        get state() {
            return state
        },
        alert,
        confirm,
        close,
    }
}

export const dialog = createDialogStore()
