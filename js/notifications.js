/* Notifications: per-user read state; faculty / placement head can broadcast */
(function () {
  'use strict';
  const { ic, esc, toast, user, data: D, refreshBell, NOTE_TONE } = window.CC;
  const $ = id => document.getElementById(id);

  function render() {
    const notes = D.get('notes').sort((a, b) => b.ts - a.ts);
    const unread = notes.filter(n => !n.readBy.includes(user.username)).length;
    $('unreadCount').textContent = unread + ' unread';
    $('unreadCount').hidden = unread === 0;
    $('noteList').innerHTML = notes.map(n => {
      const t = NOTE_TONE[n.type] || NOTE_TONE.admin, isRead = n.readBy.includes(user.username);
      return `<li class="list-row"><span class="bubble ${t[0]}">${ic(t[1])}</span>
        <div class="row-main"><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span><span>${esc(n.from)} &middot; ${esc(D.ago(n.ts))}</span></div>
        ${isRead ? '<span class="badge">Read</span>' : `<span class="unread-dot" aria-label="Unread"></span><button class="btn btn-ghost btn-sm" data-read="${n.id}">Mark read</button>`}</li>`;
    }).join('') || '<li class="empty">No notifications.</li>';
    refreshBell();
  }

  $('noteList').addEventListener('click', e => {
    const b = e.target.closest('[data-read]'); if (!b) return;
    const notes = D.get('notes'), n = notes.find(x => x.id === b.dataset.read);
    if (!n.readBy.includes(user.username)) n.readBy.push(user.username);
    D.set('notes', notes); render();
  });

  $('markAll').addEventListener('click', () => {
    const notes = D.get('notes');
    notes.forEach(n => { if (!n.readBy.includes(user.username)) n.readBy.push(user.username); });
    D.set('notes', notes); toast('All marked as read'); render();
  });

  const form = $('noteForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const notes = D.get('notes');
    notes.push({ id: D.uid('n'), type: $('nType').value, title: $('nTitle').value.trim(), body: $('nBody').value.trim(), ts: Date.now(), from: user.name, readBy: [user.username] });
    D.set('notes', notes); form.reset(); toast('Broadcast sent to everyone'); render();
  });

  render();
})();
