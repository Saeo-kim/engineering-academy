# App identity and icon

Engineering Academy has **one permanent icon**: a teal (`#54cdb0`) terminal prompt `>_` inside a rounded teal frame on a dark (`#12181e`) square. It is the same mark the app has used since the first release.

![Engineering Academy icon](../public/icons/icon-192.png)

## Rule

The icon is the app's permanent identity. **Do not redesign, regenerate, replace or "refresh" it** during any update. It changes only when the owner explicitly asks for a new icon.

## Where it is used

Every context uses the same artwork. The PNG files are renders of the master, not separate designs.

| Context | File |
| --- | --- |
| **Master artwork** (source of every other file) | `public/favicon.svg` |
| Browser tab (SVG and PNG fallback) | `public/favicon.svg`, `public/icons/icon-32.png` |
| Sidebar brand mark | `public/favicon.svg` |
| iPhone / iPad Home Screen | `public/icons/apple-touch-icon.png` (180×180), copy at `public/apple-touch-icon.png` |
| PWA manifest, Android, desktop install | `public/icons/icon-192.png`, `public/icons/icon-512.png` |
| PWA maskable icon (Android adaptive shapes) | `public/icons/icon-maskable-512.png` (mark kept inside the 80% safe zone) |
| Install page | `public/icons/apple-touch-icon.png` |

Name and colours used with it:

| | Value |
| --- | --- |
| Full name | Engineering Academy |
| Home Screen name | Eng Academy |
| Theme and background colour | `#0d1115` |
| Icon background | `#12181e` |
| Accent | `#54cdb0` |

## How it is protected

`tests/brand.test.js` locks every icon file by SHA-256 hash and checks that the manifest and `index.html` reference only those files. If any icon file changes, `npm test` fails.

## Changing the icon (only on explicit request)

1. Replace `public/favicon.svg` with the approved new artwork.
2. Run `npm run icons`. It renders the master onto the background at every required size; it never designs anything itself.
3. Update the hashes in `tests/brand.test.js` and this document.
4. iPhones cache Home Screen icons: remove the app from the Home Screen and add it again to see the new icon.
