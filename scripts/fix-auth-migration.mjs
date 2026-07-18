import fs from 'fs'
import path from 'path'

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) files.push(p)
  }
  return files
}

const files = walk('src/app')
const changed = []

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8')
  const orig = src

  // Fix: method: 'PUT': { 'Content-Type': ... }  → method: 'PUT', headers: { ... }
  // apiFetch already sets Content-Type for JSON bodies, so strip headers entirely when only that.
  src = src.replace(
    /method:\s*'(GET|POST|PUT|PATCH|DELETE)':\s*\{\s*'Content-Type':\s*'application\/json'\s*\}/g,
    "method: '$1'"
  )
  src = src.replace(
    /method:\s*"(GET|POST|PUT|PATCH|DELETE)":\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/g,
    'method: "$1"'
  )

  // Empty headers object
  src = src.replace(/,\s*headers:\s*\{\s*\}/g, '')
  src = src.replace(/\{\s*headers:\s*\{\s*\}\s*\}/g, '{}')
  src = src.replace(/apiFetch\(([^,]+),\s*\{\s*\}\s*\)/g, 'apiFetch($1)')

  // Multi-line Authorization leftovers with undefined token
  src = src.replace(
    /headers:\s*\{\s*\n\s*'Content-Type':\s*'application\/json',\s*\n\s*Authorization:\s*`Bearer \$\{token\}`,\s*\n\s*\},/g,
    ''
  )
  src = src.replace(
    /headers:\s*\{\s*\n\s*'Content-Type':\s*'application\/json',\s*\n\s*Authorization:\s*`Bearer \$\{token\}`,?\s*\n\s*\}/g,
    ''
  )
  src = src.replace(/\n\s*Authorization:\s*`Bearer \$\{token\}`,?/g, '')
  src = src.replace(/Authorization:\s*`Bearer \$\{token\}`,?\s*/g, '')

  // Clean double blank lines / odd whitespace from removed token lines
  src = src.replace(/\n{3,}/g, '\n\n')

  // Fix import glued to interface
  src = src.replace(
    /import \{ apiFetch \} from '@\/lib\/api-client'\ninterface /g,
    "import { apiFetch } from '@/lib/api-client'\n\ninterface "
  )
  src = src.replace(
    /import \{ apiFetch \} from '@\/lib\/api-client'\nconst /g,
    "import { apiFetch } from '@/lib/api-client'\n\nconst "
  )
  src = src.replace(
    /import \{ apiFetch \} from '@\/lib\/api-client'\nexport /g,
    "import { apiFetch } from '@/lib/api-client'\n\nexport "
  )
  src = src.replace(
    /import \{ apiFetch \} from '@\/lib\/api-client'\nfunction /g,
    "import { apiFetch } from '@/lib/api-client'\n\nfunction "
  )

  // Collapse excessive leading spaces left after token line removal (4+ spaces before const/await only if weird)
  src = src.replace(/\n {8,}const /g, '\n      const ')
  src = src.replace(/\n {8,}await /g, '\n      await ')
  src = src.replace(/\n {12,}const /g, '\n        const ')
  src = src.replace(/\n {12,}await /g, '\n        await ')

  if (src !== orig) {
    fs.writeFileSync(file, src)
    changed.push(file)
  }
}

console.log(`Fixed ${changed.length} files:`)
for (const f of changed) console.log(' -', f)
