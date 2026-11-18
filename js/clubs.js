/* Clubs & Community: join/leave clubs, register for events, faculty can post events */
(function () {
  'use strict';
  const { ic, esc, toast, user, data: D } = window.CC;
  const $ = id => document.getElementById(id);
  const ICON = { orange: 'bag', blue: 'book', purple: 'users', green: 'pin' };

  const seatsLeft = e => e.seats - e.taken - e.registered.length;

  function render() {
    const db = D.get('clubs');
    $('clubGrid').innerHTML = db.clubs.map(c => {
      const joined = c.members.includes(user.username);
      return `<article class="tile-card tone-${c.tone}" style="flex-direction:column;align-items:flex-start;min-height:0">
        <span class="tile-icon">${ic(ICON[c.tone] || 'users')}</span>
        <span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><p><b>${c.base + c.members.length}</b> members</p></span>
        <button class="btn btn-sm ${joined ? 'btn-ghost' : 'btn-primary'}" data-club="${c.id}">${joined ? 'Leave club' : 'Join club'}</button>
      </article>`;
    }).join('');

    const clubName = id => (db.clubs.find(c => c.id === id) || { name: 'Club' }).name;
    $('eventList').innerHTML = db.events.map(e => {
      const reg = e.registered.includes(user.username), left = seatsLeft(e);
      return `<li class="list-row">
        <span class="bubble tone-purple">${ic('users')}</span>
        <div class="row-main"><strong>${esc(e.title)}</strong><span>${esc(clubName(e.clubId))} &middot; ${esc(e.date)} &middot; ${left} seats left</span></div>
        ${reg ? `<button class="btn btn-ghost btn-sm" data-ev="${e.id}">Cancel registration</button>`
              : left > 0 ? `<button class="btn btn-primary btn-sm" data-ev="${e.id}">Register</button>`
              : '<span class="badge tone-red">Full</span>'}
      </li>`;
    }).join('') || '<li class="empty">No upcoming events.</li>';

    const sel = $('evClub');
    if (sel && !sel.options.length) sel.innerHTML = db.clubs.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  }

  $('clubGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-club]'); if (!b) return;
    const db = D.get('clubs'), c = db.clubs.find(x => x.id === b.dataset.club);
    const i = c.members.indexOf(user.username);
    if (i >= 0) { c.members.splice(i, 1); toast('You left ' + c.name); }
    else { c.members.push(user.username); toast('Welcome to ' + c.name + '!'); }
    D.set('clubs', db); render();
  });

  $('eventList').addEventListener('click', e => {
    const b = e.target.closest('[data-ev]'); if (!b) return;
    const db = D.get('clubs'), ev = db.events.find(x => x.id === b.dataset.ev);
    const i = ev.registered.indexOf(user.username);
    if (i >= 0) { ev.registered.splice(i, 1); toast('Registration cancelled'); }
    else if (seatsLeft(ev) > 0) { ev.registered.push(user.username); toast('Registered for ' + ev.title); }
    D.set('clubs', db); render();
  });

  const form = $('eventForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const db = D.get('clubs');
    db.events.push({ id: D.uid('e'), clubId: $('evClub').value, title: $('evTitle').value.trim(), date: $('evDate').value.trim(), seats: Math.max(1, parseInt($('evSeats').value, 10) || 1), taken: 0, registered: [] });
    D.set('clubs', db);
    /* also broadcast it as a notification */
    const notes = D.get('notes');
    notes.push({ id: D.uid('n'), type: 'club', title: 'New event: ' + $('evTitle').value.trim(), body: $('evDate').value.trim(), ts: Date.now(), from: user.name, readBy: [user.username] });
    D.set('notes', notes);
    form.reset(); $('evSeats').value = 40;
    toast('Event posted'); render();
  });

  render();
})();
