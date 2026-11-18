/* Campus Connect - shared UI.
   Builds the sidebar / top bar / bottom nav for the logged-in role on every page,
   handles theme + logout, and fills the Home dashboard. Needs js/data.js first. */
(function () {
  'use strict';
  const D = window.CCData;
  const { esc } = D;

  /* ---------- Icons (inline SVG) ---------- */
  const ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'
  };
  const ic = (name, cls) =>
    `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const $ = (sel, root) => (root || document).querySelector(sel);

  /* ---------- Navigation (filtered by role) ---------- */
  const NAV = [
    { key: 'home', href: 'index.html', label: 'Home', icon: 'home', words: ['home', 'dashboard'] },
    { key: 'canteen', href: 'canteen.html', label: 'Smart Canteen', icon: 'utensils', words: ['canteen', 'food', 'menu', 'token', 'order'] },
    { key: 'clubs', href: 'clubs.html', label: 'Clubs & Community', icon: 'users', words: ['club', 'community', 'event', 'feed', 'ticket'] },
    { key: 'academics', href: 'academics.html', label: 'Classroom Hub', icon: 'book', words: ['class', 'attendance', 'timetable', 'grade', 'academic', 'marks'] },
    { key: 'placement', href: 'placement.html', label: 'Placement Cell', icon: 'briefcase', words: ['placement', 'drive', 'job', 'mentor', 'career'] },
    { key: 'resume', href: 'resume.html', label: 'Resume Hub', icon: 'file', words: ['resume', 'cv', 'ats'] },
    { key: 'notifications', href: 'notifications.html', label: 'Notifications', icon: 'bell', words: ['notification', 'alert', 'broadcast'] }
  ];
  const PAGE = document.body.dataset.page || 'home';
  const user = D.Auth.user();
  if (!user) return; /* data.js is already redirecting to the login page */
  const allowed = NAV.filter(n => D.Auth.can(user.role, n.key));

  /* ---------- Theme ---------- */
  const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('cc-theme', t); } catch (e) { /* ignore */ }
    const btn = $('#themeBtn');
    if (btn) {
      btn.innerHTML = ic(t === 'dark' ? 'sun' : 'moon');
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  /* ---------- Modal + toast ---------- */
  function openModal(title, bodyHtml) {
    closeModal();
    const el = document.createElement('div');
    el.className = 'modal-backdrop';
    el.id = 'modal';
    el.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><h3>${esc(title)}</h3>
      <button class="icon-btn" data-close aria-label="Close">${ic('x')}</button></div>${bodyHtml}</div>`;
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-close]')) closeModal(); });
    document.body.appendChild(el);
    return el;
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function toast(msg) {
    let wrap = $('#toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; wrap.className = 'toast-wrap'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  /* ---------- Unread count (per logged-in user) ---------- */
  const unreadCount = () => D.get('notes').filter(n => !n.readBy.includes(user.username)).length;
  function refreshBell() { const d = $('#bellDot'); if (d) d.hidden = unreadCount() === 0; }

  /* ---------- Shell ---------- */
  function renderShell() {
    const logo = `<span class="brand-logo">${ic('cap')}</span>
      <span class="brand-text"><small>Campus</small><strong>Connect</strong></span>`;

    $('#sidebar').innerHTML = `
      <a class="brand" href="index.html" aria-label="Campus Connect home">${logo}</a>
      <nav class="side-nav" aria-label="Main">
        ${allowed.map(n => `<a href="${n.href}" title="${esc(n.label)}" class="${n.key === PAGE ? 'active' : ''}" ${n.key === PAGE ? 'aria-current="page"' : ''}>${ic(n.icon)}<span class="nav-label">${esc(n.label)}</span></a>`).join('')}
      </nav>
      <button class="side-user" id="sideUser" aria-label="Open profile">
        <span class="avatar">${esc(user.initials)}</span>
        <span class="side-user-meta"><strong>${esc(user.name)}</strong><span>${esc(user.roleLabel)}</span></span>
      </button>
      <button class="side-logout" id="sideLogout" title="Logout" aria-label="Logout">${ic('logout')}<span class="nav-label">Logout</span></button>`;

    $('#topbar').innerHTML = `
      <a class="brand brand-mobile" href="index.html" aria-label="Campus Connect home">${logo}</a>
      <form class="search" id="searchForm" role="search">
        ${ic('search')}
        <label class="sr-only" for="searchInput">Search campus</label>
        <input id="searchInput" type="search" placeholder="Search campus..." autocomplete="off">
      </form>
      <div class="top-actions">
        <span class="badge tone-purple role-badge" id="roleBadge">${esc(user.roleLabel)}</span>
        <button class="icon-btn" id="themeBtn"></button>
        <a class="icon-btn" href="notifications.html" aria-label="Notifications" ${D.Auth.can(user.role, 'notifications') ? '' : 'hidden'}>${ic('bell')}<span class="dot" id="bellDot" hidden></span></a>
        <button class="avatar" id="avatarBtn" aria-label="Open profile">${esc(user.initials)}</button>
        <button class="icon-btn" id="topLogout" aria-label="Logout" title="Logout">${ic('logout')}</button>
      </div>`;

    const primary = allowed.slice(0, 4);
    const more = allowed.slice(4);
    $('#bottomnav').innerHTML = `
      <ul style="display:contents">${primary.map(n => `<li style="display:contents"><a href="${n.href}" class="${n.key === PAGE ? 'active' : ''}">${ic(n.icon)}<span>${esc(n.label.split(' ')[0] === 'Clubs' ? 'Clubs' : n.label.replace('Smart ', '').replace(' Hub', '').replace(' Cell', ''))}</span></a></li>`).join('')}
      <li style="display:contents"><button id="moreBtn" class="${more.some(n => n.key === PAGE) ? 'active' : ''}">${ic('grid')}<span>More</span></button></li></ul>`;

    setTheme(currentTheme());
    $('#themeBtn').addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    $('#sideUser').addEventListener('click', openProfile);
    $('#avatarBtn').addEventListener('click', openProfile);
    $('#sideLogout').addEventListener('click', D.Auth.logout);
    $('#topLogout').addEventListener('click', D.Auth.logout);
    $('#moreBtn').addEventListener('click', () => {
      openModal('More', `<div class="modal-list">${more.map(n =>
        `<a class="modal-item" href="${n.href}"><span class="bubble tone-blue">${ic(n.icon)}</span><strong>${esc(n.label)}</strong></a>`).join('')}
        <button class="modal-item" id="mLogout"><span class="bubble tone-red">${ic('logout')}</span><strong>Logout</strong></button></div>`);
      $('#mLogout').addEventListener('click', D.Auth.logout);
    });

    /* Search: live filter on the home page, jump to a module on Enter (only pages this role can open) */
    const input = $('#searchInput');
    input.addEventListener('input', () => filterCards(input.value));
    $('#searchForm').addEventListener('submit', e => {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();
      if (!q) return;
      const hit = allowed.find(n => n.label.toLowerCase().includes(q) || n.words.some(w => w.includes(q) || q.includes(w)));
      if (hit) location.href = hit.href; else toast('No matching section found');
    });

    refreshBell();
  }

  function openProfile() {
    const m = openModal('My profile', `
      <div class="profile">
        <span class="avatar big">${esc(user.initials)}</span>
        <div><strong>${esc(user.name)}</strong><p class="muted">${esc(user.roleLabel)} &middot; ${esc(user.info)}</p>
        <p class="muted">Username: ${esc(user.username)}</p></div>
      </div>
      <button class="btn btn-primary" id="profLogout" style="width:100%;margin-top:18px">${ic('logout')}Logout</button>`);
    $('#profLogout', m).addEventListener('click', D.Auth.logout);
  }

  function filterCards(q) {
    q = q.trim().toLowerCase();
    const grid = $('#quickGrid');
    if (!grid) return;
    grid.querySelectorAll('[data-search]').forEach(c => c.classList.toggle('is-hidden', !!q && !c.dataset.search.includes(q)));
    if (q) grid.classList.add('expanded');
  }

  /* ---------- Shared calculations ---------- */
  const STEPS = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Archived'];
  const orderStep = o => Math.min(Math.floor((Date.now() - o.createdAt) / 20000), 3); /* moves one stage every 20 s */
  const attendanceOverall = tt => {
    const a = tt.subjects.reduce((s, x) => s + x.attended, 0), t = tt.subjects.reduce((s, x) => s + x.total, 0);
    return t ? Math.round(a / t * 100) : 0;
  };

  /* ---------- Home dashboard ---------- */
  const ROLE_LINE = {
    student: 'Here is your day at a glance.',
    faculty: 'Your classes and notices for today.',
    placement: 'Drives and student readiness at a glance.'
  };
  const NOTE_TONE = { academic: ['tone-blue', 'book'], placement: ['tone-green', 'briefcase'], canteen: ['tone-orange', 'utensils'], club: ['tone-purple', 'users'], admin: ['tone-amber', 'bell'] };
  const STEP_ICONS = ['check', 'clock', 'bag', 'archive'];

  function initHome() {
    if (sessionStorage.getItem('cc_denied')) { sessionStorage.removeItem('cc_denied'); toast('You do not have access to that page.'); }

    const h = new Date().getHours();
    $('#greeting').textContent = `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}, ${user.name.replace(/^Dr\.\s*/, '').split(' ')[0]}`;
    $('#roleLine').textContent = ROLE_LINE[user.role] || '';

    const grid = $('#quickGrid');
    if (!grid.querySelector('.is-extra')) $('#viewAll').remove();
    else $('#viewAll').addEventListener('click', e => {
      const open = grid.classList.toggle('expanded');
      e.currentTarget.setAttribute('aria-expanded', open);
      $('#viewAllText').textContent = open ? 'Show less' : 'View all';
    });

    if ($('#scheduleList')) {
      const tt = D.get('timetable');
      if ($('#nextClass')) renderNext(tt);
      if ($('#attRing')) renderAttendance(tt);
      renderSchedule(tt.today);
    }
    if ($('#noteList')) renderNotes(D.get('notes'));
    if ($('#driveList')) renderDrives(D.get('drives').drives);
    if ($('#statsBox')) renderStats();
    if ($('#tokenHead')) { renderToken(); setInterval(renderToken, 5000); }
  }

  function renderNext(tt) {
    const c = tt.today.find(x => x.status === 'scheduled');
    if (!c) { $('#nextClass').innerHTML = '<p class="empty" style="width:100%">No more classes scheduled today.</p>'; return; }
    $('#nextClass').innerHTML = `
      <div>
        <p class="hero-eyebrow">Up next &middot; ${esc(c.time)}</p>
        <h2>${esc(c.subject)}</h2>
        <p class="hero-meta">${ic('pin')}<span>${esc(c.room)} &middot; ${esc(c.faculty)}</span></p>
        <a class="hero-link" href="academics.html">View class ${ic('chevron')}</a>
      </div>
      <svg class="hero-art" viewBox="0 0 260 210" aria-hidden="true">
        <circle class="bg" cx="170" cy="150" r="90"/>
        <path d="M118 176c2-30 22-48 52-48s48 18 50 48z" fill="#8a78d0"/>
        <circle cx="168" cy="96" r="26" fill="#e8b08c"/>
        <path d="M142 92c0-18 12-30 28-30s26 10 26 24c-10-4-22-8-32-18-6 10-14 18-22 24z" fill="#1f2748"/>
        <rect x="96" y="150" width="124" height="44" rx="8" fill="#f6f1e7" stroke="#1f2748" stroke-width="6"/>
        <circle cx="158" cy="172" r="7" fill="#e8693f"/>
        <rect x="84" y="194" width="148" height="6" rx="3" fill="#1f2748"/>
      </svg>`;
  }

  function renderAttendance(tt) {
    const overall = attendanceOverall(tt), req = tt.required;
    const C = 2 * Math.PI * 52;
    const ok = overall >= req;
    const ring = $('#attRing');
    ring.className = `ring ${ok ? 'tone-green' : 'tone-orange'}`;
    ring.innerHTML = `<svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/>
      <circle class="value" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
      <div class="ring-label"><strong>${overall}%</strong><span>of ${req}% needed</span></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { $('.value', ring).style.strokeDashoffset = C * (1 - overall / 100); }));

    $('#attSubjects').innerHTML = tt.subjects.map(s => {
      const p = s.total ? Math.round(s.attended / s.total * 100) : 0;
      return `<div class="${p >= req ? 'tone-green' : 'tone-orange'}">
        <header><span>${esc(s.name)}</span><strong>${p}%</strong></header>
        <div class="progress"><span data-w="${p}"></span></div></div>`;
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('#attSubjects [data-w]').forEach(b => { b.style.width = b.dataset.w + '%'; })));

    $('#attNote').textContent = ok
      ? `You meet the ${req}% requirement. Keep attending regularly.`
      : `You are below the ${req}% requirement. Attend upcoming classes to recover.`;
  }

  const CLASS_BADGE = { scheduled: ['tone-blue', 'Scheduled'], cancelled: ['tone-red', 'Cancelled'], completed: ['tone-green', 'Completed'] };
  function renderSchedule(list) {
    $('#scheduleList').innerHTML = list.map(c => {
      const b = CLASS_BADGE[c.status] || CLASS_BADGE.scheduled;
      return `<li class="list-row"><span class="time-col">${esc(c.time)}</span>
        <div class="row-main"><strong>${esc(c.subject)}</strong><span>${esc(c.room)} &middot; ${esc(c.faculty)}</span></div>
        <span class="badge ${b[0]}">${b[1]}</span></li>`;
    }).join('') || '<li class="empty">No classes today.</li>';
  }

  function renderToken() {
    const mine = D.get('orders').filter(o => o.user === user.username);
    const o = mine[mine.length - 1];
    if (!o) {
      $('#tokenHead').innerHTML = '<p class="muted">No orders yet. Order something from the Smart Canteen.</p>';
      $('#pipeline').innerHTML = '';
      return;
    }
    const step = orderStep(o);
    $('#tokenHead').innerHTML = `<div><strong>Token ${esc(o.id)}</strong>
      <p class="muted" style="font-size:var(--fs-sm)">${o.items.map(i => `${esc(i.name)} x${i.qty}`).join(', ')}</p></div>
      <span class="badge tone-orange">Pay at counter</span>`;
    $('#pipeline').innerHTML = STEPS.map((s, i) =>
      `<li class="${i < step ? 'done' : i === step ? 'current' : ''}"><span class="step-dot">${ic(i < step ? 'check' : STEP_ICONS[i])}</span><small>${esc(s)}</small></li>`).join('');
  }

  function renderNotes(list) {
    const items = list.slice().sort((a, b) => b.ts - a.ts).slice(0, 4);
    $('#noteList').innerHTML = items.map(n => {
      const t = NOTE_TONE[n.type] || NOTE_TONE.admin;
      return `<li class="list-row"><span class="bubble ${t[0]}">${ic(t[1])}</span>
        <div class="row-main"><strong>${esc(n.title)}</strong><span>${esc(D.ago(n.ts))}</span></div>
        ${n.readBy.includes(user.username) ? '' : '<span class="unread-dot" aria-label="Unread"></span>'}</li>`;
    }).join('') || '<li class="empty">No notifications.</li>';
  }

  function renderDrives(list) {
    $('#driveList').innerHTML = list.map(d => `
      <li class="list-row"><span class="company-mark">${esc(d.company[0])}</span>
        <div class="row-main"><strong>${esc(d.company)}</strong><span>${esc(d.role)} &middot; ${esc(d.date)}</span></div>
        <span class="badge ${d.status === 'Open' ? 'tone-green' : d.status === 'Closed' ? 'tone-red' : 'tone-amber'}">${esc(d.status)}</span></li>`).join('') || '<li class="empty">No drives yet.</li>';
  }

  function renderStats() {
    const drives = D.get('drives').drives, apps = D.get('applications'), resumes = D.get('resumes');
    const pending = Object.values(resumes).filter(r => r.submitted && r.status === 'Pending').length;
    const stat = (n, label) => `<div class="stat"><strong>${n}</strong><span>${label}</span></div>`;
    $('#statsBox').innerHTML =
      stat(drives.filter(d => d.status !== 'Closed').length, 'Open drives') +
      stat(apps.length, 'Applications') +
      stat(pending, 'Resumes to review');
  }

  /* ---------- Boot ---------- */
  window.CC = { ic, esc, openModal, closeModal, toast, refreshBell, user, data: D, STEPS, orderStep, attendanceOverall, CLASS_BADGE, NOTE_TONE };

  /* Remove everything this role should not see (works on every page) */
  document.querySelectorAll('[data-roles]').forEach(el => { if (!el.dataset.roles.split(' ').includes(user.role)) el.remove(); });

  renderShell();
  if (PAGE === 'home') initHome();
  document.dispatchEvent(new CustomEvent('cc:ready', { detail: { user } }));
})();
