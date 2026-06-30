<script lang="ts">
    import type { Theme } from '$lib/types';

    let { start, end, theme }: {
        start?: number;
        end?: number;
        theme: Theme;
    } = $props();

    let nums = $derived.by(() => {
        if (!start || !end || start <= 0 || end <= 0) return null;
        if (start === end) return String(start);
        const arr: number[] = [];
        for (let n = start; n <= end; n++) arr.push(n);
        return arr.join('');
    });

    let bg = $derived(theme.comboBg || (theme.key === 'dark' ? '#e4e4e7' : '#fafafa'));
    let bd = $derived(theme.comboBorder || (theme.key === 'dark' ? '#a1a1aa' : '#a3a3a3'));
    let fg = $derived(theme.comboText || (theme.key === 'dark' ? '#18181b' : '#0a0a0a'));
</script>

{#if nums}
    <span class="-ml-2 pl-2 pr-1 rounded h-5 flex items-center font-black"
        style="border-top: 1.5px solid {bd}; border-right: 1.5px solid {bd}; border-bottom: 1.5px solid {bd}; font-size: 10px; padding-top: 0; padding-bottom: 0; background: linear-gradient(to right, transparent 0%, {bg} 25%, {bg} 100%); color: {fg};"
    >{nums}</span>
{/if}
