/* ============================================================
   EduManage Pro — app.js
   Stack: jQuery 3.7 + Bootstrap 5 + localStorage DB
============================================================ */

'use strict';

// ===================== DATABASE LAYER =====================
const SchoolDB = {
  // Bumped to v3 — forces fresh load from database.js seed data
  _key: 'edumanage_pro_v3',

  get() {
    const raw = localStorage.getItem(this._key);
    return raw ? JSON.parse(raw) : null;
  },

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  seed() {
    // All data comes from database.js (SchoolSeedData)
    const src = SchoolSeedData;
    const data = {
      classes:    src.classes,
      teachers:   src.teachers,
      students:   src.students,
      notices:    src.notices,
      fees:       {},
      attendance: {},
      marks:      {},
    };
    // Auto-generate realistic fee payment records for every student
    data.students.forEach(s => {
      const pct  = 0.3 + Math.random() * 0.7;          // 30%–100% paid
      const paid = Math.floor(s.fee * pct);
      data.fees[s.roll] = {
        due: s.fee,
        paid,
        history: paid > 0 ? [{
          amount: paid, mode: 'Cash', receipt: 'AUTO-SEED',
          date: '2026-01-15', remarks: 'Opening balance'
        }] : []
      };
    });
    this.save(data);
    return data;
  },

  load() {
    return this.get() || this.seed();
  }
};

// ===================== STATE =====================
let DB = {};
let currentPage = 'dashboard';
let attState = {};     // { roll: 'present'|'absent'|'late' }
let marksState = {};   // { roll: value }
let toastTimer = null;

// ===================== INIT =====================
$(document).ready(function () {
  DB = SchoolDB.load();

  // Preloader
  setTimeout(() => {
    $('#preloader').fadeOut(500, () => {
      $('#appWrapper').fadeIn(300);
      initParticles();
      initClock();
      navigateTo('dashboard');
      updateNavBadges();
    });
  }, 2200);

  // Sidebar toggle
  $('#sidebarToggle').on('click', () => $('#sidebar').toggleClass('collapsed'));
  $('#mobileToggle').on('click', () => $('#sidebar').toggleClass('mobile-open'));

  // Nav clicks
  $('#sidebar .nav-link').on('click', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    navigateTo(page);
    if ($(window).width() < 992) $('#sidebar').removeClass('mobile-open');
  });

  // Sidebar search
  $('#sidebarSearch, #globalSearch').on('input', function () {
    const q = $(this).val().toLowerCase().trim();
    if (q.length < 2) return;
    const match = DB.students.find(s => s.name.toLowerCase().includes(q) || s.roll.includes(q));
    if (match) {
      navigateTo('students');
      $('#stuSearch').val(q).trigger('input');
    }
  });

  // Students filters
  $(document).on('input', '#stuSearch', filterStudents);
  $(document).on('change', '#stuClassFilter, #stuGenderFilter', filterStudents);

  // Teachers filter
  $(document).on('input', '#tchSearch', filterTeachers);

  // Attendance selects
  $(document).on('change', '#attClass, #attDate', loadAttendanceList);

  // Marks selects
  $(document).on('change', '#marksClass', onMarksClassChange);
  $(document).on('change', '#marksSubject, #marksExam', loadMarksTable);

  // Fee filters
  $(document).on('change', '#feeClassFilter, #feeStatusFilter', loadFeesTable);

  // Notice filter
  $(document).on('change', '#noticeFilter', renderNotices);

  // Fee modal roll lookup
  $(document).on('input', '#fRoll', lookupStudentFee);

  // Fullscreen
  $('#fullscreenBtn').on('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
});

// ===================== NAVIGATION =====================
function navigateTo(page) {
  currentPage = page;
  $('.page').addClass('hidden');
  $(`#page-${page}`).removeClass('hidden').addClass('active');
  $('#sidebar .nav-link').removeClass('active');
  $(`#nav-${page}`).addClass('active');

  const titles = {
    dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
    classes: 'Classes & Subjects', attendance: 'Attendance',
    marks: 'Marks & Results', fees: 'Fee Management', notices: 'Notice Board'
  };
  $('#topbarTitle').text(titles[page] || page);
  $('#topbarCrumb').text('System / ' + (titles[page] || page));

  const loaders = {
    dashboard: loadDashboard, students: loadStudentsPage,
    teachers: loadTeachersPage, classes: loadClassesPage,
    attendance: loadAttendancePage, marks: loadMarksPage,
    fees: loadFeesPage, notices: renderNotices
  };
  if (loaders[page]) loaders[page]();
}

