// Optional browser regression suite; no project dependency is added.
// Set PLAYWRIGHT_MODULE to an installed Playwright package, and run against npm run dev.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(10000);
await page.clock.install({ time: new Date('2026-10-23T13:00:00Z') });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.APP_URL || 'http://127.0.0.1:5175';
const dialog = () => page.locator('dialog[open]');
const assertText = async (locator, value) => assert.ok((await locator.innerText()).includes(value), `Expected ${value}`);
const route = async path => {
  await page.evaluate(path => { history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }, path);
  await page.waitForFunction(path => location.pathname === path && document.querySelector('.management-content'), path);
  const section = ['/admin', '/staff'].includes(path) ? 'dashboard' : path.split('/').at(-1);
  await page.locator(`.page-${section}`).waitFor();
};
const close = async () => { await dialog().getByRole('button', { name: 'Close dialog', exact: true }).click(); };
try {
  await page.goto(`${base}/admin`);
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
  assert.equal(await page.locator('.management-content').evaluate(el => getComputedStyle(el).padding), '7px');
  await assertText(page.locator('.page-dashboard > .grid'), '6');
  await page.getByRole('link', { name: 'View all' }).click();
  assert.ok(page.url().endsWith('/admin/reservations'));
  await page.getByRole('button', { name: 'Guest Name', exact: true }).click();
  assert.equal(await page.locator('th[aria-sort="ascending"]').count(), 1);
  await page.getByRole('button', { name: 'Edit SE-8494', exact: true }).click();
  await dialog().getByLabel('Check-in Date', { exact: true }).fill('2026-10-23');
  await dialog().getByLabel('Check-out Date', { exact: true }).fill('2026-10-26');
  await dialog().getByRole('button', { name: 'Save Changes' }).click();
  await assertText(page.getByRole('status'), 'updated');

  await route('/staff/reservations');
  await page.getByRole('button', { name: 'Confirm SE-8494', exact: true }).click();
  await dialog().getByRole('button', { name: 'Confirm Reservation', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Confirm SE-8494', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Check-in SE-8494', exact: true }).click();
  await dialog().getByRole('button', { name: 'Complete Check-In' }).click();
  await route('/admin/rooms');
  const occupiedRoom = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Room 210', exact: true }) });
  await assertText(occupiedRoom, 'Occupied');
  await route('/staff/reservations');
  await page.getByRole('button', { name: 'Checkout SE-8494', exact: true }).click();
  await dialog().getByRole('button', { name: 'Complete Check-Out' }).click();
  await assertText(dialog(), 'Guest Receipt');
  await assertText(dialog(), 'Denina');
  await assertText(dialog(), '10,500.00');
  await dialog().getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Checkout SE-8494', exact: true }).count(), 0);
  await route('/admin/rooms');
  await assertText(occupiedRoom, 'Needs Cleaning');
  await page.getByRole('button', { name: 'View Room 210', exact: true }).click();
  await dialog().getByRole('button', { name: 'Update Operational Status' }).click();
  await dialog().getByRole('radio').first().check();
  await dialog().getByRole('button', { name: 'Save Status' }).click();
  await close();
  await assertText(occupiedRoom, 'Available');
  console.log('PASS reservation lifecycle, receipt, shared room state and housekeeping');

  await page.getByRole('button', { name: 'Add Room', exact: true }).click();
  await dialog().locator('[name="name"]').fill('Room 999');
  await dialog().locator('[name="price"]').fill('2400');
  await dialog().getByRole('button', { name: 'Add Room', exact: true }).click();
  await page.getByRole('button', { name: 'View Room 999', exact: true }).click();
  await dialog().getByRole('button', { name: 'Edit Room', exact: true }).click();
  await dialog().locator('[name="name"]').fill('Room 998');
  await dialog().getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('button', { name: 'View Room 998', exact: true }).click();
  await dialog().getByRole('button', { name: 'Remove Room' }).click();
  await dialog().getByRole('button', { name: 'Remove Room' }).click();
  assert.equal(await page.getByRole('button', { name: 'View Room 998', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'View Room 998', exact: true }).waitFor();
  await route('/staff/rooms');
  assert.equal(await page.getByRole('button', { name: 'Add Room', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'View Room 998', exact: true }).click();
  assert.equal(await dialog().getByRole('button', { name: 'Edit Room', exact: true }).count(), 0);
  await close();
  await route('/admin');
  await assertText(page.locator('.page-dashboard > .grid'), '7');
  await route('/admin/rooms');
  for (const number of ['990', '991', '992']) {
    await page.getByRole('button', { name: 'Add Room', exact: true }).click();
    await dialog().locator('[name="name"]').fill('Room ' + number);
    await dialog().locator('[name="price"]').fill('2400');
    await dialog().getByRole('button', { name: 'Add Room', exact: true }).click();
  }
  assert.equal(await page.locator('.room-inventory-card').count(), 9);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  assert.equal(await page.locator('.room-inventory-card').count(), 1);
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  console.log('PASS room add/edit/remove/undo, nine-card pagination and Staff permissions');

  await route('/admin/users');
  await page.getByRole('button', { name: 'Add Staff' }).click();
  await dialog().locator('[name="name"]').fill('Test Staff');
  await dialog().locator('[name="email"]').fill('staff-test@example.com');
  await dialog().getByRole('button', { name: 'Create Staff Account' }).click();
  await page.getByRole('button', { name: 'View Test Staff', exact: true }).click();
  await dialog().getByRole('button', { name: 'Suspend account' }).click();
  await page.getByRole('button', { name: 'Edit Test Staff', exact: true }).click();
  await dialog().locator('[name="systemRole"]').selectOption('Guest');
  await dialog().getByRole('button', { name: 'Save Changes' }).click();
  const user = page.locator('tbody tr').filter({ hasText: 'Test Staff' });
  await assertText(user, 'Guest');
  await assertText(user, 'Suspended');
  await route('/admin/rooms');
  await route('/admin/users');
  await assertText(user, 'Suspended');
  console.log('PASS user creation, suspension, role editing and navigation retention');

  await route('/admin/reviews');
  assert.equal(await page.locator('.page-reviews article').count(), 7);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  assert.equal(await page.locator('.page-reviews article').count(), 1);
  await page.getByRole('button', { name: 'Keep', exact: true }).click();
  await page.getByRole('button', { name: 'Kept', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await dialog().getByRole('button', { name: 'Remove Review', exact: true }).click();
  assert.equal(await page.locator('.page-reviews article').count(), 7);
  await page.getByLabel('Filter by rating').selectOption('1');
  assert.equal(await page.locator('.page-reviews article').count(), 1);
  const height = await page.locator('.page-reviews article').evaluate(el => el.getBoundingClientRect().height);
  assert.ok(height < 200, `Filtered review stretched to ${height}px`);
  console.log('PASS review moderation, filtering and seven-row pagination');

  await route('/admin/reports');
  await page.getByLabel('Report start date').fill('2026-10-23');
  await page.getByLabel('Report end date').fill('2026-10-27');
  const bookingStat = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Total Bookings', exact: true }) });
  assert.equal((await bookingStat.locator('strong').innerText()).trim(), '4');
  await page.getByLabel('Report end date').fill('2026-10-22');
  await assertText(page.getByRole('alert'), 'End date');
  await page.getByRole('button', { name: 'This Month', exact: true }).click();
  await page.getByRole('img', { name: 'Bookings per Period' }).waitFor();
  console.log('PASS report totals, date validation, presets and chart');

  await route('/staff/support');
  await page.getByRole('textbox', { name: 'Type a reply' }).fill('Browser test reply');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await assertText(page.getByRole('log'), 'Browser test reply');
  await page.getByRole('button').filter({ hasText: 'Marcus Sterling' }).click();
  assert.ok(!(await page.getByRole('log').innerText()).includes('Browser test reply'));
  await page.getByRole('button').filter({ hasText: 'Hugh Jorgan' }).click();
  await assertText(page.getByRole('log'), 'Browser test reply');
  await route('/staff');
  await route('/staff/support');
  await assertText(page.getByRole('log'), 'Browser test reply');
  await page.getByRole('button', { name: 'Mark Resolved', exact: true }).click();
  assert.ok(await page.getByRole('textbox', { name: 'Type a reply' }).isDisabled());
  await page.getByRole('button', { name: 'Reopen', exact: true }).click();
  assert.ok(await page.getByRole('textbox', { name: 'Type a reply' }).isEnabled());
  for (let index = 0; index < 12; index++) {
    await page.getByRole('textbox', { name: 'Type a reply' }).fill(`History message ${index} with enough text to overflow the independently scrollable conversation panel.`);
    await page.getByRole('button', { name: 'Send', exact: true }).click();
  }
  const log = page.getByRole('log');
  assert.ok(await log.evaluate(el => el.scrollHeight > el.clientHeight));
  await log.evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll')); });
  const before = await log.locator(':scope > div').count();
  // Reuse the exact dev module URL, including its HMR timestamp, to exercise the
  // active store rather than accidentally importing a second module instance.
  const storeUrl = await page.evaluate(async () => {
    const source = await (await fetch('/src/staff/CustomerSupport.jsx')).text();
    const match = source.match(/from ["']([^"']*management-store[^"']*)["']/);
    if (!match) throw new Error('Run this suite against the Vite development server.');
    return match[1];
  });
  await page.evaluate(async url => { const { managementActions } = await import(url); managementActions.sendSupportMessage(1, 'Another staff update while reading history'); }, storeUrl);
  await page.waitForFunction(count => document.querySelector('[role="log"]').children.length === count + 1, before);
  assert.ok(await log.evaluate(el => el.scrollTop < 10));
  await page.getByRole('textbox', { name: 'Type a reply' }).fill('Outgoing reply follows the bottom');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  assert.ok(await log.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop < 10));
  console.log('PASS support selection, replies, history, resolution and reopening');

  for (const path of ['/admin/account', '/staff/account']) {
    await route(path);
    await page.getByRole('button', { name: 'Edit Profile', exact: true }).click();
    await dialog().locator('[name="name"]').fill(path.startsWith('/staff') ? 'Staff Demo' : 'Admin Demo');
    await dialog().getByRole('button', { name: 'Save changes', exact: true }).click();
    await route('/admin/rooms');
    await route(path);
    await assertText(page.locator('.management-content'), path.startsWith('/staff') ? 'Staff Demo' : 'Admin Demo');
  }
  await page.getByRole('button', { name: 'Change Password', exact: true }).click();
  await dialog().locator('[name="current"]').fill('old-password');
  await dialog().locator('[name="next"]').fill('new-password');
  await dialog().locator('[name="confirm"]').fill('new-password');
  await dialog().getByRole('button', { name: 'Update password', exact: true }).click();
  await assertText(dialog().getByRole('alert'), 'No password was changed');
  await dialog().getByRole('button', { name: 'Cancel', exact: true }).click();
  console.log('PASS role-specific account profiles and honest password feedback');

  for (const path of ['/admin', '/admin/rooms', '/admin/reservations', '/admin/users', '/admin/reviews', '/admin/reports', '/staff/reservations', '/staff/support']) {
    await route(path);
    const padding = await page.locator('.management-content').evaluate(el => getComputedStyle(el).padding);
    assert.equal(padding, '7px');
    if (!['/admin', '/staff'].includes(path)) assert.ok(await page.locator('tbody tr').count() <= 7);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/admin/rooms', '/staff/support', '/admin/reservations']) {
    await route(path);
    assert.ok(await page.locator('.management-content').isVisible());
  }
  assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
  console.log('PASS route smoke checks, 7px padding, responsive render and no runtime exceptions');
} finally {
  await browser.close();
}
