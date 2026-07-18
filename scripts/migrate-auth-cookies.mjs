import fs from 'fs'
import path from 'path'

const roots = [
  'src/app/(dashboard)',
  'src/app/(auth)/verify-email',
  'src/app/(auth)/verify-phone',
  'src/app/(auth)/verify-identity',
]

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) files.push(p)
  }
  return files
}

const files = roots.flatMap((r) => walk(r))
const changed = []

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8')
  const orig = src

  const needsWork =
    src.includes('session_token') ||
    src.includes("localStorage.getItem('user')") ||
    (src.includes('Authorization') && src.includes('Bearer'))

  if (!needsWork) continue

  // Ensure apiFetch import
  if (!src.includes("from '@/lib/api-client'") && !src.includes('from "@/lib/api-client"')) {
    const importBlock = src.match(
      /^(?:'use client'\s*\n+)?(?:import[\s\S]*?from\s+['"][^'"]+['"]\s*\n)+/
    )
    if (importBlock) {
      src = src.replace(importBlock[0], importBlock[0] + "import { apiFetch } from '@/lib/api-client'\n")
    }
  }

  // Remove token + headers const patterns
  src = src.replace(
    /\s*const token = typeof window !== 'undefined' \? localStorage\.getItem\('session_token'\) \?\? '' : null\s*\n\s*const headers = \{ Authorization: `Bearer \$\{token\}`, 'Content-Type': 'application\/json' \}\s*\n/g,
    '\n'
  )
  src = src.replace(
    /\s*const token = localStorage\.getItem\('session_token'\)\s*\n\s*const headers = \{ Authorization: `Bearer \$\{token\}` \}\s*\n/g,
    '\n'
  )
  src = src.replace(
    /const token = typeof window !== 'undefined' \? localStorage\.getItem\('session_token'\) \?\? '' : null\n/g,
    ''
  )
  src = src.replace(/const token = localStorage\.getItem\('session_token'\) \?\? ''\n/g, '')
  src = src.replace(/const token = localStorage\.getItem\('session_token'\)\n/g, '')
  src = src.replace(
    /const headers = \{ Authorization: `Bearer \$\{token\}`, 'Content-Type': 'application\/json' \}\n/g,
    ''
  )
  src = src.replace(/const headers = \{ Authorization: `Bearer \$\{token\}` \}\n/g, '')

  // Inline Authorization headers
  src = src.replace(
    /headers:\s*\{\s*'Content-Type':\s*'application\/json',\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
    "headers: { 'Content-Type': 'application/json' }"
  )
  src = src.replace(
    /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`,\s*'Content-Type':\s*'application\/json'\s*\}/g,
    "headers: { 'Content-Type': 'application/json' }"
  )
  src = src.replace(/headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g, 'headers: {}')

  // Authenticated API calls → apiFetch
  src = src.replace(/\bfetch\((['"`]\/api\/)/g, 'apiFetch($1')

  // Drop empty headers
  src = src.replace(/,\s*headers:\s*\{\}/g, '')
  src = src.replace(/headers:\s*\{\}\s*,/g, '')
  src = src.replace(/\{\s*headers\s*\}/g, '{}')

  // Drop leftover `headers` variable refs after const removal
  src = src.replace(/method: '([^']+)', headers,/g, "method: '$1',")
  src = src.replace(/method: "([^"]+)", headers,/g, 'method: "$1",')
  src = src.replace(/, headers,/g, ',')
  src = src.replace(/, headers\b/g, '')
  src = src.replace(/\{ headers, /g, '{ ')
  src = src.replace(/headers, body/g, 'body')
  src = src.replace(/\{ headers \}/g, '{}')

  // delete account cleanup
  src = src.replace(
    /localStorage\.clear\(\)\s*\n\s*window\.location\.href = '\/login'/g,
    "window.location.href = '/login'"
  )

  if (src !== orig) {
    fs.writeFileSync(file, src)
    changed.push(file)
  }
}

console.log(`Changed ${changed.length} files:`)
for (const f of changed) console.log(' -', f)