// ===================== DASHBOARD =====================
function loadDashboard() {
  // Stats
  const totalFee = Object.values(DB.fees).reduce((a,f) => a + f.due, 0);
  const paidFee  = Object.values(DB.fees).reduce((a,f) => a + f.paid, 0);
  const stats = [
    { icon:'bi-people-fill',        val: DB.students.length, label:'Total Students',  trend:`+${Math.max(1, DB.students.length - 8)} new`, clr:'#00f5ff' },
    { icon:'bi-person-workspace',   val: DB.teachers.length, label:'Total Teachers',  trend:'Active Staff',      clr:'#7b61ff' },
    { icon:'bi-journal-bookmark-fill', val: DB.classes.length, label:'Classes Active', trend:'Grades 1–12',       clr:'#ff2d78' },
    { icon:'bi-cash-coin',          val: '₹' + (paidFee/100000).toFixed(1) + 'L', label:'Fee Collected', trend:`${Math.round(paidFee/totalFee*100)||0}% of total`, clr:'#ffc107' },
  ];
  $('#statsRow').html(stats.map(s => `
    <div class="col-sm-6 col-xl-3">
      <div class="stat-card-fut" style="--clr:${s.clr}">
        <div class="sc-icon"><i class="bi ${s.icon}"></i></div>
        <div class="sc-value">${s.val}</div>
        <div class="sc-label">${s.label}</div>
        <div class="sc-trend"><i class="bi bi-arrow-up-right"></i>${s.trend}</div>
      </div>
    </div>`).join(''));

  // Attendance bars
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const vals = [92, 88, 95, 78, 90, 65];
  $('#attChartWrap').html(days.map((d,i) => `
    <div class="att-day">
      <div class="att-bar-outer">
        <div class="att-bar-inner" data-pct="${vals[i]}" style="height:${vals[i]}%"></div>
      </div>
      <div class="att-day-label">${d}</div>
    </div>`).join(''));

  // Fee donut
  const pct = totalFee > 0 ? Math.round(paidFee / totalFee * 100) : 0;
  const r = 54, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  $('#feeDonut').html(`
    <div class="donut-ring" style="height:140px">
      <svg class="donut-svg" width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14"/>
        <circle cx="70" cy="70" r="${r}" fill="none" stroke="url(#dg)" stroke-width="14"
          stroke-dasharray="${dash} ${c}" stroke-linecap="round"/>
        <defs><linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00f5ff"/><stop offset="100%" stop-color="#7b61ff"/>
        </linearGradient></defs>
      </svg>
      <div class="donut-text"><span class="donut-pct">${pct}%</span><span class="donut-sub">Collected</span></div>
    </div>
    <div class="fee-legend">
      ${[['#00e676','Paid','₹'+paidFee.toLocaleString()],['#ff3d71','Pending','₹'+(totalFee-paidFee).toLocaleString()],['rgba(255,255,255,0.15)','Total','₹'+totalFee.toLocaleString()]]
        .map(([c,l,v]) => `<div class="fee-legend-item"><div style="display:flex;align-items:center"><div class="fee-legend-dot" style="background:${c}"></div>${l}</div><strong>${v}</strong></div>`).join('')}
    </div>`);

  // Recent students
  const recent = [...DB.students].slice(-5).reverse();
  $('#dashRecentStudents tbody').html(recent.map(s => {
    const f = DB.fees[s.roll] || {};
    const status = f.paid >= f.due ? 'Paid' : f.paid > 0 ? 'Partial' : 'Pending';
    return `<tr><td><strong>${s.name}</strong></td><td>${s.cls}</td><td>${s.roll}</td><td>${feeBadge(status)}</td></tr>`;
  }).join(''));

  // Notices feed
  const catColors = { General:'#00f5ff', Exam:'#7b61ff', Holiday:'#00e676', Sports:'#ffc107', Fee:'#ff3d71' };
  $('#dashNotices').html(DB.notices.slice(0,4).map(n => `
    <div class="nf-item">
      <div class="nf-dot" style="background:${catColors[n.cat]||'#00f5ff'}"></div>
      <div><div class="nf-title">${n.title}</div><div class="nf-meta">${n.cat} · ${fmtDate(n.date)}</div></div>
    </div>`).join('') || '<div class="empty-state"><i class="bi bi-megaphone"></i><p>No notices</p></div>');
}

// ===================== STUDENTS =====================
function loadStudentsPage() {
  populateSelect('#stuClassFilter', DB.classes.map(c => c.name), 'All Classes');
  renderStudentsTable(DB.students);
}

function filterStudents() {
  const q   = $('#stuSearch').val().toLowerCase();
  const cls = $('#stuClassFilter').val();
  const gen = $('#stuGenderFilter').val();
  let list = DB.students;
  if (q)   list = list.filter(s => s.name.toLowerCase().includes(q) || s.roll.includes(q));
  if (cls) list = list.filter(s => s.cls === cls);
  if (gen) list = list.filter(s => s.gender === gen);
  renderStudentsTable(list);
}

