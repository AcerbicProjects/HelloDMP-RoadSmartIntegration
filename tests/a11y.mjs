// Runs axe-core (WCAG 2.1 A/AA rules) on key screens in both languages and in high-contrast mode,
// and checks the service worker serves the app offline. Usage: node tests/a11y.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.argv[2] ?? 'http://localhost:4173/';
const ROUTES = ['/', '/report', '/alerts', '/cases', '/cases/DMP-AI-2026-0712-0458', '/wallet', '/assistant', '/thana', '/settings', '/learn/quiz', '/notifications', '/sos', '/admin', '/admin/triage', '/admin/content', '/officer'];

const launch = async () => {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }
};
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(BASE);
await page.getByRole('button', { name: 'শুরু করুন' }).click();
for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^(পরবর্তী|চালিয়ে যান)$/ }).click();
await page.locator('input[type=checkbox]').last().check();
await page.getByRole('button', { name: 'সম্মত ও শুরু করুন' }).click();
await page.goto(`${BASE}#/login`);
await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট/ }).click();

const summary = {};
for (const mode of ['bn', 'en', 'high-contrast']) {
  if (mode === 'en') await page.getByRole('button', { name: 'EN' }).first().click();
  if (mode === 'high-contrast') {
    await page.goto(`${BASE}#/settings`);
    await page.getByRole('switch', { name: /High contrast/ }).check();
  }
  for (const r of ROUTES) {
    await page.goto(`${BASE}#${r}`);
    await page.waitForTimeout(500);
    const nb = page.getByRole('button', { name: /Not now|এখন না/ });
    if (await nb.isVisible().catch(() => false)) await nb.click();
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () => {
      // @ts-ignore
      const out = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { region: { enabled: false } } });
      return out.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') + ' :: ' + (v.nodes[0]?.failureSummary ?? '').slice(0, 160) }));
    });
    for (const v of res) {
      const key = `${v.id} (${v.impact})`;
      summary[key] ??= { count: 0, where: [] };
      summary[key].count += v.n;
      if (summary[key].where.length < 6) summary[key].where.push(`${mode} ${r}: ${v.sample}`);
    }
  }
}

// Offline: the service worker should serve the app shell after one online visit.
await page.goto(BASE);
await page.waitForTimeout(1500);
await page.reload();
await page.waitForTimeout(1000);
await ctx.setOffline(true);
let offlineOk = false;
try {
  await page.goto(`${BASE}#/faq`);
  await page.reload();
  offlineOk = (await page.locator('h1').first().textContent({ timeout: 4000 })) !== null;
} catch {
  offlineOk = false;
}
await ctx.setOffline(false);
await browser.close();
console.log(JSON.stringify(summary, null, 1));
console.log('Offline reload served by service worker:', offlineOk);
