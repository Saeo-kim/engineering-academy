import { pageHeader } from '../components.js';
import { h, icon, toast } from '../dom.js';
import { canPromptInstall, isIOS, isIOSSafari, isStandalone, onInstallAvailabilityChange, promptInstall } from '../pwa.js';

const strong = (text) => h('strong', null, text);

function iphoneSteps() {
  return h(
    'ol',
    { class: 'install-steps', id: 'ios-steps' },
    h('li', null, h('p', null, 'Open Engineering Academy in ', strong('Safari'), ' on your iPhone, at the same address you use now, and sign in if asked.')),
    h('li', null, h('p', null, 'Tap the ', strong('Share'), ' button ', icon('share'), ' in the toolbar. If you do not see it, tap the ', strong('•••'), ' button next to the address bar first, then Share.')),
    h('li', null, h('p', null, 'Scroll down and tap ', strong('Add to Home Screen'), ' ', icon('addSquare'), '. If you do not see it, tap ', strong('Edit Actions'), ' at the bottom and add it.')),
    h('li', null, h('p', null, 'Make sure ', strong('Open as Web App'), ' is switched on if your iOS version shows that option, keep the name ', strong('Eng Academy'), ', and tap ', strong('Add'), '.')),
    h('li', null, h('p', null, 'Open ', strong('Eng Academy'), ' from your Home Screen. It starts full screen, without Safari’s address bar, like a native app.')),
  );
}

export function installView() {
  const standalone = isStandalone();
  const promptWrap = h('div', { class: 'course-actions' });
  const renderPrompt = () => {
    promptWrap.replaceChildren(
      canPromptInstall()
        ? h(
            'button',
            {
              type: 'button',
              class: 'button primary',
              id: 'install-button',
              onclick: async () => {
                const outcome = await promptInstall();
                if (outcome === 'accepted') toast('Engineering Academy was installed.');
                renderPrompt();
              },
            },
            icon('install'),
            h('span', null, 'Install Engineering Academy'),
          )
        : h('p', { class: 'hint' }, 'Your browser has not offered an install prompt here. Use the browser menu: “Install app” or “Add to Home screen”.'),
    );
  };
  renderPrompt();
  onInstallAvailabilityChange(renderPrompt);

  const status = standalone
    ? ['You are using the installed app.', 'Engineering Academy is on your Home Screen and opens full screen.']
    : isIOS()
      ? ['Install on this iPhone', isIOSSafari() ? 'Follow the steps below in Safari.' : 'Follow the steps below. If “Add to Home Screen” is missing, open this page in Safari.']
      : ['Install as an app', 'Add Engineering Academy to your Home Screen or desktop for full-screen, one-tap access.'];

  return h(
    'div',
    { class: 'page narrow' },
    pageHeader('Install the App', 'Engineering Academy is a Progressive Web App: install it once and it behaves like a native app on your phone, with its own icon, full-screen window, and offline access to the app and to course lessons you have opened.'),
    h(
      'section',
      { class: 'panel install-status', id: 'install-status', dataset: { standalone: String(standalone) } },
      h('img', { src: '/icons/apple-touch-icon.png', alt: '', width: 56, height: 56 }),
      h('div', null, strong(status[0]), h('span', null, status[1])),
    ),
    h(
      'section',
      { class: 'panel install-section' },
      h('h2', null, 'iPhone and iPad'),
      h('p', null, 'Installing on iOS is done from Safari’s Share menu.'),
      iphoneSteps(),
      h(
        'p',
        { class: 'install-note' },
        'The installed app signs in separately from Safari, so you may need to enter your password once inside the app. Your sign-in then lasts 30 days.',
      ),
    ),
    h(
      'section',
      { class: 'panel install-section' },
      h('h2', null, 'Android, Chrome and Edge'),
      h('p', null, 'Use the button below, or open the browser menu and choose “Install app” or “Add to Home screen”.'),
      promptWrap,
    ),
    h(
      'section',
      { class: 'panel install-section' },
      h('h2', null, 'Reaching the app from your phone'),
      h('p', null, 'Your phone must be able to reach the computer that runs Engineering Academy, and installing works best over https. The README section “Use it on your iPhone” explains the two supported setups: a secure tunnel (works anywhere, any time) or your home Wi-Fi.'),
    ),
  );
}