function renderStudentsTable(list) {
  if (!list.length) {
    $('#studentsTbody').html('<tr><td colspan="9" class="empty-cell"><i class="bi bi-search me-2"></i>No students found.</td></tr>');
    return;
  }
  $('#studentsTbody').html(list.map((s, i) => {
    const f = DB.fees[s.roll] || {};
    const status = f.paid >= f.due ? 'Paid' : f.paid > 0 ? 'Partial' : 'Pending';
    return `<tr>
      <td>${i+1}</td><td><code style="color:var(--neon);font-size:.8rem">${s.roll}</code></td>
      <td><strong>${s.name}</strong></td><td>${s.cls}</td>
      <td>${s.gender}</td><td>${s.parent||'—'}</td><td>${s.contact||'—'}</td>
      <td>${feeBadge(status)}</td>
      <td><div class="d-flex gap-1">
        <button class="act-btn" onclick="viewStudent('${s.id}')" title="View"><i class="bi bi-eye-fill"></i></button>
        <button class="act-btn del" onclick="deleteStudent('${s.id}')" title="Delete"><i class="bi bi-trash-fill"></i></button>
      </div></td>
    </tr>`;
  }).join(''));
}

/* ── CSV IMPORT LOGIC ── */
window.openCsvImportModal = function() {
  $('#csvFileInput').val('');
  $('#csvPreview').hide().html('');
  new bootstrap.Modal(document.getElementById('csvImportModal')).show();
};
$('#csvFileInput').on('change', function(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').filter(l=>l.trim());
    if(lines.length<2) return toast('File is empty or missing data!','danger');
    $('#csvPreview').show().html(`Found <strong>${lines.length-1}</strong> rows to process.<br>Headers: <code>${escapeHtml(lines[0])}</code>`);
  };
  reader.readAsText(file);
});
window.processCsvImport = function() {
  const file = $('#csvFileInput')[0].files[0];
  if(!file) return toast('Please select a file first.','danger');
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').filter(l=>l.trim());
    const header = lines[0].toLowerCase().split(',').map(h=>h.trim());
    const nIdx=header.indexOf('name'), cIdx=header.indexOf('class'), gIdx=header.indexOf('gender'), rIdx=header.indexOf('roll'),
          dIdx=header.indexOf('dob'), bIdx=header.indexOf('blood'), pIdx=header.indexOf('parent'), conIdx=header.indexOf('contact'), fIdx=header.indexOf('fee');
    
    if(nIdx<0||cIdx<0||rIdx<0||gIdx<0) return toast('Missing required columns: name, class, gender, roll','danger');
    
    let added=0, skipped=0;
    for(let i=1; i<lines.length; i++) {
        // Simple comma split (if commas inside quotes exist, use full CSV parser. For simple app, this is enough)
        const row = lines[i].split(',').map(c=>c.trim());
        if(row.length < 4) continue;
        const name=row[nIdx], cls=row[cIdx], roll=row[rIdx], gender=row[gIdx]||'Other';
        if(DB.students.some(s=>s.roll===roll)) { skipped++; continue; }
        
        const feeAmt = fIdx>=0 ? parseInt(row[fIdx])||0 : 0;
        DB.students.push({
            id: 'S'+Date.now()+i, roll, name, cls, gender,
            dob: dIdx>=0?row[dIdx]:'', blood: bIdx>=0?row[bIdx]:'',
            parent: pIdx>=0?row[pIdx]:'', contact: conIdx>=0?row[conIdx]:'',
            addr: '', fee: feeAmt, admDate: new Date().toISOString().split('T')[0]
        });
        DB.fees[roll] = { due:feeAmt, paid:0, history:[] };
        added++;
    }
    SchoolDB.save(DB);
    loadStudentsPage();
    updateNavBadges();
    bootstrap.Modal.getInstance(document.getElementById('csvImportModal')).hide();
    toast(`Import complete: ${added} added, ${skipped} skipped (duplicates/errors)`);
  };
  reader.readAsText(file);
};

window.addStudent = function () {
  const name = $('#sName').val().trim();
  const roll = $('#sRoll').val().trim();
  const cls  = $('#sClass').val();
  if (!name || !roll || !cls) return toast('Fill all required fields!', 'danger');
  if (DB.students.find(s => s.roll === roll)) return toast('Roll number already exists!', 'danger');

  const s = {
    id: 'S' + Date.now(), roll, name, cls,
    gender: $('#sGender').val(), dob: $('#sDob').val(),
    blood: $('#sBlood').val(), parent: $('#sParent').val(),
    contact: $('#sContact').val(), addr: $('#sAddress').val(),
    fee: parseInt($('#sFee').val()) || 0,
    admDate: $('#sAdmDate').val() || new Date().toISOString().split('T')[0]
  };
  DB.students.push(s);
  DB.fees[roll] = { due: s.fee, paid: 0, history: [] };
  SchoolDB.save(DB);
  bootstrap.Modal.getInstance(document.getElementById('addStudentModal'))?.hide();
  $('#addStudentModal input, #addStudentModal select').val('');
  renderStudentsTable(DB.students);
  updateNavBadges();
  toast(`Student "${name}" added! 🎓`, 'success');
};

