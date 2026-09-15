import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/app/src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const JA = join(ROOT, 'i18n/locales/ja.json');
const args = new Set(process.argv.slice(2));

const T_CALL = /(?<![\w.$])t\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const DATA_SOURCES = [
    { file: 'features/Config/assets/SettingsMenu.ts', re: /\b(?:label|description):\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
    { file: 'features/Tools/index.tsx', re: /\blabel:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
];
const EXCLUDE = /(\.test\.|__mocks__|[\\/]mocks[\\/]|[\\/]tests[\\/]|[\\/]i18n[\\/])/;

// Server-side data reused as-is by the frontend (static alarm/error descriptions
// delivered over the socket, see AlarmDescriptionIcon.tsx and controllerSagas.tsx).
// Scoped to a single named array per file so GRBL_SETTINGS (unused by the
// frontend, see constants/firmware/*.ts) never gets pulled in.
const EXTERNAL_SOURCES = [
    { file: new URL('../src/server/controllers/Grbl/constants.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), label: 'server/controllers/Grbl/constants.js', arrayName: 'GRBL_ALARMS', re: /\bdescription:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
    { file: new URL('../src/server/controllers/Grbl/constants.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), label: 'server/controllers/Grbl/constants.js', arrayName: 'GRBL_ERRORS', re: /\bdescription:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
    { file: new URL('../src/server/controllers/Grblhal/constants.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), label: 'server/controllers/Grblhal/constants.js', arrayName: 'GRBL_HAL_ALARMS', re: /\bdescription:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
    { file: new URL('../src/server/controllers/Grblhal/constants.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), label: 'server/controllers/Grblhal/constants.js', arrayName: 'GRBL_HAL_ERRORS', re: /\bdescription:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g },
];

// Matches JS string-literal semantics: \n becomes a real newline, and a
// backslash before any other character is simply dropped (e.g. \$ -> $),
// same as what the JS engine itself produces for the runtime string value.
const unescape = (s) => s.replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');

const found = new Map();
const add = (key, file) => {
    if (!key) return;
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(file);
};

for (const ext of EXTERNAL_SOURCES) {
    const src = readFileSync(ext.file, 'utf8');
    const start = src.indexOf(`export const ${ext.arrayName}`);
    const end = src.indexOf('\n];', start) + 3;
    const slice = src.slice(start, end);
    for (const m of slice.matchAll(ext.re)) add(unescape(m[2]), ext.label);
}

for (const name of readdirSync(ROOT, { recursive: true })) {
    const file = join(ROOT, String(name));
    if (!/\.tsx?$/.test(file) || EXCLUDE.test(file)) continue;
    const src = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    for (const m of src.matchAll(T_CALL)) {
        if (m[1] === '`' && m[2].includes('${')) {
            console.warn(`WARN dynamic key (cannot sync): ${rel}: t(\`${m[2]}\`)`);
            continue;
        }
        add(unescape(m[2]), rel);
    }
    const data = DATA_SOURCES.find((d) => rel === d.file);
    if (data) for (const m of src.matchAll(data.re)) add(unescape(m[2]), rel);
}

const ja = JSON.parse(readFileSync(JA, 'utf8'));
const codeKeys = new Set(found.keys());
const newKeys = [...codeKeys].filter((k) => !(k in ja)).sort();
const orphans = Object.keys(ja).filter((k) => !codeKeys.has(k)).sort();
const untranslated = [...codeKeys].filter((k) => k in ja && ja[k] === '').sort();

const bigrams = (s) => {
    const m = new Map();
    s = s.toLowerCase();
    for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) || 0) + 1);
    return m;
};
const similarity = (a, b) => {
    const A = bigrams(a), B = bigrams(b);
    let hit = 0;
    for (const [g, n] of A) hit += Math.min(n, B.get(g) || 0);
    const total = [...A.values(), ...B.values()].reduce((x, y) => x + y, 0);
    return total ? (2 * hit) / total : 0;
};

if (args.has('--review')) {
    const byFile = new Map();
    for (const [k, files] of found) {
        const f = [...files][0];
        if (!byFile.has(f)) byFile.set(f, []);
        byFile.get(f).push(k);
    }
    for (const [f, keys] of [...byFile].sort()) {
        console.log(`\n### ${f}\n\n| English | 日本語 |\n|---|---|`);
        for (const k of keys.sort()) console.log(`| ${k.replace(/\|/g, '\\|').replace(/\n/g, '<br>')} | ${(ja[k] || '(未翻訳)').replace(/\|/g, '\\|').replace(/\n/g, '<br>')} |`);
    }
    process.exit(0);
}

for (const k of newKeys) ja[k] = '';
if (args.has('--prune')) for (const k of orphans) delete ja[k];
const sorted = Object.fromEntries(Object.keys(ja).sort().map((k) => [k, ja[k]]));
writeFileSync(JA, JSON.stringify(sorted, null, 4) + '\n');

console.log(`keys in code: ${codeKeys.size}  new: ${newKeys.length}  untranslated: ${untranslated.length}  orphans: ${orphans.length}`);
if (newKeys.length) console.log('\nNEW (added to ja.json as ""):\n' + newKeys.map((k) => `  + ${k}  [${[...found.get(k)].join(', ')}]`).join('\n'));
if (orphans.length) {
    console.log('\nORPHAN (in ja.json, not in code):');
    for (const o of orphans) {
        const best = newKeys.map((k) => [k, similarity(o, k)]).sort((a, b) => b[1] - a[1])[0];
        const hint = best && best[1] >= 0.6 ? `  -> maybe renamed to: "${best[0]}" (${best[1].toFixed(2)})` : '';
        console.log(`  - ${o}${hint}`);
    }
    if (!args.has('--prune')) console.log('  (--prune to delete)');
}
process.exitCode = orphans.length ? 1 : 0;
