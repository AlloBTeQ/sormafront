import { readFileSync, writeFileSync } from 'node:fs';

const mode = process.argv[2];
if (mode !== 'on' && mode !== 'off') { console.error('Usage: pnpm app-live on|off'); process.exit(1); }

const APP = 'https://app.sormalitics.com';
const APP_ONLY = ['dashboard', 'auth', 'checkout', 'verify', 'invite', 'agreements', 'docs', 'plans', 'quotes', 'staff', 'subscribe', 'team', 'practice', 'landing', 'api'];
const SUB_ROUTES_ONLY = ['store', 'fisi', 'pricing'];
const live = mode === 'on';
const to = (p) => (live ? `${APP}${p}` : '/in-development');

const redirects = [];
for (const p of APP_ONLY) {
  redirects.push({ source: `/${p}`, destination: to(`/${p}`), permanent: live });
  redirects.push({ source: `/${p}/:path*`, destination: to(`/${p}/:path*`), permanent: live });
}
for (const p of SUB_ROUTES_ONLY) redirects.push({ source: `/${p}/:path+`, destination: to(`/${p}/:path+`), permanent: live });
redirects.push({ source: '/health', destination: to('/health'), permanent: false });
redirects.push({ source: '/manifest.json', destination: '/site.webmanifest', permanent: true });
redirects.push({ source: '/support', destination: '/help', permanent: true });

const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
cfg.redirects = redirects;
writeFileSync('vercel.json', JSON.stringify(cfg, null, 2) + '\n');
console.log(`vercel.json redirects → ${live ? APP : '/in-development'}. Remember NEXT_PUBLIC_APP_LIVE=${live} in Vercel.`);