window.deleteStudent = function (id) {
  if (!confirm('Delete this student? This cannot be undone.')) return;
  // BUG-04 FIX: also clean up orphan fee record to prevent stale data
  const target = DB.students.find(s => s.id === id);
  if (target && DB.fees[target.roll]) delete DB.fees[target.roll];
  DB.students = DB.students.filter(s => s.id !== id);
  SchoolDB.save(DB);
  renderStudentsTable(DB.students);
  updateNavBadges();
  toast('Student removed.', 'success');
};

window.viewStudent = function (id) {
  const s = DB.students.find(x => x.id === id);
  if (!s) return;
  const f = DB.fees[s.roll] || { due:0, paid:0 };
  const status = f.paid >= f.due ? 'Paid' : f.paid > 0 ? 'Partial' : 'Pending';
  $('#viewStudentBody').html(`
    <div class="text-center mb-3">
      <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--neon-2),var(--neon));display:flex;align-items:center;justify-content:center;font-family:var(--font-brand);font-size:1.5rem;font-weight:700;margin:0 auto 0.75rem;box-shadow:0 0 25px rgba(0,245,255,0.3)">${s.name.charAt(0)}</div>
      <h5 style="font-family:var(--font-brand);letter-spacing:1px">${s.name}</h5>
      <small style="color:var(--text-3)">${s.cls} · Roll ${s.roll}</small>
    </div>
    <div class="profile-grid">
      ${[['Roll No.', s.roll],['Class', s.cls],['Gender', s.gender],['Blood Group', s.blood||'—'],
         ['Date of Birth', fmtDate(s.dob)],['Admission Date', fmtDate(s.admDate)],
         ['Parent', s.parent||'—'],['Contact', s.contact||'—'],
         ['Annual Fee', '₹'+f.due.toLocaleString()],['Fee Status', feeBadge(status)],
         ['Paid', '₹'+f.paid.toLocaleString()],['Balance', '₹'+(f.due-f.paid).toLocaleString()],
        ].map(([l,v]) => `<div class="pf-item"><div class="pf-label">${l}</div><div class="pf-value">${v}</div></div>`).join('')}
      <div class="pf-item" style="grid-column:1/-1"><div class="pf-label">Address</div><div class="pf-value">${s.addr||'—'}</div></div>
    </div>`);
  new bootstrap.Modal(document.getElementById('viewStudentModal')).show();
};

// ===================== TEACHERS =====================
function loadTeachersPage() { filterTeachers(); }

function filterTeachers() {
  const q = $('#tchSearch').val().toLowerCase();
  const list = DB.teachers.filter(t =>
    t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.empId.toLowerCase().includes(q)
  );
  renderTeachersGrid(list);
}

function renderTeachersGrid(list) {
  if (!list.length) {
    $('#teachersGrid').html('<div class="col-12"><div class="empty-state"><i class="bi bi-person-workspace"></i><p>No teachers found.</p></div></div>');
    return;
  }
  $('#teachersGrid').html(list.map(t => `
    <div class="col-sm-6 col-xl-4">
      <div class="teacher-card-fut">
        <div class="tc-ava">${t.name.charAt(0)}</div>
        <div class="tc-name">${t.name}</div>
        <div class="tc-subject">${t.subject}</div>
        <div class="tc-empid">${t.empId}</div>
        <div class="tc-details">
          <div class="tc-row"><i class="bi bi-mortarboard-fill"></i>${t.qual}</div>
          <div class="tc-row"><i class="bi bi-telephone-fill"></i>${t.contact}</div>
          <div class="tc-row"><i class="bi bi-envelope-fill"></i>${t.email}</div>
          <div class="tc-row"><i class="bi bi-cash-coin"></i>₹${(t.salary||0).toLocaleString()}/month</div>
          <div class="tc-row"><i class="bi bi-calendar-check-fill"></i>Joined: ${fmtDate(t.join)}</div>
          ${t.cls ? `<div class="tc-row"><i class="bi bi-journal-bookmark-fill"></i>Class: ${t.cls}</div>` : ''}
        </div>
        <button class="btn-ghost w-100 mt-1" onclick="deleteTeacher('${t.id}')"><i class="bi bi-trash-fill me-1"></i>Remove</button>
      </div>
    </div>`).join(''));
}

