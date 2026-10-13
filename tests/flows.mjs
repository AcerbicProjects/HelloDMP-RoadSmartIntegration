// End-to-end checks of the main workflows across the citizen app, officer app and control room.
// Runs against a served build: npm run build && npm run preview, then node tests/flows.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = 'test-results/flows';
fs.mkdirSync(OUT, { recursive: true });
const quizAnswers = [...fs.readFileSync(new URL('../src/data/learning.ts', import.meta.url), 'utf8').matchAll(/correct: (\d)/g)].map((m) => Number(m[1]));

const launch = async () => {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }
};
const browser = await launch();
const results = [];

async function newPage(viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/openstreetmap|net::|Failed to load resource/.test(m.text()) && page.errors.push(m.text()));
  page.setDefaultTimeout(6000);
  return { ctx, page };
}
const go = (page, route) => page.goto(`${BASE}#${route}`);
const see = (page, text) => page.getByText(text).first().waitFor();
const click = (page, role, name) => page.getByRole(role, { name }).first().click();
// The location explanation appears once, just before the first screen that needs a position.
async function dismissLocation(page) {
  const b = page.getByRole('button', { name: 'Not now' });
  try {
    await b.waitFor({ timeout: 2500 });
    await b.click();
  } catch {
    // Already answered earlier.
  }
}
async function ensureOfficer(page, name = 'Sergeant Md. Tanvir Ahmed') {
  await go(page, '/officer');
  const sw = page.getByRole('button', { name: 'Switch officer' });
  const pick = page.getByRole('radio', { name: new RegExp(name) });
  await Promise.race([sw.waitFor(), pick.waitFor()]);
  if (await sw.isVisible()) await sw.click();
  await pick.click();
  await click(page, 'button', 'Continue');
  await page.getByRole('button', { name: 'Switch officer' }).waitFor();
}

async function flow(name, page, fn) {
  const before = page.errors.length;
  try {
    await fn();
    const errs = page.errors.slice(before);
    results.push({ name, ok: errs.length === 0, note: errs.join(' | ') });
  } catch (e) {
    await page.screenshot({ path: `${OUT}/${name.replace(/\W+/g, '_')}.png` }).catch(() => {});
    results.push({ name, ok: false, note: String(e.message).split('\n')[0] });
  }
}

// One shared citizen + staff session at desktop width.
const { page } = await newPage();
await flow('Onboarding, English and demo sign-in', page, async () => {
  await page.goto(BASE);
  await click(page, 'button', 'শুরু করুন');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^(পরবর্তী|চালিয়ে যান)$/ }).click();
  await page.locator('input[type=checkbox]').last().check();
  await click(page, 'button', 'সম্মত ও শুরু করুন');
  await click(page, 'button', 'EN');
  await see(page, 'Welcome to DMP');
  await go(page, '/login');
  await click(page, 'button', /Use the demo account/);
  await see(page, 'Demo account: all levels verified');
});

await flow('Report → triage → officer → resolved → rating', page, async () => {
  await go(page, '/report');
  await dismissLocation(page);
  await page.getByRole('radio', { name: 'Illegal parking' }).click();
  await click(page, 'button', 'Next');
  await click(page, 'button', /Try a sample/);
  await see(page, 'IMG_2041.jpg');
  await click(page, 'button', 'Next');
  await page.getByLabel('What happened?').fill('A car is parked on the zebra crossing and blocks people.');
  await click(page, 'button', 'Next');
  await click(page, 'button', 'Send report');
  await page.waitForURL(/reports\/R246/);
  await see(page, 'Report received');
  await go(page, '/admin/triage');
  await page.getByRole('link', { name: /RPT-2026-000246/ }).click();
  await click(page, 'button', 'Verify (acknowledge)');
  await see(page, 'Verified by the control room');
  const row = page.locator('.card.flat', { has: page.getByRole('button', { name: 'Assign' }) }).first();
  const officer = (await row.locator('.strong').textContent()).trim();
  await row.getByRole('button', { name: 'Assign' }).click();
  await see(page, `Assigned to ${officer}`);
  await ensureOfficer(page, officer);
  await go(page, '/officer/tasks');
  await page.getByRole('link', { name: /Illegal parking/ }).first().click();
  await click(page, 'button', 'On my way');
  await see(page, 'Status: On the way');
  await click(page, 'button', 'Arrived on scene');
  await page.getByLabel('Action taken').selectOption('warned');
  await click(page, 'button', 'Mark resolved');
  await see(page, 'Status: Resolved');
  await go(page, '/reports/R246');
  await see(page, 'Warned on the spot');
  await page.getByRole('radio', { name: '5' }).click();
  await click(page, 'button', 'Submit rating');
  await see(page, 'Thanks for rating.');
  await go(page, '/notifications');
  await see(page, 'Report #246: Resolved');
});

