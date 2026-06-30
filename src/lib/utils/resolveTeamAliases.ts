export function resolveTeamAliases(aliasLists: string[][]): string[] {
    if (aliasLists.length === 0) return []
    if (aliasLists.length === 1) return [aliasLists[0][0]]

    let best: string[] | null = null
    let bestScore: [number, number, number] = [Infinity, Infinity, -Infinity]

    function generate(idx: number, current: string[], indices: number[]) {
        if (idx === aliasLists.length) {
            const map = new Map<string, number>()
            for (const a of current) map.set(a, (map.get(a) || 0) + 1)
            let dup = 0
            for (const c of map.values()) if (c > 1) dup += c - 1

            const len = current.reduce((s, a) => s + a.length, 0)
            const primary = indices.filter(i => i === 0).length
            const score: [number, number, number] = [dup, len, -primary]

            if (
                score[0] < bestScore[0] ||
                (score[0] === bestScore[0] && score[1] < bestScore[1]) ||
                (score[0] === bestScore[0] && score[1] === bestScore[1] && score[2] < bestScore[2])
            ) {
                bestScore = score
                best = [...current]
            }
            return
        }
        for (let i = 0; i < aliasLists[idx].length; i++) {
            current.push(aliasLists[idx][i])
            indices.push(i)
            generate(idx + 1, current, indices)
            current.pop()
            indices.pop()
        }
    }

    generate(0, [], [])
    return best!
}
