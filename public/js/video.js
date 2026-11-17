// Lecture video player. Turns whatever link you attach to a lesson into the
// best player for a phone:
//   YouTube  → privacy-enhanced embed that plays inline on iPhone
//   Vimeo    → Vimeo's player, inline
//   .mp4 / .webm / .mov, or a file from your media folder → native <video>
// Anything else is offered as an "Open lecture" link.

import { h } from './dom.js';

const YT_ID = /^[\w-]{11}$/;
const FILE = /\.(mp4|m4v|webm|mov)$/i;

// "90", "90s", "1m30s", "1h2m3s" → seconds
function seconds(value) {
  if (!value) return 0;
  if (/^\d+s?$/.test(value)) return parseInt(value, 10);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

export function parseVideo(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  if (value.startsWith('/media/')) return { type: 'file', src: value, label: decodeURIComponent(value.slice(7)) };
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.replace(/^(www|m|music)\./, '');

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    let id = null;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (url.pathname === '/watch') id = url.searchParams.get('v');
    else id = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname)?.[1] ?? null;
    const list = url.searchParams.get('list');
    const start = seconds(url.searchParams.get('t') ?? url.searchParams.get('start'));
    const params = new URLSearchParams({ playsinline: '1', rel: '0' });
    if (start) params.set('start', String(start));
    if (id && YT_ID.test(id)) {
      if (list) params.set('list', list);
      return { type: 'embed', provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${id}?${params}`, open: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}` };
    }
    if (list && /^[\w-]+$/.test(list)) {
      params.set('list', list);
      return { type: 'embed', provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/videoseries?${params}`, open: `https://www.youtube.com/playlist?list=${list}` };
    }
    return { type: 'link', href: url.href, provider: 'YouTube' };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = /^\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/.exec(url.pathname);
    if (m) {
      const params = new URLSearchParams({ playsinline: '1' });
      const hash = m[2] ?? url.searchParams.get('h');
      if (hash) params.set('h', hash);
      return { type: 'embed', provider: 'Vimeo', src: `https://player.vimeo.com/video/${m[1]}?${params}`, open: `https://vimeo.com/${m[1]}${hash ? `/${hash}` : ''}` };
    }
    return { type: 'link', href: url.href, provider: 'Vimeo' };
  }

  if (FILE.test(url.pathname)) return { type: 'file', src: url.href, label: url.pathname.split('/').pop() };
  return { type: 'link', href: url.href, provider: url.hostname };
}

export const searchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

// Builds the player. For native video, `onProgress(seconds)` is called while
// watching (throttled) and on pause, and `onEnded()` when the video finishes.
export function videoPlayer(video, { title, startAt = 0, onProgress, onEnded } = {}) {
  if (video.type === 'embed') {
    return h(
      'div',
      { class: 'video-frame', id: 'lesson-video' },
      h('iframe', {
        src: video.src,
        title: `${title} (lecture video)`,
        allow: 'accelerometer; autoplay; encrypted-media; fullscreen; gyroscope; picture-in-picture',
        allowFullscreen: true,
        loading: 'lazy',
        // YouTube refuses embeds that send no Referer at all, and the app's
        // default policy is no-referrer. Send only the origin to the player.
        referrerPolicy: 'strict-origin-when-cross-origin',
      }),
    );
  }
  if (video.type === 'file') {
    let lastSaved = startAt;
    const el = h('video', {
      src: video.src,
      controls: true,
      playsInline: true,
      preload: 'metadata',
      'webkit-playsinline': true,
      title: `${title} (lecture video)`,
    });
    el.addEventListener('loadedmetadata', () => {
      if (startAt > 5 && startAt < el.duration - 5) el.currentTime = startAt;
    });
    el.addEventListener('timeupdate', () => {
      if (Math.abs(el.currentTime - lastSaved) >= 15) {
        lastSaved = el.currentTime;
        onProgress?.(el.currentTime);
      }
    });
    el.addEventListener('pause', () => {
      if (!el.ended) {
        lastSaved = el.currentTime;
        onProgress?.(el.currentTime);
      }
    });
    el.addEventListener('ended', () => {
      lastSaved = 0;
      onProgress?.(0);
      onEnded?.();
    });
    el.addEventListener('error', () => {
      el.replaceWith(
        h('div', { class: 'video-error' }, h('strong', null, 'This video could not be played.'), h('span', null, 'Check that the link or file still exists and is an MP4 (H.264) or WebM file.')),
      );
    });
    return h('div', { class: 'video-frame', id: 'lesson-video' }, el);
  }
  return null;
}