await flow('AI detection confirmed by officer → citizen pays → receipt', page, async () => {
  await ensureOfficer(page);
  await go(page, '/officer/ai/DMP-AI-2026-1013-0101');
  for (const cb of await page.locator('label.check input[type=checkbox]').all()) await cb.check();
  await click(page, 'button', 'Confirm and send notice');
  await page.waitForURL(/officer\/ai$/);
  await go(page, '/cases/DMP-AI-2026-1013-0101');
  await see(page, 'Restricted entry');
  await page.getByRole('link', { name: /^Pay/ }).click();
  await click(page, 'button', /^Pay ৳/);
  await click(page, 'button', 'Approve (demo)');
  await page.waitForURL(/receipt\//);
  await see(page, 'Payment complete');
  await see(page, 'Prototype receipt; no real transaction took place.');
});

await flow('Objection → control room upholds → case cancelled', page, async () => {
  await go(page, '/cases/DMP-AI-2026-0712-0458/object');
  await page.getByRole('radio').nth(1).check();
  await page.getByLabel('Explain').fill('My car was at the service centre that evening; receipt attached.');
  await click(page, 'button', 'Submit objection');
  await see(page, 'Objection submitted; an officer will review it');
  await go(page, '/admin/objections');
  const card = page.locator('section.card', { hasText: 'DMP-AI-2026-0712-0458' });
  await card.getByRole('button', { name: 'Uphold (cancel case)' }).click();
  await see(page, 'Objection upheld; the citizen was told');
  await go(page, '/notifications');
  await see(page, 'Objection upheld: case cancelled');
});

await flow('Control room alert on a saved route notifies the citizen', page, async () => {
  await go(page, '/admin/content');
  await page.locator('#al-area').selectOption('badda');
  await page.locator('#al-tbn').fill('বাড্ডায় পানি জমেছে');
  await page.locator('#al-ten').fill('Water on the road in Badda');
  await page.locator('#al-dbn').fill('লিংক রোডে হাঁটুপানি');
  await page.getByRole('button', { name: 'Publish' }).first().click();
  await see(page, /Published; matched 1 saved route/);
  await go(page, '/notifications');
  await see(page, 'On your route: Water on the road in Badda');
  await go(page, '/alerts');
  await see(page, 'Water on the road in Badda');
});

await flow('SOS countdown → control room dispatch → end SOS', page, async () => {
  await go(page, '/sos');
  await dismissLocation(page);
  await click(page, 'button', 'I need help');
  await see(page, 'SOS is active');
  await go(page, '/admin/sos');
  await see(page, /SOS · /);
  await page.locator('button:has-text("Dispatch"):enabled').first().click();
  await see(page, 'Officer assigned');
  await go(page, '/sos');
  await click(page, 'button', /I am safe/);
  await see(page, 'SOS closed; location sharing stopped');
});

await flow('Officer QR checks: valid, expired, forged; citizen sees scan log', page, async () => {
  await ensureOfficer(page, 'Sergeant Nusrat Jahan');
  await go(page, '/officer/scan');
  await click(page, 'button', /Tap: scan the citizen/);
  await see(page, 'Valid and signed');
  await click(page, 'button', 'Expired wallet QR (screenshot)');
  await see(page, 'Expired QR');
  await click(page, 'button', 'Tampered (forged) QR');
  await see(page, 'Forged or altered QR');
  await go(page, '/wallet');
  await see(page, 'Who scanned my QR');
  const n = await page.locator('.list-row', { has: page.locator('.badge') }).filter({ hasText: /Valid|Invalid|Expired/ }).count();
  if (n < 4) throw new Error(`expected at least 4 wallet scan entries, saw ${n}`);
});

await flow('Officer e-challan reaches the citizen', page, async () => {
  await go(page, '/officer/challan');
  await page.locator('#ch-vio').selectOption('no_helmet');
  await page.locator('#ch-veh').selectOption('V2');
  await click(page, 'button', 'Issue e-challan');
  await see(page, 'e-Challan issued');
  await go(page, '/notifications');
  await see(page, 'New e-challan');
});

await flow('Simulated network failure shows an error and saves nothing', page, async () => {
  await go(page, '/settings');
  await page.getByRole('switch', { name: /Simulate network failure/ }).check();
  await go(page, '/feedback');
  const before = await page.locator('section .card').count();
  await page.getByRole('radio', { name: '4' }).click();
  await click(page, 'button', 'Send feedback');
  await see(page, /Connection failed/);
  const after = await page.locator('section .card').count();
  if (after !== before) throw new Error('feedback was saved despite the failure');
  await go(page, '/settings');
  await page.getByRole('switch', { name: /Simulate network failure/ }).uncheck();
  await go(page, '/feedback');
  await page.getByRole('radio', { name: '4' }).click();
  await click(page, 'button', 'Send feedback');
  await see(page, 'Thank you! Your feedback is saved in this prototype.');
});

await flow('Lessons + quiz → signed certificate', page, async () => {
  for (const id of ['helmet', 'speed', 'after-crash']) {
    await go(page, `/learn/lesson/${id}`);
    const b = page.getByRole('button', { name: /Mark as complete|Next lesson/ });
    if (await b.isVisible().catch(() => false)) await b.click();
  }
  await go(page, '/learn/quiz');
  for (const k of quizAnswers) {
    await page.getByRole('radiogroup').getByRole('radio').nth(k).click();
    await page.getByRole('button', { name: /Next question|See result/ }).click();
  }
  await see(page, 'Congratulations, you passed!');
  await go(page, '/learn/certificate');
  await see(page, 'Awarded to');
  await page.locator('img[alt*="QR"], canvas, svg[aria-label*="QR"]').first().waitFor();
});

await flow('Search finds a thana and opens it', page, async () => {
  await go(page, '/search?q=Ramna');
  await page.getByRole('link', { name: /Ramna/ }).first().click();
  await page.waitForURL(/thana\?id=/);
  await page.getByRole('dialog').waitFor();
});

await flow('Assistant answers from verified sources and admits a miss', page, async () => {
  await go(page, '/assistant');
  await page.getByLabel('Question').fill('helmet');
  await page.getByLabel('Question').press('Enter');
  await see(page, /Road Transport Act|DMP/);
  await page.getByLabel('Question').fill('what is the price of fish');
  await page.getByLabel('Question').press('Enter');
  await see(page, 'I do not have a verified answer to this question. I do not guess about the law.');
});

await flow('Fake SMS check and report', page, async () => {
  await go(page, '/sms-check');
  await click(page, 'button', 'Insert a sample fake SMS');
  await click(page, 'button', 'Check');
  await see(page, 'Fake message');
  await click(page, 'button', 'Report fake SMS');
  await see(page, 'Fake SMS report saved (demo)');
});

await flow('e-Rickshaw lookup and complaint', page, async () => {
  await go(page, '/rickshaw');
  await page.getByPlaceholder('e.g. ER-DS1-00872').fill('ER-DS1-00872');
  await click(page, 'button', 'Verify');
  await see(page, 'Registration expired');
  await page.getByRole('link', { name: 'Complain', exact: true }).first().click();
  await dismissLocation(page);
  await page.getByRole('radio').first().click();
  await click(page, 'button', 'Submit complaint');
  await page.waitForURL(/reports\/R\d+/);
});

await flow('Joint accident report', page, async () => {
  await go(page, '/report/joint');
  await dismissLocation(page);
  await page.getByRole('radio', { name: /Minor crash/ }).click();
  await click(page, 'button', 'Next');
  await click(page, 'button', 'Fill in a sample driver (demo)');
  await click(page, 'button', 'Next');
  await click(page, 'button', /Try a sample/);
  await see(page, 'IMG_2041.jpg');
  await click(page, 'button', 'Submit joint report');
  await page.waitForURL(/reports\/R\d+\?new=1/);
});

await flow('Settings persist across reload; reset restores the seed', page, async () => {
  await go(page, '/settings');
  await page.getByRole('radio', { name: 'Larger' }).click();
  await page.reload();
  const scale = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim());
  if (scale !== '1.3') throw new Error(`text scale after reload was ${scale}`);
  await page.getByRole('radio', { name: 'Normal' }).click();
  await click(page, 'button', 'Reset demo data');
  await page.getByRole('dialog').getByRole('button', { name: 'Reset' }).click();
  await see(page, 'Demo data was reset');
  await go(page, '/admin/triage');
  if (await page.getByText('RPT-2026-000246').count()) throw new Error('report 246 still present after reset');
});

