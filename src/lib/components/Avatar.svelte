<script lang="ts">
    let { presetId, name, size = 'md' }: {
        presetId: string | null;
        name: string;
        size?: 'sm' | 'md' | 'lg';
    } = $props();

    const sizeMap: Record<string, string> = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-lg' };
    let imgFailed = $state(false);
</script>

<div class="relative {sizeMap[size]} shrink-0 overflow-hidden rounded-full">
    {#if presetId && !imgFailed}
        <img
            src={`/images/avatars/${presetId}.png`}
            alt={name}
            class="absolute inset-0 h-full w-full object-cover"
            onerror={() => imgFailed = true}
        />
    {/if}
    <div class="flex h-full w-full items-center justify-center font-bold text-white">
        {name.charAt(0)}
    </div>
</div>
