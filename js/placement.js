/* Placement Cell: students apply to drives; the Placement Head manages drives and applicants */
(function () {
  'use strict';
  const { esc, toast, user, data: D } = window.CC;
  const $ = id => document.getElementById(id);
  const isHead = user.role === 'placement';
  const nameOf = u => { const a = D.ACCOUNTS.find(x => x.username === u); return a ? a.name : u; };
  const STATUS_TONE = { 'Open': 'tone-green', 'Closing soon': 'tone-amber', 'Closed': 'tone-red' };
  const APP_TONE = { Applied: 'tone-blue', Shortlisted: 'tone-green', Rejected: 'tone-red' };

  function render() {
    const db = D.get('drives'), apps = D.get('applications');

    $('driveCards').innerHTML = db.drives.map(d => {
      const list = apps.filter(a => a.driveId === d.id);
      const mine = list.find(a => a.username === user.username);
      let actions = '';
      if (isHead) {
        actions = `<select class="cell-input" data-status="${d.id}" aria-label="Drive status">${['Open', 'Closing soon', 'Closed'].map(s => `<option ${s === d.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <button class="btn btn-ghost btn-sm" data-del="${d.id}">Delete</button>`;
      } else if (mine) {
        actions = `<span class="badge ${APP_TONE[mine.status] || 'tone-blue'}">${esc(mine.status)}</span><button class="btn btn-ghost btn-sm" data-withdraw="${d.id}">Withdraw</button>`;
      } else if (d.status === 'Closed') {
        actions = '<span class="badge tone-red">Closed</span>';
      } else {
        actions = `<button class="btn btn-primary btn-sm" data-apply="${d.id}">Apply</button>`;
      }
      const applicants = !isHead ? '' : `<div class="applicants"><strong>Applicants (${list.length})</strong>` +
        (list.map(a => `<div class="list-row"><div class="row-main"><strong>${esc(nameOf(a.username))}</strong><span>${esc(a.status)}</span></div>
          <button class="btn btn-ghost btn-sm" data-app="${a.id}" data-to="Shortlisted">Shortlist</button>
          <button class="btn btn-ghost btn-sm" data-app="${a.id}" data-to="Rejected">Reject</button></div>`).join('') || '<p class="muted">No applications yet.</p>') + '</div>';
      return `<article class="card">
        <div class="list-row" style="flex-wrap:wrap">
          <span class="company-mark">${esc(d.company[0])}</span>
          <div class="row-main"><strong>${esc(d.company)} &middot; ${esc(d.role)}</strong>
            <span>${esc(d.date)} &middot; ${esc(d.ctc)} &middot; ${esc(d.eligibility)}</span></div>
          <span class="badge ${STATUS_TONE[d.status] || 'tone-blue'}">${esc(d.status)}</span>${actions}
        </div>${applicants}</article>`;
    }).join('') || '<p class="empty">No drives yet.</p>';

    if ($('myApps')) {
      const mine = apps.filter(a => a.username === user.username);
      $('myApps').innerHTML = mine.map(a => {
        const d = db.drives.find(x => x.id === a.driveId);
        return `<li class="list-row"><div class="row-main"><strong>${esc(d ? d.company : 'Removed drive')}</strong><span>${esc(d ? d.role : '')}</span></div>
          <span class="badge ${APP_TONE[a.status] || 'tone-blue'}">${esc(a.status)}</span></li>`;
      }).join('') || '<li class="empty">You have not applied to any drive yet.</li>';
    }

    $('contactList').innerHTML = db.contacts.map(c => `
      <li class="list-row"><span class="avatar">${esc(c.name.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span>
        <div class="row-main"><strong>${esc(c.name)} <span class="badge tone-purple">${esc(c.role)}</span></strong>
        <span>${esc(c.email)} &middot; ${esc(c.phone)}</span></div></li>`).join('');
  }

  $('driveCards').addEventListener('click', e => {
    const apps = D.get('applications');
    const ap = e.target.closest('[data-apply]'), wd = e.target.closest('[data-withdraw]');
    const del = e.target.closest('[data-del]'), st = e.target.closest('[data-app]');
    if (ap) {
      if (!apps.some(a => a.driveId === ap.dataset.apply && a.username === user.username))
        apps.push({ id: D.uid('a'), driveId: ap.dataset.apply, username: user.username, status: 'Applied' });
      D.set('applications', apps); toast('Application submitted');
    } else if (wd) {
      D.set('applications', apps.filter(a => !(a.driveId === wd.dataset.withdraw && a.username === user.username))); toast('Application withdrawn');
    } else if (del) {
      const db = D.get('drives');
      db.drives = db.drives.filter(d => d.id !== del.dataset.del);
      D.set('drives', db); D.set('applications', apps.filter(a => a.driveId !== del.dataset.del)); toast('Drive deleted');
    } else if (st) {
      apps.find(a => a.id === st.dataset.app).status = st.dataset.to; D.set('applications', apps); toast('Applicant ' + st.dataset.to.toLowerCase());
    } else return;
    render();
  });
  $('driveCards').addEventListener('change', e => {
    const s = e.target.closest('[data-status]'); if (!s) return;
    const db = D.get('drives'); db.drives.find(d => d.id === s.dataset.status).status = s.value;
    D.set('drives', db); toast('Status set to ' + s.value); render();
  });

  const form = $('driveForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const db = D.get('drives');
    db.drives.push({ id: D.uid('d'), company: $('dCompany').value.trim(), role: $('dRole').value.trim(), date: $('dDate').value.trim(), ctc: $('dCtc').value.trim(), status: 'Open', eligibility: $('dElig').value.trim() });
    D.set('drives', db);
    const notes = D.get('notes');
    notes.push({ id: D.uid('n'), type: 'placement', title: 'New drive: ' + $('dCompany').value.trim(), body: $('dRole').value.trim() + ' - ' + $('dDate').value.trim(), ts: Date.now(), from: user.name, readBy: [user.username] });
    D.set('notes', notes);
    form.reset(); toast('Drive added'); render();
  });

  render();
})();
