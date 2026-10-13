// Visits every screen at phone, tablet and desktop widths and reports console errors, page errors,
// horizontal overflow and buttons without an accessible name. Usage: node tests/crawl.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = process.env.SHOTS ?? 'test-results/crawl';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  '/', '/menu', '/search?q=helmet', '/online-services', '/cyber', '/women-child', '/traffic', '/traffic/act', '/complaint', '/thana', '/faq', '/emergency',
  '/alerts', '/alerts/A2', '/routes', '/report', '/report?kind=cyber', '/report/joint', '/reports', '/reports/R241', '/sos',
  '/cases', '/cases/DMP-AI-2026-0712-0458', '/cases/DMP-AI-2026-0721-1133', '/cases/DMP-AI-2026-0712-0458/pay', '/cases/DMP-AI-2026-0712-0458/object',
  '/cases/DMP-AI-2026-0721-1133/nominate', '/receipt/DMP-POS-2026-0628-7710', '/violations', '/login', '/profile', '/profile/verify', '/wallet', '/assistant', '/assistant?q=helmet',
  '/sms-check', '/rickshaw', '/rickshaw/ER-DN2-00145', '/rickshaw/ER-DN2-00145/complain', '/learn', '/learn/lesson/helmet', '/learn/quiz', '/learn/certificate', '/learn/signs',
  '/learn/guide/post-accident', '/notifications', '/announcements', '/feedback', '/settings', '/privacy', '/nope',
  '/officer', '/admin', '/admin/triage', '/admin/reports/R244', '/admin/map', '/admin/objections', '/admin/content', '/admin/sos',
];
const OFFICER = ['/officer', '/officer/tasks', '/officer/tasks/R243', '/officer/ai', '/officer/ai/DMP-AI-2026-1013-0101', '/officer/scan', '/officer/challan', '/officer/map'];
const SIZES = { phone: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 }, desktop: { width: 1366, height: 900 } };

const launch = async () => {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }
};

const browser = await launch();
const problems = [];
for (const [size, viewport] of Object.entries(SIZES)) {
  const ctx = await browser.newContext({ viewport, locale: 'bn-BD' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && !/tile\.openstreetmap|ERR_|net::/.test(m.text()) && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  await page.goto(BASE);
  // Walk through onboarding once with the real UI.
  await page.getByRole('button', { name: /শুরু করুন|Get started/ }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^(পরবর্তী|চালিয়ে যান)$/ }).click();
  await page.locator('input[type=checkbox]').last().check();
  await page.getByRole('button', { name: /সম্মত ও শুরু করুন/ }).click();
  await page.waitForTimeout(300);
  await page.goto(`${BASE}#/login`);
  await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট|demo account/i }).click();
  await page.waitForTimeout(400);

  const visit = async (route) => {
    errs.length = 0;
    await page.goto(`${BASE}#${route}`);
    await page.waitForTimeout(route.includes('map') || route === '/thana' || route.startsWith('/alerts') ? 900 : 350);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      unnamed: [...document.querySelectorAll('button, a[href], [role=button]')]
        .filter((el) => el.offsetParent !== null && !(el.getAttribute('aria-label') || el.textContent?.trim() || el.getAttribute('title') || el.querySelector('img[alt]:not([alt=""])')))
        .map((el) => el.outerHTML.slice(0, 120)),
      h1: document.querySelector('h1')?.textContent ?? '',
    }));
    const name = `${size}${route.replace(/[/?=&]/g, '_')}`.slice(0, 90);
    if (size !== 'tablet' || ['/', '/alerts', '/cases', '/admin', '/officer'].includes(route)) await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    if (errs.length) problems.push({ size, route, kind: 'console', detail: [...errs] });
    if (info.overflow > 1) problems.push({ size, route, kind: 'overflow', detail: info.overflow });
    if (info.unnamed.length) problems.push({ size, route, kind: 'unnamed', detail: info.unnamed });
    if (!info.h1 && !route.startsWith('/officer') && route !== '/') problems.push({ size, route, kind: 'no-h1' });
  };

  for (const r of ROUTES) await visit(r);
  // Officer pages need the demo officer profile chosen first.
  await page.goto(`${BASE}#/officer`);
  await page.getByRole('button', { name: /চালিয়ে যান|Continue/ }).click();
  for (const r of OFFICER) await visit(r);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/problems.json`, JSON.stringify(problems, null, 2));
console.log(problems.length ? JSON.stringify(problems, null, 1) : 'No problems found');
