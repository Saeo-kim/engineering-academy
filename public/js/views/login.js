import { api } from '../api.js';
import { h } from '../dom.js';

export function loginView(onSuccess) {
  const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const password = h('input', { type: 'password', id: 'login-password', name: 'password', autocomplete: 'current-password', required: true });
  const submit = h('button', { type: 'submit', class: 'button primary', id: 'login-submit' }, 'Sign in');
  const form = h(
    'form',
    {
      class: 'panel form login',
      id: 'login-form',
      onsubmit: async (e) => {
        e.preventDefault();
        message.hidden = true;
        submit.disabled = true;
        try {
          await api.login(password.value);
          onSuccess();
        } catch (err) {
          message.textContent = err.message;
          message.hidden = false;
          password.select();
        } finally {
          submit.disabled = false;
        }
      },
    },
    h('div', { class: 'login-brand' }, h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, 'EA'), h('h1', null, 'Engineering Academy')),
    h('p', { class: 'hint' }, 'This instance is password protected.'),
    h('div', { class: 'field' }, h('label', { for: 'login-password' }, 'Password'), password),
    message,
    submit,
  );
  queueMicrotask(() => password.focus());
  return h('div', { class: 'login-page' }, form);
}