await flow('Introduction replay keeps permission choices; guide and division link', page, async () => {
  await go(page, '/settings');
  const cam = page.getByRole('switch', { name: /Camera and photos/ });
  await cam.uncheck();
  await click(page, 'button', 'Show the introduction again');
  await click(page, 'button', 'Get started');
  await click(page, 'button', 'Skip');
  if (await page.getByRole('switch', { name: /^Camera/ }).isChecked()) throw new Error('replay switched the camera permission back on');
  await page.locator('input[type=checkbox]').last().check();
  await click(page, 'button', 'Agree and start');
  await see(page, 'Welcome to DMP');
  await go(page, '/settings');
  if (await page.getByRole('switch', { name: /Camera and photos/ }).isChecked()) throw new Error('camera permission changed after replay');
  await page.getByRole('switch', { name: /Camera and photos/ }).check();
  await go(page, '/learn/guide/checkpoint');
  await see(page, 'If you are stopped at a checkpoint');
  await page.locator('main').getByRole('link', { name: 'QR wallet' }).waitFor();
  await go(page, '/women-child');
  await page.getByText('Women Support & Investigation Division').first().click();
  const href = await page.getByRole('link', { name: 'Division website (external link)' }).getAttribute('href');
  if (href !== 'http://dmpwsid.gov.bd/') throw new Error(`division link was ${href}`);
});

