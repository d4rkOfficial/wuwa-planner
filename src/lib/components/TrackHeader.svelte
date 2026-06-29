<script lang="ts">
    import { onMount } from 'svelte'
    import type { Character, Theme, CharacterPreset } from '$lib/types'
    import {
        loadCharacterPresets,
        getCharacterPresets,
    } from '$lib/data/characters'
    import { planner } from '$lib/stores/planner.svelte'
    import StarRating from './StarRating.svelte'

    let {
        character,
        theme,
        onselect,
        index,
    }: {
        character: Character
        theme: Theme
        onselect?: () => void
        index: number
    } = $props()

    let presets = $state<CharacterPreset[]>(getCharacterPresets())

    onMount(() => {
        loadCharacterPresets().then((p) => (presets = p))
    })

    let preset = $derived(
        character.presetId ?
            presets.find((p) => p.id === character.presetId)
        :   undefined,
    )

    let avatarPath = $derived(
        preset ? `/images/avatars/${preset.id}.png` : null,
    )
    let avatarFailed = $state(false)
    let trackColor = $derived(planner.getTrackColor(character.id, index))
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
    class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
    onclick={onselect}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && onselect?.()}
>
    <div
        class="relative h-8 w-8 shrink-0 overflow-hidden rounded-full"
        style="border: 2px solid {trackColor.border};"
    >
        {#if avatarPath && !avatarFailed}
            <img
                src={avatarPath}
                alt={character.name}
                class="h-full w-full object-cover"
                onerror={() => (avatarFailed = true)}
            />
        {/if}
        {#if !avatarPath || avatarFailed}
            <div
                class="flex h-full w-full items-center justify-center text-xs font-bold text-white"
            >
                {character.name.charAt(0)}
            </div>
        {/if}
    </div>
    <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1">
            <div
                class="truncate text-xs font-semibold"
                style="color: {theme.text};"
            >
                {character.name}
            </div>
            {#if preset}
                <StarRating {preset} size={9} />
            {/if}
        </div>
        {#if preset}
            <div class="truncate text-[10px] text-zinc-500">
                {preset.nameEn}
            </div>
        {/if}
    </div>
    <div
        class="shrink-0"
        style="background: {trackColor.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
    >
        <span class="text-lg leading-none">●</span>
    </div>
</div>
