/* Resume Hub: students build a resume + ATS score; the Placement Head reviews submissions */
(function () {
  'use strict';
  const { ic, esc, toast, user, data: D } = window.CC;
  const $ = id => document.getElementById(id);
  const isStudent = user.role === 'student';
  const FIELDS = { name: 'rName', email: 'rEmail', phone: 'rPhone', education: 'rEdu', skills: 'rSkills', summary: 'rSummary', projects: 'rProjects' };
  const STATUS_TONE = { Pending: 'tone-amber', Approved: 'tone-green', 'Changes requested': 'tone-red' };

  /* ATS score: 100 points split over simple checks */
  function checks(r) {
    const skills = (r.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    return [
      ['Name added', 10, !!(r.name || '').trim()],
      ['Valid email', 10, /^\S+@\S+\.\S+$/.test(r.email || '')],
      ['Phone number (10+ digits)', 10, (r.phone || '').replace(/\D/g, '').length >= 10],
      ['Education added', 15, (r.education || '').trim().length >= 5],
      ['At least 5 skills', 20, skills.length >= 5],
      ['Summary (50+ characters)', 15, (r.summary || '').trim().length >= 50],
      ['Projects added', 10, (r.projects || '').trim().length >= 20],
      ['Numbers in projects (results)', 10, /\d/.test(r.projects || '')]
    ];
  }
  const score = r => checks(r).reduce((s, c) => s + (c[2] ? c[1] : 0), 0);

  function ring(el, value) {
    const C = 2 * Math.PI * 52;
    el.className = 'ring ' + (value >= 70 ? 'tone-green' : value >= 40 ? 'tone-amber' : 'tone-red');
    el.innerHTML = `<svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/>
      <circle class="value" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - value / 100)}"/></svg>
      <div class="ring-label"><strong>${value}</strong><span>of 100</span></div>`;
  }

  /* ---------- Student ---------- */
  function readForm() { const r = {}; Object.keys(FIELDS).forEach(k => { r[k] = $(FIELDS[k]).value; }); return r; }

  function showScore() {
    const r = readForm();
    ring($('atsRing'), score(r));
    $('atsChecks').innerHTML = checks(r).map(c => `<li class="${c[2] ? 'ok' : 'no'}">${ic(c[2] ? 'check' : 'x')}<span>${esc(c[0])}</span></li>`).join('');
  }

  function showStatus(r) {
    const b = $('rStatus');
    if (!r || !r.submitted) { b.textContent = 'Draft'; b.className = 'badge'; $('feedbackBox').innerHTML = ''; return; }
    b.textContent = r.status; b.className = 'badge ' + (STATUS_TONE[r.status] || '');
    $('feedbackBox').innerHTML = r.feedback ? `<div class="att-note"><strong>Reviewer feedback:</strong> ${esc(r.feedback)}</div>` : (r.status === 'Pending' ? '<div class="att-note">Waiting for the Placement Head to review.</div>' : '');
  }

  function save(submit) {
    const all = D.get('resumes'), old = all[user.username] || {};
    const r = Object.assign({}, old, readForm());
    r.score = score(r);
    if (submit) { r.submitted = true; r.status = 'Pending'; r.feedback = ''; }
    all[user.username] = r;
    D.set('resumes', all);
    showStatus(r);
  }

  function initStudent() {
    const r = D.get('resumes')[user.username] || { name: user.name, email: user.username + '@campus.edu' };
    Object.keys(FIELDS).forEach(k => { $(FIELDS[k]).value = r[k] || ''; });
    showScore(); showStatus(D.get('resumes')[user.username]);
    $('resumeForm').addEventListener('input', showScore);
    $('resumeForm').addEventListener('submit', e => { e.preventDefault(); save(false); toast('Draft saved'); });
    $('submitResume').addEventListener('click', () => {
      if (score(readForm()) < 60) { toast('Score at least 60 to submit - fix the red items first'); return; }
      save(true); toast('Resume submitted for review');
    });
  }

  /* ---------- Placement Head ---------- */
  function renderReview() {
    const all = D.get('resumes');
    const keys = Object.keys(all).filter(k => all[k].submitted);
    $('reviewList').innerHTML = keys.map(k => {
      const r = all[k];
      return `<li class="review"><div class="list-row" style="flex-wrap:wrap">
          <span class="avatar">${esc((r.name || '?').split(' ').map(w => w[0]).slice(0, 2).join(''))}</span>
          <div class="row-main"><strong>${esc(r.name)} <span class="badge ${STATUS_TONE[r.status] || ''}">${esc(r.status)}</span></strong>
            <span>${esc(r.email)} &middot; ${esc(r.education)}</span></div>
          <span class="badge ${r.score >= 70 ? 'tone-green' : 'tone-amber'}">ATS ${r.score}</span></div>
        <p class="muted"><b>Skills:</b> ${esc(r.skills)}</p>
        <p class="muted"><b>Projects:</b> ${esc(r.projects)}</p>
        <div class="field"><label for="fb-${esc(k)}">Feedback</label><textarea id="fb-${esc(k)}" rows="2" maxlength="200">${esc(r.feedback)}</textarea></div>
        <div class="form-actions">
          <button class="btn btn-ghost btn-sm" data-review="${esc(k)}" data-to="Changes requested">Request changes</button>
          <button class="btn btn-primary btn-sm" data-review="${esc(k)}" data-to="Approved">Approve</button></div></li>`;
    }).join('') || '<li class="empty">No resumes submitted yet.</li>';
  }

  if (isStudent) initStudent();
  else {
    renderReview();
    $('reviewList').addEventListener('click', e => {
      const b = e.target.closest('[data-review]'); if (!b) return;
      const all = D.get('resumes'), r = all[b.dataset.review];
      r.status = b.dataset.to; r.feedback = $('fb-' + b.dataset.review).value.trim();
      D.set('resumes', all); toast('Marked: ' + r.status); renderReview();
    });
  }
})();
