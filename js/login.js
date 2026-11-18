/* Login page: checks the dummy accounts and saves the session in localStorage */
(function () {
  'use strict';
  const D = window.CCData;
  const form = document.getElementById('loginForm');
  const err = document.getElementById('loginError');
  const u = document.getElementById('username');
  const p = document.getElementById('password');

  /* Show the dummy accounts; clicking a row fills the form */
  const body = document.querySelector('#demoTable tbody');
  body.innerHTML = D.ACCOUNTS.map(a =>
    `<tr class="clickable" data-u="${D.esc(a.username)}" data-p="${D.esc(a.password)}" tabindex="0">
      <td>${D.esc(a.roleLabel)}</td><td><code>${D.esc(a.username)}</code></td><td><code>${D.esc(a.password)}</code></td></tr>`).join('');
  const fill = row => { if (!row) return; u.value = row.dataset.u; p.value = row.dataset.p; err.hidden = true; p.focus(); };
  body.addEventListener('click', e => fill(e.target.closest('tr')));
  body.addEventListener('keydown', e => { if (e.key === 'Enter') fill(e.target.closest('tr')); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const account = D.Auth.login(u.value, p.value);
    if (!account) { err.textContent = 'Wrong username or password. Try one of the demo accounts below.'; err.hidden = false; return; }
    location.href = 'index.html';
  });

  document.getElementById('resetData').addEventListener('click', () => {
    D.resetAll();
    err.textContent = 'Demo data was reset (orders, applications, events, etc.).';
    err.hidden = false;
  });
})();
