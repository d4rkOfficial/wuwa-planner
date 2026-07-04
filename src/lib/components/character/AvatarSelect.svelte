<script lang="ts">
    import CharacterPicker from './CharacterPicker.svelte'

    let {
        excludeIds = [],
        onselect,
        onclose,
    }: {
        excludeIds?: string[]
        onselect: (presetId: string) => void
        onclose: () => void
    } = $props()

    function handleSelect(id: string) {
        onselect(id)
        onclose()
    }
</script>

<CharacterPicker {excludeIds} onselect={handleSelect} {onclose} />
