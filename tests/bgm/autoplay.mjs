import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { musicTracks } from '../../src/data/music.ts';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const firstTrack = musicTracks.find((track) => track.url.trim());
assert.ok(firstTrack, 'autoplay needs a configured first song');

for (const allowed of [true, false]) {
  const browser = await chromium.launch({
    ...(process.platform === 'win32' ? { channel: 'msedge' } : {}),
    args: [`--autoplay-policy=${allowed ? 'no-user-gesture-required' : 'document-user-activation-required'}`],
  });
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      window.__bgmAudios = [];
      window.__bgmAttempts = 0;
      window.__bgmDenied = [];
      window.__bgmDocument = Math.random();
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio {
        constructor(src) {
          super(src);
          window.__bgmAudios.push(this);
        }
        play() {
          window.__bgmAttempts++;
          const result = super.play();
          result.then(
            () => console.debug('bgm-test:playing'),
            (error) => {
              window.__bgmDenied.push(error.name);
              console.debug(`bgm-test:${error.name}`);
            },
          );
          return result;
        }
      };
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    // Observe a native result before any evaluate/locator calls can activate the test page.
    const entryResult = page.waitForEvent('console', { predicate: (message) => message.text().startsWith('bgm-test:') });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    assert.equal((await entryResult).text(), allowed ? 'bgm-test:playing' : 'bgm-test:NotAllowedError');
    if (!allowed) {
      await page.waitForFunction(() => window.__bgmDenied.includes('NotAllowedError'));
      assert.ok(await page.evaluate(() => window.__bgmAudios.every((audio) => audio.paused)));
      await page.locator('body').click({ position: { x: 8, y: 350 } });
    }
    await page.waitForFunction(() => window.__bgmAudios.some((audio) => !audio.paused && audio.currentTime > 0.2));
    const initial = await page.evaluate(() => ({
      source: window.__bgmAudios[0].src,
      document: window.__bgmDocument,
      count: window.__bgmAudios.length,
    }));
    assert.equal(initial.source, new URL(firstTrack.url, baseURL).href, 'entry playback uses the first song');

    await page.locator('#site-header [data-bgm-toggle]').click();
    const panel = page.locator('.bgm-panel');
    assert.equal(await panel.locator('.bgm-playback-error').count(), 0, 'autoplay denial is not a broken-file error');
    await panel.getByRole('button', { name: '暂停', exact: true }).click();
    await page.waitForFunction(() => window.__bgmAudios.every((audio) => audio.paused));
    await panel.getByRole('button', { name: '关闭面板', exact: true }).click();
    await panel.waitFor({ state: 'detached' });
    const attempts = await page.evaluate(() => window.__bgmAttempts);
    await page.locator('body').click({ position: { x: 8, y: 350 } });
    await page.locator('a[href="/about"]').first().click();
    await page.waitForURL('**/about');
    const after = await page.evaluate(() => ({
      paused: window.__bgmAudios.every((audio) => audio.paused),
      attempts: window.__bgmAttempts,
      document: window.__bgmDocument,
      count: window.__bgmAudios.length,
    }));
    assert.ok(after.paused, 'manual pause survives later interaction and internal navigation');
    assert.equal(after.attempts, attempts, 'entry autoplay never repeats after manual pause');
    assert.equal(after.document, initial.document);
    assert.equal(after.count, initial.count);
    console.log(
      `${allowed ? 'autoplay allowed' : 'autoplay blocked, first-click recovery'}: first song plays; pause and navigation pass`,
    );

    if (!allowed) {
      const keyboardPage = await context.newPage();
      const denied = keyboardPage.waitForEvent('console', {
        predicate: (message) => message.text() === 'bgm-test:NotAllowedError',
      });
      await keyboardPage.goto(baseURL);
      await denied;
      await keyboardPage.keyboard.press('Enter');
      await keyboardPage.waitForFunction(() => window.__bgmAudios.some((audio) => !audio.paused));
      console.log('autoplay blocked: keyboard interaction also starts playback');
    }
    await context.close();
  } finally {
    await browser.close();
  }
}