window.addTeacher = function () {
  const name = $('#tName').val().trim();
  const sub  = $('#tSubject').val().trim();
  if (!name || !sub) return toast('Fill required fields!', 'danger');
  const t = {
    id: 'T' + Date.now(), name, subject: sub,
    empId: $('#tEmpId').val() || 'EMP-' + String(DB.teachers.length+1).padStart(3,'0'),
    qual: $('#tQual').val(), contact: $('#tContact').val(),
    email: $('#tEmail').val(), salary: parseInt($('#tSalary').val())||0,
    join: $('#tJoin').val()||new Date().toISOString().split('T')[0],
    cls: $('#tClass').val()
  };
  DB.teachers.push(t);
  SchoolDB.save(DB);
  bootstrap.Modal.getInstance(document.getElementById('addTeacherModal'))?.hide();
  $('#addTeacherModal input, #addTeacherModal select').val('');
  renderTeachersGrid(DB.teachers);
  updateNavBadges();
  toast(`Teacher "${name}" added! 👩‍🏫`, 'success');
};

window.deleteTeacher = function (id) {
  if (!confirm('Remove this teacher?')) return;
  DB.teachers = DB.teachers.filter(t => t.id !== id);
  SchoolDB.save(DB);
  renderTeachersGrid(DB.teachers);
  updateNavBadges();
  toast('Teacher removed.', 'success');
};

// ===================== CLASSES =====================
function loadClassesPage() { renderClassesGrid(); }

function renderClassesGrid() {
  if (!DB.classes.length) {
    $('#classesGrid').html('<div class="col-12"><div class="empty-state"><i class="bi bi-journal-bookmark"></i><p>No classes yet. Add one!</p></div></div>');
    return;
  }
  $('#classesGrid').html(DB.classes.map(c => {
    const count = DB.students.filter(s => s.cls === c.name).length;
    return `<div class="col-sm-6 col-xl-4">
      <div class="class-card-fut">
        <div class="cc-grade">${c.grade}</div>
        <div class="cc-name">📚 ${c.name}</div>
        <div class="cc-teacher"><i class="bi bi-person-workspace me-1"></i>${c.teacher||'No class teacher'}</div>
        <div class="cc-stats">
          <div class="cc-stat"><div class="cc-stat-val">${count}</div><div class="cc-stat-lab">Students</div></div>
          <div class="cc-stat"><div class="cc-stat-val">${c.subjects.length}</div><div class="cc-stat-lab">Subjects</div></div>
          <div class="cc-stat"><div class="cc-stat-val">₹${(c.fee||0)/1000}K</div><div class="cc-stat-lab">Annual Fee</div></div>
        </div>
        <div class="cc-subjects mb-3">${c.subjects.map(s=>`<span class="subj-chip">${s}</span>`).join('')}</div>
        <button class="btn-ghost w-100" onclick="deleteClass('${c.id}')"><i class="bi bi-trash-fill me-1"></i>Remove Class</button>
      </div>
    </div>`;
  }).join(''));
}

window.addClass = function () {
  const grade = $('#cGrade').val();
  const sec   = $('#cSection').val();
  const subs  = $('#cSubjects').val().trim();
  if (!grade || !subs) return toast('Fill all required fields!', 'danger');
  const name = `Class ${grade}-${sec}`;
  if (DB.classes.find(c => c.name === name)) return toast('This class already exists!', 'danger');
  DB.classes.push({
    id: 'C' + Date.now(), name, grade, section: sec,
    teacher: $('#cTeacher').val(),
    subjects: subs.split(',').map(s=>s.trim()).filter(Boolean),
    fee: parseInt($('#cFee').val())||0
  });
  SchoolDB.save(DB);
  bootstrap.Modal.getInstance(document.getElementById('addClassModal'))?.hide();
  $('#addClassModal input, #addClassModal select').val('');
  renderClassesGrid();
  updateNavBadges();
  toast(`Class "${name}" created! 📚`, 'success');
};

window.deleteClass = function (id) {
  if (!confirm('Delete this class?')) return;
  DB.classes = DB.classes.filter(c => c.id !== id);
  SchoolDB.save(DB);
  renderClassesGrid();
  updateNavBadges();
  toast('Class deleted.', 'success');
};

// ===================== ATTENDANCE =====================
function loadAttendancePage() {
  populateSelect('#attClass', DB.classes.map(c=>c.name), 'Select Class');
  $('#attDate').val(new Date().toISOString().split('T')[0]);
}

