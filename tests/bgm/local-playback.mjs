import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Exercise real media decoding and Astro navigation against the local development server.
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
await mkdir('.acceptance', { recursive: true });
const browser = await chromium.launch({
  ...(process.platform === 'win32' ? { channel: 'msedge' } : {}),
  args: ['--autoplay-policy=document-user-activation-required'],
});
try {
  for (const scenario of [
    { name: 'desktop', width: 1280, height: 900, dark: false },
    { name: 'mobile', width: 390, height: 844, dark: true },
    { name: 'small-mobile', width: 320, height: 667, dark: false },
  ]) {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: scenario.height } });
    await context.addInitScript(({ dark }) => {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      window.__bgmAudios = [];
      window.__bgmDocument = Math.random();
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio {
        constructor(src) {
          super(src);
          window.__bgmAudios.push(this);
        }
        play() {
          const result = super.play();
          result.then(
            () => console.debug('bgm-entry:playing'),
            (error) => console.debug(`bgm-entry:${error.name}`),
          );
          return result;
        }
      };
    }, scenario);
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const platformRequests = [];
    page.on('request', (request) => {
      if (/163\.hyc\.moe|music\.163\.com|y\.qq\.com/.test(request.url())) platformRequests.push(request.url());
    });
    const entryResult = page.waitForEvent('console', { predicate: (message) => message.text().startsWith('bgm-entry:') });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    assert.equal((await entryResult).text(), 'bgm-entry:NotAllowedError');
    const toggle = page.locator('#site-header [data-bgm-toggle]');
    await toggle.waitFor();
    assert.equal(await page.locator('[data-bgm-toggle]').count(), 1, 'music has a single header entry point');
    const musicBounds = await toggle.boundingBox();
    const searchBounds = await page.getByRole('button', { name: '搜索', exact: true }).boundingBox();
    assert.ok(musicBounds.x + musicBounds.width <= searchBounds.x + 1, 'music sits to the left of search');
    assert.ok(Math.abs(musicBounds.y - searchBounds.y) < 2, 'music and search share a row');
    if (scenario.width < 992) {
      const logoBounds = await page.locator('#site-header .header-content > div > a').boundingBox();
      assert.ok(logoBounds.x + logoBounds.width <= musicBounds.x + 1, 'mobile logo and controls do not overlap');
    }
    assert.equal(
      await page.evaluate(() => window.__bgmAudios.some((audio) => !audio.paused)),
      false,
      'must wait for a user gesture',
    );
    await toggle.click();
    const panel = page.locator('.bgm-panel');
    await panel.locator('.audio-player-song-item').first().waitFor();
    const bounds = await panel.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= scenario.width, 'playlist fits viewport');
    assert.ok(bounds.y >= musicBounds.y + musicBounds.height, 'playlist opens below the header');
    await panel.locator('.audio-player-song-item').first().click();
    await page.waitForFunction(() => window.__bgmAudios.some((audio) => !audio.paused && audio.currentTime > 0.5));
    await panel.getByRole('button', { name: '关闭面板', exact: true }).click();
    await panel.waitFor({ state: 'detached' });
    const before = await page.evaluate(() => {
      const audio = window.__bgmAudios.find((item) => !item.paused);
      return {
        time: audio.currentTime,
        document: window.__bgmDocument,
        count: window.__bgmAudios.length,
        duration: audio.duration,
      };
    });
    assert.ok(before.duration > 0, 'real audio metadata decoded');
    if (scenario.name === 'desktop') {
      await page.locator('a[href="/about"]').first().click();
      await page.waitForURL('**/about');
      await page.waitForFunction(
        (time) => window.__bgmAudios.some((audio) => !audio.paused && audio.currentTime > time),
        before.time,
      );
      const after = await page.evaluate(() => ({ document: window.__bgmDocument, count: window.__bgmAudios.length }));
      assert.equal(after.document, before.document, 'internal navigation preserves document');
      assert.equal(after.count, before.count, 'internal navigation preserves the audio element');
    }
    await toggle.click();
    await panel.getByRole('button', { name: '暂停', exact: true }).click();
    await page.waitForFunction(() => window.__bgmAudios.every((audio) => audio.paused));
    await panel.getByRole('button', { name: '播放', exact: true }).click();
    await page.waitForFunction(() => window.__bgmAudios.some((audio) => !audio.paused));
    await panel.waitFor();
    await page.waitForFunction(() => {
      const panel = document.querySelector('.bgm-panel-position');
      const content = document.querySelector('.bgm-panel-ready');
      return (
        panel &&
        content &&
        getComputedStyle(panel).opacity === '1' &&
        content.getAnimations().every((animation) => animation.playState === 'finished')
      );
    });
    const expandedBounds = await panel.boundingBox();
    assert.ok(expandedBounds.y < 100, 'playlist stays below the header after navigation');
    assert.ok(scenario.width - expandedBounds.x - expandedBounds.width < 64, 'playlist stays aligned to the right');
    await page.screenshot({ path: `.acceptance/bgm-${scenario.name}.png` });
    if (
      (await panel.locator('.audio-player-song-item').count()) === 1 &&
      (await panel.evaluate((node) => node.classList.contains('bgm-panel-no-lyrics')))
    ) {
      assert.ok((await panel.boundingBox()).height < 400, 'a single song without lyrics uses a compact panel');
    }
    assert.ok(musicBounds.x >= 0 && searchBounds.x + searchBounds.width <= scenario.width, 'header controls fit viewport');
    assert.equal(platformRequests.length, 0, 'local music must not depend on a music platform API');
    console.log(
      `${scenario.name}: real audio plays, panel closes without pausing, controls and layout pass${scenario.name === 'desktop' ? ', navigation preserves playback' : ''}`,
    );
    await panel.getByRole('button', { name: '暂停', exact: true }).click();
    await context.close();
  }

  // A missing file must leave a recoverable error instead of an endless spinner.
  const context = await browser.newContext();
  const page = await context.newPage();
  const audioRoute = /\/music\/[^/?]+\.(?:mp3|m4a|ogg|wav|flac)(?:\?.*)?$/i;
  await page.route(audioRoute, (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto(baseURL);
  await page.locator('#site-header [data-bgm-toggle]').click();
  const panel = page.locator('.bgm-panel');
  await panel.getByRole('button', { name: '播放', exact: true }).click();
  await page.locator('.bgm-playback-error').waitFor();
  assert.equal(await panel.locator('.audio-player-btn-play.loading').count(), 0);
  await page.unroute(audioRoute);
  await panel.getByRole('button', { name: '播放', exact: true }).click();
  await panel.getByRole('button', { name: '暂停', exact: true }).waitFor();
  await panel.getByRole('button', { name: '暂停', exact: true }).click();
  await context.close();
  console.log('missing audio: error is displayed and playback recovers after the file becomes available');
} finally {
  await browser.close();
}
