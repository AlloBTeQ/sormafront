import { readFileSync } from 'node:fs';

const url = process.argv[2] || 'https://sormalitics.com';
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const expected = config.headers.find((h) => h.source === '/(.*)').headers;

const norm = (v) => v.split(';').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean).sort().join('; ');

const res = await fetch(url, { redirect: 'follow' });
let failed = false;
for (const { key, value } of expected) {
  const actual = res.headers.get(key);
  if (actual === null) {
    console.error(`MISSING  ${key}`);
    failed = true;
  } else if (norm(actual) !== norm(value)) {
    console.error(`DRIFT    ${key}\n  expected: ${value}\n  actual:   ${actual}`);
    failed = true;
  } else {
    console.log(`ok       ${key}`);
  }
}
const sectxt = await fetch(new URL('/.well-known/security.txt', url));
if (!sectxt.ok) {
  console.error(`MISSING  /.well-known/security.txt (${sectxt.status})`);
  failed = true;
}
process.exit(failed ? 1 : 0);
