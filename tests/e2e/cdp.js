// Minimal Chrome DevTools Protocol driver, so browser tests need no dependencies.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
];

export function findBrowser() {
  return CANDIDATES.find((p) => p && existsSync(p));
}

export async function launch({ profileDir, width = 1440, height = 960 }) {
  const executable = findBrowser();
  if (!executable) throw new Error('No Chrome or Edge found. Set CHROME_PATH.');
  const proc = spawn(executable, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    // Chrome refuses to start as root (Linux containers, CI) unless sandboxing is off.
    ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []),
    'about:blank',
  ]);
  const wsUrl = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error(`Browser did not start:\n${log}`)), 20_000);
    proc.stderr.on('data', (chunk) => {
      log += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(log);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    proc.on('exit', () => reject(new Error(`Browser exited early:\n${log}`)));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners.get(msg.method) ?? []) fn(msg.params);
    }
  };

  const rawSend = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const { targetId } = await rawSend('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await rawSend('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => rawSend(method, params, sessionId);
  const on = (method, fn) => listeners.set(method, [...(listeners.get(method) ?? []), fn]);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  async function evaluate(expression) {
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) {
      throw new Error(`${exceptionDetails.exception?.description ?? exceptionDetails.text}\n  in: ${expression}`);
    }
    return result.value;
  }

  async function waitFor(expression, { timeout = 5000, label } = {}) {
    const deadline = Date.now() + timeout;
    let last;
    while (Date.now() < deadline) {
      try {
        last = await evaluate(expression);
        if (last) return last;
      } catch (err) {
        last = err.message;
      }
      await new Promise((r) => setTimeout(r, 40));
    }
    throw new Error(`Timed out waiting for: ${label ?? expression} (last: ${JSON.stringify(last)})`);
  }

  const quote = JSON.stringify;
  const page = {
    send,
    on,
    evaluate,
    waitFor,
    async goto(url) {
      await send('Page.navigate', { url });
    },
    async route(hash) {
      const before = await evaluate(`document.getElementById('view').dataset.ready`);
      const same = await evaluate(`location.hash === ${quote(hash)}`);
      if (same) return;
      await evaluate(`location.hash = ${quote(hash)}`);
      await waitFor(`document.getElementById('view').dataset.ready !== ${quote(before ?? '')}`, { label: `route ${hash}` });
    },
    async reload() {
      await evaluate(`window.__preReload = true`);
      await send('Page.reload', { ignoreCache: true });
      await waitFor(`!window.__preReload && document.readyState === 'complete' && (Boolean(document.getElementById('view').dataset.ready) || Boolean(document.getElementById('login-form')))`, { label: 'reload' });
    },
    async click(selector) {
      await waitFor(`document.querySelector(${quote(selector)})`, { label: selector });
      await evaluate(`document.querySelector(${quote(selector)}).click()`);
    },
    // Focuses and inserts through the browser's input pipeline, like real typing.
    async type(selector, text) {
      await waitFor(`document.querySelector(${quote(selector)})`, { label: selector });
      await evaluate(`(() => { const el = document.querySelector(${quote(selector)}); el.focus(); el.select?.(); })()`);
      await send('Input.insertText', { text });
    },
    async select(selector, value) {
      await evaluate(`(() => { const el = document.querySelector(${quote(selector)}); el.value = ${quote(value)}; el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    },
    text: (selector) => evaluate(`document.querySelector(${quote(selector)})?.innerText ?? null`),
    exists: (selector) => evaluate(`Boolean(document.querySelector(${quote(selector)}))`),
    count: (selector) => evaluate(`document.querySelectorAll(${quote(selector)}).length`),
    async screenshot(path, writeFile) {
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      writeFile(path, Buffer.from(data, 'base64'));
    },
    async setViewport(width, height, mobile = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    },
    async close() {
      try {
        await rawSend('Browser.close');
      } catch {
        /* the connection drops as the browser exits */
      }
      ws.close();
      await new Promise((resolve) => {
        if (proc.exitCode !== null) return resolve();
        proc.once('exit', resolve);
        setTimeout(() => {
          proc.kill();
          resolve();
        }, 3000);
      });
    },
  };
  return page;
}