function loadAttendanceList() {
  const cls  = $('#attClass').val();
  const date = $('#attDate').val();
  if (!cls || !date) return;
  const students = DB.students.filter(s => s.cls === cls);
  if (!students.length) {
    $('#attList').html('<div class="empty-state"><i class="bi bi-people"></i><p>No students in this class.</p></div>');
    return;
  }
  const key = `${cls}__${date}`;
  attState = { ...DB.attendance[key] || {} };

  $('#attList').html(students.map(s => {
    const st = attState[s.roll] || '';
    return `<div class="att-row">
      <div class="att-info">
        <div class="att-ava">${s.name.charAt(0)}</div>
        <div><div class="att-name-txt">${s.name}</div><div class="att-roll-txt">Roll: ${s.roll}</div></div>
      </div>
      <div class="att-btns">
        <button class="att-btn btn-pres${st==='present'?' active':''}" data-roll="${s.roll}" data-val="present">✅ Present</button>
        <button class="att-btn btn-abs${st==='absent'?' active':''}" data-roll="${s.roll}" data-val="absent">❌ Absent</button>
        <button class="att-btn btn-late${st==='late'?' active':''}" data-roll="${s.roll}" data-val="late">⏰ Late</button>
      </div>
    </div>`;
  }).join(''));

  updateAttSummary(students.length);

  $(document).off('click.att').on('click.att', '.att-btn', function () {
    const roll = $(this).data('roll');
    const val  = $(this).data('val');
    attState[roll] = attState[roll] === val ? '' : val;
    $(`.att-btn[data-roll="${roll}"]`).removeClass('active');
    if (attState[roll]) $(this).addClass('active');
    updateAttSummary(students.length);
  });
}

function updateAttSummary(total) {
  const vals = Object.values(attState);
  const p = vals.filter(v=>v==='present').length;
  const a = vals.filter(v=>v==='absent').length;
  const l = vals.filter(v=>v==='late').length;
  const u = total - p - a - l;
  $('#attSummary').html(`
    <div class="att-sum-item"><div class="att-sum-dot" style="background:var(--green)"></div>Present: <strong>${p}</strong></div>
    <div class="att-sum-item"><div class="att-sum-dot" style="background:var(--red)"></div>Absent: <strong>${a}</strong></div>
    <div class="att-sum-item"><div class="att-sum-dot" style="background:var(--amber)"></div>Late: <strong>${l}</strong></div>
    <div class="att-sum-item"><div class="att-sum-dot" style="background:var(--text-3)"></div>Unmarked: <strong>${u}</strong></div>`);
}

window.markAllPresent = function () {
  const cls  = $('#attClass').val();
  if (!cls) return toast('Select a class first!', 'danger');
  DB.students.filter(s => s.cls === cls).forEach(s => { attState[s.roll] = 'present'; });
  $('.att-btn').removeClass('active');
  $('.att-btn.btn-pres').addClass('active');
  updateAttSummary(DB.students.filter(s=>s.cls===cls).length);
};

window.saveAttendance = function () {
  const cls  = $('#attClass').val();
  const date = $('#attDate').val();
  if (!cls || !date) return toast('Select class and date!', 'danger');
  DB.attendance[`${cls}__${date}`] = { ...attState };
  SchoolDB.save(DB);
  toast('Attendance saved! ✅', 'success');
};

// ===================== MARKS =====================
function loadMarksPage() {
  populateSelect('#marksClass', DB.classes.map(c=>c.name), 'Select Class');
}

function onMarksClassChange() {
  const cls = DB.classes.find(c => c.name === $('#marksClass').val());
  const subSel = document.getElementById('marksSubject');
  subSel.innerHTML = '<option value="">Select Subject</option>';
  if (cls) cls.subjects.forEach(s => subSel.innerHTML += `<option value="${s}">${s}</option>`);
  loadMarksTable();
}

function loadMarksTable() {
  const cls  = $('#marksClass').val();
  const sub  = $('#marksSubject').val();
  const exam = $('#marksExam').val();
  if (!cls || !sub) {
    $('#marksTbody').html('<tr><td colspan="5" class="empty-cell">Select class and subject to load students.</td></tr>');
    return;
  }
  const key      = `${cls}__${sub}__${exam}`;
  const saved    = DB.marks[key] || {};
  const students = DB.students.filter(s => s.cls === cls);
  marksState = { ...saved };

  if (!students.length) {
    $('#marksTbody').html('<tr><td colspan="5" class="empty-cell">No students in this class.</td></tr>');
    return;
  }

  $('#marksTbody').html(students.map(s => {
    const m = marksState[s.roll] !== undefined ? marksState[s.roll] : '';
    const g = m !== '' ? getGrade(+m) : '—';
    return `<tr>
      <td><code style="color:var(--neon);font-size:.8rem">${s.roll}</code></td>
      <td><strong>${s.name}</strong></td>
      <td><input type="number" class="marks-input-field" min="0" max="100" value="${m}" placeholder="—" data-roll="${s.roll}" data-key="${key}"/></td>
      <td id="grade-${s.roll}">${gradeHtml(g)}</td>
      <td style="color:var(--text-3);font-size:.78rem">${getRemarks(m)}</td>
    </tr>`;
  }).join(''));

  $(document).off('input.marks').on('input.marks', '.marks-input-field', function () {
    const roll = $(this).data('roll');
    const val  = parseInt($(this).val());
    if (!isNaN(val) && val >= 0 && val <= 100) {
      marksState[roll] = val;
      $(`#grade-${roll}`).html(gradeHtml(getGrade(val)));
    }
  });
}

