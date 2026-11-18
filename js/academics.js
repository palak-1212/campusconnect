/* Classroom Hub: students view; faculty can edit classes, attendance and marks */
(function () {
  'use strict';
  const { esc, toast, user, data: D, attendanceOverall, CLASS_BADGE } = window.CC;
  const $ = id => document.getElementById(id);
  const isFaculty = user.role === 'faculty';
  const pct = (a, t) => (t ? Math.round(a / t * 100) : 0);

  function renderClasses() {
    const tt = D.get('timetable');
    $('classHint').textContent = isFaculty ? 'Cancel or complete classes - students see the change.' : '';
    $('classList').innerHTML = tt.today.map(c => {
      const b = CLASS_BADGE[c.status] || CLASS_BADGE.scheduled;
      const actions = !isFaculty ? '' : c.status === 'scheduled'
        ? `<button class="btn btn-ghost btn-sm" data-act="completed" data-id="${c.id}">Mark done</button><button class="btn btn-ghost btn-sm" data-act="cancelled" data-id="${c.id}">Cancel</button>`
        : `<button class="btn btn-ghost btn-sm" data-act="scheduled" data-id="${c.id}">Restore</button>`;
      return `<li class="list-row" style="flex-wrap:wrap"><span class="time-col">${esc(c.time)}</span>
        <div class="row-main"><strong>${esc(c.subject)}</strong><span>${esc(c.room)} &middot; ${esc(c.faculty)} &middot; until ${esc(c.end)}</span></div>
        <span class="badge ${b[0]}">${b[1]}</span>${actions}</li>`;
    }).join('') || '<li class="empty">No classes today.</li>';
  }

  function renderAttendance() {
    const tt = D.get('timetable');
    const overall = attendanceOverall(tt);
    const badge = $('attOverall');
    badge.textContent = `Overall ${overall}% (need ${tt.required}%)`;
    badge.className = 'badge ' + (overall >= tt.required ? 'tone-green' : 'tone-red');
    $('attTable').innerHTML = `<thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>%</th></tr></thead><tbody>` +
      tt.subjects.map((s, i) => `<tr><td>${esc(s.code)} - ${esc(s.name)}</td>
        <td>${isFaculty ? `<input class="cell-input" type="number" min="0" data-att="${i}" value="${s.attended}">` : s.attended}</td>
        <td>${isFaculty ? `<input class="cell-input" type="number" min="1" data-tot="${i}" value="${s.total}">` : s.total}</td>
        <td><span class="badge ${pct(s.attended, s.total) >= tt.required ? 'tone-green' : 'tone-red'}">${pct(s.attended, s.total)}%</span></td></tr>`).join('') + '</tbody>';
  }

  function renderMarks() {
    const tt = D.get('timetable');
    $('sgpa').textContent = 'SGPA ' + tt.sgpa;
    $('marksTable').innerHTML = `<thead><tr><th>Subject</th><th>Internal</th><th>Out of</th></tr></thead><tbody>` +
      tt.subjects.map((s, i) => `<tr><td>${esc(s.name)}</td>
        <td>${isFaculty ? `<input class="cell-input" type="number" min="0" max="${s.max}" data-mark="${i}" value="${s.internal}">` : s.internal}</td>
        <td>${s.max}</td></tr>`).join('') + '</tbody>';
  }

  $('classList').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const tt = D.get('timetable'), c = tt.today.find(x => String(x.id) === b.dataset.id);
    c.status = b.dataset.act;
    D.set('timetable', tt);
    if (c.status === 'cancelled') {
      const notes = D.get('notes');
      notes.push({ id: D.uid('n'), type: 'academic', title: c.subject + ' (' + c.time + ') is cancelled', body: 'Class cancelled by ' + user.name + '.', ts: Date.now(), from: user.name, readBy: [user.username] });
      D.set('notes', notes);
    }
    toast('Class updated: ' + c.status);
    renderClasses();
  });

  if (isFaculty) {
    $('saveAtt').addEventListener('click', () => {
      const tt = D.get('timetable');
      let bad = false;
      tt.subjects.forEach((s, i) => {
        const a = parseInt(document.querySelector(`[data-att="${i}"]`).value, 10);
        const t = parseInt(document.querySelector(`[data-tot="${i}"]`).value, 10);
        if (isNaN(a) || isNaN(t) || a < 0 || t < 1 || a > t) { bad = true; return; }
        s.attended = a; s.total = t;
      });
      if (bad) { toast('Check values: attended must be between 0 and total'); return; }
      D.set('timetable', tt); renderAttendance(); toast('Attendance saved');
    });
    $('saveMarks').addEventListener('click', () => {
      const tt = D.get('timetable');
      let bad = false;
      tt.subjects.forEach((s, i) => {
        const m = parseInt(document.querySelector(`[data-mark="${i}"]`).value, 10);
        if (isNaN(m) || m < 0 || m > s.max) { bad = true; return; }
        s.internal = m;
      });
      if (bad) { toast('Marks must be between 0 and the maximum'); return; }
      D.set('timetable', tt); renderMarks(); toast('Marks saved');
    });
  }

  renderClasses(); renderAttendance(); renderMarks();
})();
