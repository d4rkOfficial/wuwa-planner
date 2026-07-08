import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AVATAR_DIR = resolve(__dirname, '../static/images/avatars')

if (!existsSync(AVATAR_DIR)) {
    mkdirSync(AVATAR_DIR, { recursive: true })
}

const charToIcon = {
    // sanHua: 7,
    // baiZhi: 6,
    // lingYang: 14,
    // zheZhi: 27,
    // youHu: 31,
    // keLaiTa: 32,
    // feiXue: 67,
    // luoSeLa: 66,
    // chiXia: 2,
    // anKe: 8,
    // moTeFei: 13,
    // changLi: 26,
    // buLanTe: 44,
    // luPa: 46,
    // jiaBeiLiNa: 55,
    // moNing: 61,
    // aiMiSi: 53,
    // daNiYa: 64,
    // kaKaLuo: 18,
    // yinLin: 17,
    // yuanWu: 15,
    // xiangLiYao: 25,
    // dengDeng: 30,
    // aoGuSiTa: 51,
    // buLing: 58,
    // liBeiKa: 69,
    // piaoBoZheDaoDian: 5,
    // yangYang: 1,
    // qiuShui: 12,
    // jiYan: 11,
    // jianXin: 23,
    // xiaKong: 37,
    // piaoBoZheQiDong: 5,
    // kaTiXiYa: 40,
    // youNuo: 48,
    // qiuYuan: 56,
    // xiGeLiKa: 65,
    // weiLiNai: 3,
    // piaoBoZheYanShe: 5,
    // jinXi: 24,
    // shouAnRen: 28,
    // feiBi: 45,
    // zanNi: 38,
    // linNai: 60,
    // luHeSi: 54,
    // luXi: 68,
    // taoQi: 9,
    // danJin: 10,
    // chun: 29,
    // piaoBoZheYanMie: 5,
    // luoKeKe: 33,
    // kanTeLeiLa: 34,
    // fuLuoLuo: 41,
    // qianXiao: 57,
    yangYangXuanLing: 70,
    suiSui: 71,
}

const BASE_URL = 'https://static.nanoka.cc/assets/ww/UIResources/Common/Image/IconRoleHead256'

async function download(url, dest) {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
    const buffer = Buffer.from(await resp.arrayBuffer())
    writeFileSync(dest, buffer)
    console.log(`  OK  ${dest.split('/').pop()}`)
}

async function main() {
    const entries = Object.entries(charToIcon)
    console.log(`Downloading ${entries.length} avatars...\n`)

    let success = 0
    let fail = 0

    for (const [id, num] of entries) {
        const url = `${BASE_URL}/T_IconRoleHead256_${num}_UI.webp`
        const dest = resolve(AVATAR_DIR, `${id}.png`)
        try {
            await download(url, dest)
            success++
        } catch (e) {
            console.log(`  FAIL ${id} (icon ${num}): ${e.message}`)
            fail++
        }
    }

    console.log(`\nDone: ${success} OK, ${fail} failed`)
}

main().catch(console.error)