window.saveMarks = function () {
  const cls  = $('#marksClass').val();
  const sub  = $('#marksSubject').val();
  const exam = $('#marksExam').val();
  if (!cls || !sub) return toast('Select class and subject!', 'danger');
  DB.marks[`${cls}__${sub}__${exam}`] = { ...marksState };
  SchoolDB.save(DB);
  toast('Marks saved! 📝', 'success');
};

function getGrade(m) {
  if (m>=90) return 'A+'; if (m>=80) return 'A'; if (m>=70) return 'B+';
  if (m>=60) return 'B'; if (m>=50) return 'C'; if (m>=33) return 'D'; return 'F';
}
function getRemarks(m) {
  if (m==='') return '—';
  m=+m;
  if (m>=90) return '🌟 Outstanding'; if (m>=80) return '🎯 Excellent'; if (m>=70) return '👍 Good';
  if (m>=60) return '✅ Average'; if (m>=50) return '⚠️ Below Average'; if (m>=33) return '🔴 Needs Improvement'; return '❌ Fail';
}
function gradeHtml(g) {
  const map = {'A+':'#00e676','A':'#00e676','B+':'#00f5ff','B':'#00f5ff','C':'#ffc107','D':'#ff9800','F':'#ff3d71','—':''};
  const clr = map[g] || '#888';
  return g === '—' ? '—' : `<span class="grade-badge" style="background:${clr}22;color:${clr};border:1px solid ${clr}55">${g}</span>`;
}

// ===================== FEES =====================
function loadFeesPage() {
  populateSelect('#feeClassFilter', DB.classes.map(c=>c.name), 'All Classes');
  loadFeesTable();
}

function loadFeesTable() {
  const cls    = $('#feeClassFilter').val();
  const status = $('#feeStatusFilter').val();
  let students = DB.students;
  if (cls) students = students.filter(s => s.cls === cls);

  let totalDue=0, totalPaid=0;
  const rows = [];
  students.forEach(s => {
    const f = DB.fees[s.roll] || { due: s.fee||0, paid: 0, history: [] };
    const balance = f.due - f.paid;
    const st = f.paid >= f.due ? 'Paid' : f.paid > 0 ? 'Partial' : 'Pending';
    if (status && st !== status) return;
    totalDue += f.due; totalPaid += f.paid;
    rows.push(`<tr>
      <td><code style="color:var(--neon);font-size:.8rem">${s.roll}</code></td>
      <td><strong>${s.name}</strong></td><td>${s.cls}</td>
      <td>₹${f.due.toLocaleString()}</td>
      <td style="color:var(--green)">₹${f.paid.toLocaleString()}</td>
      <td style="color:${balance>0?'var(--red)':'var(--green)'}">₹${balance.toLocaleString()}</td>
      <td>${feeBadge(st)}</td>
      <td><button class="act-btn pay" onclick="quickPay('${s.roll}','${s.name}')" title="Pay"><i class="bi bi-cash-coin"></i></button></td>
    </tr>`);
  });

  $('#feesTbody').html(rows.length ? rows.join('') : '<tr><td colspan="8" class="empty-cell">No records found.</td></tr>');
  $('#feeCollectedVal').text('₹'+totalPaid.toLocaleString());
  $('#feePendingVal').text('₹'+(totalDue-totalPaid).toLocaleString());
  $('#feeTotalVal').text('₹'+totalDue.toLocaleString());
}

window.quickPay = function (roll, name) {
  $('#fRoll').val(roll);
  $('#fName').val(name);
  $('#fDate').val(new Date().toISOString().split('T')[0]);
  new bootstrap.Modal(document.getElementById('addFeeModal')).show();
};

function lookupStudentFee() {
  const s = DB.students.find(x => x.roll === $('#fRoll').val().trim());
  $('#fName').val(s ? s.name : '');
}

window.recordPayment = function () {
  const roll   = $('#fRoll').val().trim();
  const amount = parseInt($('#fAmount').val());
  if (!roll || !amount || amount <= 0) return toast('Fill required fields!', 'danger');
  const s = DB.students.find(x => x.roll === roll);
  if (!s) return toast('Student not found!', 'danger');
  if (!DB.fees[roll]) DB.fees[roll] = { due: s.fee||0, paid: 0, history: [] };
  DB.fees[roll].paid = Math.min(DB.fees[roll].paid + amount, DB.fees[roll].due);
  DB.fees[roll].history.push({
    amount, mode: $('#fMode').val(),
    receipt: $('#fReceipt').val(),
    date: $('#fDate').val(),
    remarks: $('#fRemarks').val()
  });
  SchoolDB.save(DB);
  bootstrap.Modal.getInstance(document.getElementById('addFeeModal'))?.hide();
  $('#addFeeModal input, #addFeeModal select').val('');
  loadFeesTable();
  toast(`₹${amount.toLocaleString()} payment recorded! 💰`, 'success');
};

