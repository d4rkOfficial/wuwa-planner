<script lang="ts">
    import type { Theme } from '$lib/types'

    let {
        label,
        value = $bindable(''),
        defaultValue,
        theme,
    }: {
        label: string
        value?: string
        defaultValue?: string
        theme: Theme
    } = $props()

    let hasChanges = $derived(defaultValue !== undefined && value !== defaultValue)

    let hexInvalid = $derived.by(() => {
        if (!value) return false
        const hex6 = /^#[0-9a-fA-F]{6}$/
        const hex3 = /^#[0-9a-fA-F]{3}$/
        const rgba = /^rgba?\(/
        return !hex6.test(value) && !hex3.test(value) && !rgba.test(value)
    })
</script>

<div class="flex items-center gap-2">
    <span class="text-xs min-w-28 shrink-0 truncate" style="color: {theme.textSecondary};"
        >{label}</span
    >
    <div
        class="w-8 h-8 rounded shrink-0 flex items-center justify-center"
        style="border: 1px solid {theme.inputBorder}; background: {theme.inputBg};"
    >
        <input type="color" class="w-6 h-6 rounded cursor-pointer border-0 p-0 block" bind:value />
    </div>
    <input
        type="text"
        class="flex-1 rounded border bg-transparent px-2 py-1.5 text-xs outline-none font-mono transition-colors"
        style="border-color: {hexInvalid
            ? theme.dangerText
            : theme.inputBorder}; color: {theme.text};"
        bind:value
    />
    {#if hasChanges}
        <button
            class="text-xs px-1.5 py-0.5 rounded transition-colors shrink-0"
            style="color: {theme.textSecondary};"
            onmouseenter={(e) => (e.currentTarget.style.color = theme.text)}
            onmouseleave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
            onclick={() => {
                if (defaultValue !== undefined) value = defaultValue
            }}
            title="重置为默认值">↺</button
        >
    {/if}
</div>
