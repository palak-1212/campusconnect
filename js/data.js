/* Campus Connect - data + login (plain JS, localStorage only, no server).
   Loaded in <head> of EVERY page: it also acts as the page guard. */
(function () {
  'use strict';

  /* ---------- Dummy accounts (shown on the login page) ---------- */
  const ACCOUNTS = [
    { username: 'student',   password: 'student123',   role: 'student',   roleLabel: 'Student',        name: 'Ananya Kapoor', initials: 'AK', info: 'Computer Science, Year 2' },
    { username: 'faculty',   password: 'faculty123',   role: 'faculty',   roleLabel: 'Faculty',        name: 'Dr. Menon',     initials: 'DM', info: 'Department of Computer Science' },
    { username: 'placement', password: 'placement123', role: 'placement', roleLabel: 'Placement Head', name: 'Rahul Sharma',  initials: 'RS', info: 'Training and Placement Cell' }
  ];

  /* Which pages each role may open */
  const ACCESS = {
    student:   ['home', 'canteen', 'clubs', 'academics', 'placement', 'resume', 'notifications'],
    faculty:   ['home', 'canteen', 'clubs', 'academics', 'notifications'],
    placement: ['home', 'placement', 'resume', 'notifications']
  };
  const KNOWN_PAGES = ['home', 'canteen', 'clubs', 'academics', 'placement', 'resume', 'notifications'];

  /* ---------- Small helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const ago = ts => {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + ' hr ago';
    const d = Math.round(h / 24);
    return d === 1 ? 'Yesterday' : d + ' days ago';
  };

  /* ---------- localStorage wrapper (falls back to memory if blocked) ---------- */
  const mem = {};
  const raw = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  };

  /* ---------- Seed (starting) data ---------- */
  const min = n => Date.now() - n * 60000;
  const SEEDS = {
    menu: () => ({
      categories: ['Breakfast', 'Meals', 'Snacks', 'Beverages'],
      items: [
        { id: 'm1', name: 'Masala Dosa', category: 'Breakfast', price: 70, veg: true, available: true, prep: '8 min' },
        { id: 'm2', name: 'Idli Sambar', category: 'Breakfast', price: 50, veg: true, available: true, prep: '5 min' },
        { id: 'm3', name: 'Veg Thali', category: 'Meals', price: 110, veg: true, available: true, prep: '10 min' },
        { id: 'm4', name: 'Chicken Biryani', category: 'Meals', price: 140, veg: false, available: true, prep: '12 min' },
        { id: 'm5', name: 'Veg Sandwich', category: 'Snacks', price: 45, veg: true, available: true, prep: '5 min' },
        { id: 'm6', name: 'Samosa (2 pcs)', category: 'Snacks', price: 30, veg: true, available: false, prep: '4 min' },
        { id: 'm7', name: 'Cold Coffee', category: 'Beverages', price: 40, veg: true, available: true, prep: '3 min' },
        { id: 'm8', name: 'Masala Chai', category: 'Beverages', price: 15, veg: true, available: true, prep: '2 min' }
      ]
    }),
    orders: () => [],
    timetable: () => ({
      subjects: [
        { code: 'CS201', name: 'Object Oriented Programming', attended: 27, total: 34, internal: 38, max: 50 },
        { code: 'CS203', name: 'Data Structures', attended: 24, total: 32, internal: 41, max: 50 },
        { code: 'MA205', name: 'Discrete Mathematics', attended: 22, total: 30, internal: 33, max: 50 },
        { code: 'CS207', name: 'Database Systems', attended: 22, total: 30, internal: 44, max: 50 }
      ],
      required: 75,
      sgpa: 8.4,
      today: [
        { id: 1, time: '09:00 AM', end: '10:00 AM', subject: 'Object Oriented Programming', room: 'A-101', faculty: 'Dr. Menon', status: 'scheduled' },
        { id: 2, time: '10:15 AM', end: '11:15 AM', subject: 'Data Structures', room: 'B-204', faculty: 'Prof. Iyer', status: 'scheduled' },
        { id: 3, time: '11:30 AM', end: '12:30 PM', subject: 'Discrete Mathematics', room: 'A-105', faculty: 'Dr. Rao', status: 'scheduled' },
        { id: 4, time: '02:00 PM', end: '04:00 PM', subject: 'Database Systems Lab', room: 'Lab 3', faculty: 'Prof. Das', status: 'scheduled' }
      ]
    }),
    clubs: () => ({
      clubs: [
        { id: 'c1', name: 'Robotics Club', desc: 'Build bots, learn embedded systems and compete.', tone: 'orange', base: 42, members: [] },
        { id: 'c2', name: 'Coding Club', desc: 'Weekly contests, hackathons and peer learning.', tone: 'blue', base: 86, members: [] },
        { id: 'c3', name: 'Drama Society', desc: 'Stage plays, street theatre and workshops.', tone: 'purple', base: 28, members: [] },
        { id: 'c4', name: 'Photography Club', desc: 'Photo walks, editing sessions and exhibitions.', tone: 'green', base: 35, members: [] }
      ],
      events: [
        { id: 'e1', clubId: 'c1', title: 'Build Night', date: 'Fri, Nov 20 - 6:00 PM', seats: 30, taken: 18, registered: [] },
        { id: 'e2', clubId: 'c2', title: 'Hack the Campus (24h hackathon)', date: 'Sat, Nov 28 - 9:00 AM', seats: 60, taken: 41, registered: [] },
        { id: 'e3', clubId: 'c4', title: 'Sunrise Photo Walk', date: 'Sun, Nov 22 - 6:00 AM', seats: 20, taken: 12, registered: [] }
      ]
    }),
    drives: () => ({
      drives: [
        { id: 'd1', company: 'Northwind Systems', role: 'Software Engineer Intern', date: 'Nov 19, 2026', ctc: '8 LPA', status: 'Open', eligibility: 'CGPA 7.0+' },
        { id: 'd2', company: 'Lumen Labs', role: 'Frontend Developer', date: 'Nov 29, 2026', ctc: '10 LPA', status: 'Closing soon', eligibility: 'CGPA 7.5+' },
        { id: 'd3', company: 'Vertex Analytics', role: 'Data Analyst Trainee', date: 'Dec 07, 2026', ctc: '7 LPA', status: 'Open', eligibility: 'CGPA 6.5+' }
      ],
      contacts: [
        { name: 'Rahul Sharma', role: 'Placement Head', email: 'rahul.sharma@campus.edu', phone: '+91 98100 00001' },
        { name: 'Prof. Priya Das', role: 'Mentor', email: 'priya.das@campus.edu', phone: '+91 98100 00002' }
      ]
    }),
    applications: () => [],   /* {id, driveId, username, status} */
    resumes: () => ({
      /* A sample submitted resume so the Placement Head has something to review */
      'rohan.m': {
        name: 'Rohan Mehta', email: 'rohan.mehta@campus.edu', phone: '+91 98765 43210',
        education: 'B.Tech Computer Science, 2027 - CGPA 8.1',
        skills: 'Java, Python, SQL, HTML, CSS, JavaScript',
        projects: 'Library Management System (Java + MySQL, 500+ records); Weather App (JavaScript API, 200 daily users)',
        summary: 'Second-year CS student interested in backend development and databases with hands-on project experience.',
        submitted: true, status: 'Pending', feedback: '', score: 100
      }
    }),
    notes: () => [
      { id: 'n1', type: 'academic', title: 'Data Structures class moved to B-206', body: 'Room change for the 10:15 AM lecture today.', ts: min(10), from: 'Dr. Menon', readBy: [] },
      { id: 'n2', type: 'placement', title: 'Northwind Systems registration closes tomorrow', body: 'Submit your resume on the Placement Cell page before 5:00 PM.', ts: min(60), from: 'Rahul Sharma', readBy: [] },
      { id: 'n3', type: 'canteen', title: 'Canteen: Samosa unavailable today', body: 'Fresh batch will be back tomorrow morning.', ts: min(120), from: 'Canteen', readBy: [] },
      { id: 'n4', type: 'club', title: 'Robotics Club: Build Night this Friday', body: 'Registrations are open. 12 seats left.', ts: min(1500), from: 'Robotics Club', readBy: ['student', 'faculty', 'placement'] },
      { id: 'n5', type: 'admin', title: 'Mid-semester exam schedule published', body: 'Check the Classroom Hub for the datesheet.', ts: min(2900), from: 'Admin Office', readBy: ['student', 'faculty', 'placement'] }
    ]
  };

  const DATA_KEYS = Object.keys(SEEDS);
  const key = n => 'cc_' + n;

  /* Read a data set (creates it from the seed on first use) */
  function get(name) {
    const s = raw.get(key(name));
    if (s) { try { return JSON.parse(s); } catch (e) { /* fall through and reseed */ } }
    const seed = SEEDS[name]();
    raw.set(key(name), JSON.stringify(seed));
    return seed;
  }
  function set(name, value) { raw.set(key(name), JSON.stringify(value)); }
  function resetAll() { DATA_KEYS.forEach(n => raw.del(key(n))); }

  /* ---------- Login / session ---------- */
  const SESSION = 'cc_session';
  const Auth = {
    login(username, password) {
      const a = ACCOUNTS.find(x => x.username === String(username).trim().toLowerCase() && x.password === password);
      if (!a) return null;
      raw.set(SESSION, JSON.stringify({ username: a.username, role: a.role }));
      return a;
    },
    user() {
      try {
        const s = JSON.parse(raw.get(SESSION));
        return ACCOUNTS.find(a => a.username === s.username && a.role === s.role) || null;
      } catch (e) { return null; }
    },
    logout() { raw.del(SESSION); location.href = 'login.html'; },
    can(role, page) { return (ACCESS[role] || []).includes(page); }
  };

  /* ---------- Page guard (runs immediately, before the page is drawn) ---------- */
  const file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  const page = file === 'index' ? 'home' : file;
  const me = Auth.user();
  const bounce = url => { document.documentElement.style.display = 'none'; location.replace(url); };

  if (page === 'login') {
    if (me) bounce('index.html');
  } else if (KNOWN_PAGES.includes(page)) {
    if (!me) bounce('login.html');
    else if (!Auth.can(me.role, page)) {
      try { sessionStorage.setItem('cc_denied', '1'); } catch (e) { /* ignore */ }
      bounce('index.html');
    }
  }

  window.CCData = { ACCOUNTS, ACCESS, get, set, resetAll, Auth, esc, uid, ago, raw };
})();