// Offline queue on a phone-sized screen.
const phone = await newPage({ width: 390, height: 844 });
await flow('Phone: offline report is kept on the device, then sent', phone.page, async () => {
  const p = phone.page;
  await p.goto(BASE);
  await click(p, 'button', 'শুরু করুন');
  for (let i = 0; i < 3; i++) await p.getByRole('button', { name: /^(পরবর্তী|চালিয়ে যান)$/ }).click();
  await p.locator('input[type=checkbox]').last().check();
  await click(p, 'button', 'সম্মত ও শুরু করুন');
  await click(p, 'button', 'EN');
  await go(p, '/report');
  await dismissLocation(p);
  await p.getByRole('radio', { name: 'Road hazard' }).click();
  await click(p, 'button', 'Next');
  await click(p, 'button', 'Next');
  await p.getByLabel('What happened?').fill('An open manhole in the left lane near the junction.');
  await click(p, 'button', 'Next');
  await phone.ctx.setOffline(true);
  await see(p, 'You are offline');
  await click(p, 'button', 'Keep it on this device and send later');
  await p.waitForURL(/reports\/R\d+/);
  await see(p, 'This report has not been sent yet; it exists only on this device.');
  await phone.ctx.setOffline(false);
  await click(p, 'button', 'Send now');
  await see(p, 'Report sent');
});

await browser.close();
const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}  ${r.note ?? ''}`);
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