// ===================== NOTICES =====================
function renderNotices() {
  const filter = $('#noticeFilter').val();
  const list   = filter ? DB.notices.filter(n => n.cat === filter) : DB.notices;
  const catBadge = { General:'badge-gen', Exam:'badge-exam', Holiday:'badge-holi', Sports:'badge-sport', Fee:'badge-fee' };
  const prioBadge = { Normal:'badge-prio-normal', High:'badge-prio-high', Urgent:'badge-prio-urgent' };
  const catDot   = { General:'#00f5ff', Exam:'#7b61ff', Holiday:'#00e676', Sports:'#ffc107', Fee:'#ff3d71' };

  if (!list.length) {
    $('#noticesGrid').html('<div class="col-12"><div class="empty-state"><i class="bi bi-megaphone"></i><p>No notices found.</p></div></div>');
    return;
  }
  $('#noticesGrid').html(list.map(n => `
    <div class="col-sm-6 col-xl-4">
      <div class="notice-card-fut">
        <div class="nc-top">
          <div class="nc-title">${n.title}</div>
          <span class="${prioBadge[n.prio]||'badge-prio-normal'}">${n.prio}</span>
        </div>
        <div class="nc-body">${n.content}</div>
        <div class="nc-footer">
          <div class="d-flex align-items-center gap-2">
            <div style="width:8px;height:8px;border-radius:50%;background:${catDot[n.cat]||'#00f5ff'}"></div>
            <span class="${catBadge[n.cat]||'badge-gen'}">${n.cat}</span>
            <span class="nc-date">${fmtDate(n.date)}</span>
          </div>
          <button class="nc-del" onclick="deleteNotice('${n.id}')"><i class="bi bi-trash-fill"></i></button>
        </div>
      </div>
    </div>`).join(''));
}

window.addNotice = function () {
  const title   = $('#nTitle').val().trim();
  const content = $('#nContent').val().trim();
  if (!title || !content) return toast('Fill all fields!', 'danger');
  DB.notices.unshift({ id:'N'+Date.now(), title, cat: $('#nCat').val(), prio: $('#nPrio').val(), content, date: new Date().toISOString().split('T')[0] });
  SchoolDB.save(DB);
  bootstrap.Modal.getInstance(document.getElementById('addNoticeModal'))?.hide();
  $('#addNoticeModal input, #addNoticeModal textarea, #addNoticeModal select').val('');
  renderNotices();
  toast('Notice posted! 📢', 'success');
};

window.deleteNotice = function (id) {
  if (!confirm('Delete this notice?')) return;
  DB.notices = DB.notices.filter(n => n.id !== id);
  SchoolDB.save(DB);
  renderNotices();
  toast('Notice deleted.', 'success');
};

// ===================== UTILITIES =====================
function populateSelect(sel, options, placeholder) {
  const cur = $(sel).val();
  $(sel).html(`<option value="">${placeholder}</option>` +
    options.map(o => `<option value="${o}" ${o===cur?'selected':''}>${o}</option>`).join(''));
}

function feeBadge(status) {
  const map = { Paid:'badge-paid', Pending:'badge-pend', Partial:'badge-part' };
  return `<span class="${map[status]||'badge-gen'}">${status}</span>`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function toast(msg, type='success') {
  const el = document.getElementById('liveToast');
  const $el = $('#liveToast');
  $el.removeClass('toast-danger').addClass(type==='danger'?'toast-danger':'');
  $('#toastMsg').text(msg);
  const t = bootstrap.Toast.getOrCreateInstance(el, { delay: 3500 });
  t.show();
}

function updateNavBadges() {
  $('#nb-students').text(DB.students.length);
  $('#nb-teachers').text(DB.teachers.length);
  $('#nb-classes').text(DB.classes.length);
  const pending = DB.students.filter(s => { const f=DB.fees[s.roll]; return f && f.paid < f.due; }).length;
  $('#nb-fees').text(pending || '');
  $('#nb-notices').text(DB.notices.length);
}

function initClock() {
  function tick() {
    const now = new Date();
    $('#sysClock').text(now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  }
  tick();
  setInterval(tick, 1000);
}

// Populate dropdowns when modals open
$(document).on('show.bs.modal', '#addStudentModal', function () {
  populateSelect('#sClass', DB.classes.map(c=>c.name), '-- Select Class --');
});
$(document).on('show.bs.modal', '#addTeacherModal', function () {
  populateSelect('#tClass', DB.classes.map(c=>c.name), '-- None --');
});
$(document).on('show.bs.modal', '#addClassModal', function () {
  populateSelect('#cTeacher', DB.teachers.map(t=>t.name), '-- Select Teacher --');
});

// ===================== PARTICLES =====================
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,245,255,${0.06*(1-d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
