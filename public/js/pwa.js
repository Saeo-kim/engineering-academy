// Installable-app support: registers the service worker, remembers the
// browser's install prompt (Chrome, Edge, Android), and detects iPhone/iPad,
// where installing is done from Safari's Share menu instead.

let deferredPrompt = null;
let updateReady = false;

export const isUpdateReady = () => updateReady;

// Cached course pages include your progress, so they go when you sign out.
export const clearPrivateCaches = () => (window.caches ? caches.delete('ea-data').catch(() => false) : Promise.resolve(false));
const listeners = new Set();

export const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export function isIOS() {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, but Macs have no touch screen.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

// Safari is the browser that can add to the Home Screen on older iOS versions;
// other iOS browsers can on iOS 16.4 and later.
export const isIOSSafari = () => isIOS() && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);

export const canPromptInstall = () => deferredPrompt !== null;

export function onInstallAvailabilityChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  const prompt = deferredPrompt;
  deferredPrompt = null;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  listeners.forEach((fn) => fn());
  return outcome;
}

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
  // Service workers need a secure context: https, or localhost while developing.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    // A new version took over in the background. Switch to it at the next
    // in-app navigation (never mid-typing), see main.js.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) updateReady = true;
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {}));
  }
  document.documentElement.classList.toggle('standalone', isStandalone());
}
