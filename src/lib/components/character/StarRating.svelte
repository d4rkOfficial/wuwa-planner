<script lang="ts">
    import type { CharacterPreset } from '$lib/types'
    import { planner } from '$lib/stores/planner.svelte'

    let { preset, size = 12 }: { preset: CharacterPreset; size?: number } = $props()

    let isRover = $derived(preset.id.startsWith('piaoBoZhe'))
    let stars = $derived(isRover ? 5 : preset.rarity)

    let starStyle = $derived.by(() => {
        const t = planner.theme
        if (isRover) {
            return `font-size: ${size}px; background: ${t.starRoverGradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
        }
        const color = preset.rarity === 5 ? t.starRarity5 : t.starRarity4
        return `font-size: ${size}px; color: ${color};`
    })
</script>

<span style={starStyle}>{'★'.repeat(stars)}</span>
