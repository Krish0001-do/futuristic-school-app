/* ============================================================
   EduManage Pro — animations.js
   Custom cursor, Matrix rain, 3D tilt, Counter animation,
   Typewriter, Ripple, Particle upgrade, etc.
============================================================ */

$(document).ready(function () {
  initCustomCursor();
  initMatrixRain();
  initAurora();
  initDataStreams();
  setupRipple();
  setupTilt3D();
  overrideNavigateTo();
});

/* ===================== CUSTOM CURSOR ===================== */
function initCustomCursor() {
  const cursor = $('<div id="customCursor"></div>');
  const ring   = $('<div id="cursorRing"></div>');
  $('body').append(cursor, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  $(document).on('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    cursor.css({ left: mx, top: my });
  });

  // Ring follows with lag
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.css({ left: rx, top: ry });
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Trail particles
  let trailTimer = 0;
  $(document).on('mousemove', function (e) {
    if (Date.now() - trailTimer < 40) return;
    trailTimer = Date.now();
    const trail = $('<div>').css({
      position: 'fixed',
      left: e.clientX, top: e.clientY,
      width: 4, height: 4,
      borderRadius: '50%',
      background: `hsl(${Math.random()*60+170}, 100%, 70%)`,
      pointerEvents: 'none',
      zIndex: 99997,
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.5s ease',
      opacity: 0.7,
      boxShadow: '0 0 6px currentColor'
    });
    $('body').append(trail);
    setTimeout(() => { trail.css({ opacity: 0, transform: 'translate(-50%,-50%) scale(0) ' }); }, 50);
    setTimeout(() => trail.remove(), 600);
  });
}

/* ===================== MATRIX RAIN ===================== */
function initMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'matrixCanvas';
  document.body.appendChild(canvas);

  const ctx    = canvas.getContext('2d');
  const chars  = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ∑∆∇∂∞≈≠AБВГД∫◈◆';
  let cols, drops;

  function resize() {
    const sidebarW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w')) || 260;
    canvas.width  = sidebarW;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 14);
    drops = new Array(cols).fill(1);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(5, 8, 18, 0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f5ff';
    ctx.font = '11px monospace';
    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.9 ? '#fff' : 'rgba(0,245,255,0.8)';
      ctx.fillText(ch, i * 14, y * 14);
      if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }
  setInterval(draw, 60);
}

/* ===================== AURORA BLOBS ===================== */
function initAurora() {
  const wrap = $('<div class="aurora-wrap"></div>');
  wrap.append('<div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div>');
  $('body').prepend(wrap);
}

/* ===================== DATA STREAMS ===================== */
function initDataStreams() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  [1,2,3].forEach(i => {
    const s = document.createElement('div');
    s.className = `data-stream data-stream-${i}`;
    s.style.right = (i * 20) + 'px';
    sidebar.appendChild(s);
  });
}

/* ===================== BUTTON RIPPLE ===================== */
function setupRipple() {
  $(document).on('click', '.btn-neon', function (e) {
    const btn    = $(this);
    const offset = btn.offset();
    const x = e.pageX - offset.left;
    const y = e.pageY - offset.top;
    const size = Math.max(btn.outerWidth(), btn.outerHeight());
    const ripple = $('<span class="ripple-el"></span>').css({
      width: size, height: size,
      left: x - size/2, top: y - size/2,
    });
    btn.append(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

/* ===================== 3D CARD TILT ===================== */
function setupTilt3D() {
  $(document).on('mousemove', '.stat-card-fut', function (e) {
    const card   = $(this);
    const offset = card.offset();
    const cx     = card.outerWidth()  / 2;
    const cy     = card.outerHeight() / 2;
    const dx     = (e.pageX - offset.left - cx) / cx;
    const dy     = (e.pageY - offset.top  - cy) / cy;
    const rotY   =  dx * 12;
    const rotX   = -dy * 12;
    card.css('transform', `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.03)`);
    card.find('.sc-icon').css('transform', `translateZ(30px)`);
    card.find('.sc-value').css('transform', `translateZ(20px)`);
  });
  $(document).on('mouseleave', '.stat-card-fut', function () {
    $(this).css('transform', '');
    $(this).find('.sc-icon, .sc-value').css('transform', '');
  });
}

/* ===================== COUNTER ANIMATION ===================== */
function animateCounter(el, target, prefix, suffix, duration) {
  const isNum  = !isNaN(target.toString().replace(/[₹,L]/g, ''));
  const numVal = parseFloat(target.toString().replace(/[₹,L]/g, '')) || 0;
  let start    = 0;
  const step   = numVal / (duration / 16);
  const timer  = setInterval(() => {
    start += step;
    if (start >= numVal) { start = numVal; clearInterval(timer); }
    let display;
    if (target.toString().includes('L')) {
      display = (prefix||'') + start.toFixed(1) + 'L';
    } else if (target.toString().includes('₹')) {
      display = '₹' + Math.round(start).toLocaleString('en-IN');
    } else {
      display = (prefix||'') + Math.round(start) + (suffix||'');
    }
    el.textContent = display;
  }, 16);
}

/* ===================== TYPEWRITER TITLE ===================== */
function typewriterTitle(text) {
  const el = document.getElementById('topbarTitle');
  el.textContent = '';
  el.classList.add('typing');
  setTimeout(() => {
    el.textContent = text;
    setTimeout(() => el.classList.remove('typing'), 700);
  }, 50);
}

/* ===================== OVERRIDE NAVIGATION ===================== */
// Store original navigateTo and wrap with animations
function overrideNavigateTo() {
  // Wait for app.js navigateTo to exist
  if (typeof navigateTo === 'undefined') {
    setTimeout(overrideNavigateTo, 100);
    return;
  }

  const _original = window.navigateTo;
  window.navigateTo = function (page) {
    // Page flash effect
    const wrap = document.querySelector('.pages-wrap');
    if (wrap) {
      wrap.style.opacity = '0';
      wrap.style.transform = 'scale(0.98)';
      wrap.style.filter = 'blur(3px)';
      setTimeout(() => {
        wrap.style.transition = 'opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease';
        wrap.style.opacity = '1';
        wrap.style.transform = 'scale(1)';
        wrap.style.filter = 'blur(0)';
        setTimeout(() => { wrap.style.transition = ''; }, 300);
      }, 80);
    }

    // Typewriter
    const titles = {
      dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
      classes: 'Classes & Subjects', attendance: 'Attendance',
      marks: 'Marks & Results', fees: 'Fee Management', notices: 'Notice Board'
    };
    const t = titles[page];
    if (t) setTimeout(() => typewriterTitle(t), 80);

    // Sidebar active neon sweep
    setTimeout(() => {
      const activeLink = document.querySelector(`#nav-${page}`);
      if (activeLink) {
        activeLink.style.transition = 'background 0.3s ease';
        activeLink.style.background = 'rgba(0,245,255,0.18)';
        setTimeout(() => {
          activeLink.style.background = '';
        }, 400);
      }
    }, 50);

    _original(page);

    // After render — trigger counters if dashboard
    if (page === 'dashboard') {
      setTimeout(triggerDashboardCounters, 350);
    }
  };
}

/* ===================== DASHBOARD COUNTERS ===================== */
function triggerDashboardCounters() {
  document.querySelectorAll('.sc-value').forEach(el => {
    const raw = el.textContent.trim();
    if (!raw || raw === '—') return;
    el.textContent = '0';
    if (raw.includes('₹')) {
      const num = parseFloat(raw.replace(/[₹,L]/g,''));
      if (raw.includes('L')) {
        let s = 0; const target = num;
        const timer = setInterval(() => {
          s += target / 40;
          if (s >= target) { s = target; clearInterval(timer); }
          el.textContent = '₹' + s.toFixed(1) + 'L';
        }, 25);
      } else {
        animateCounter(el, raw, '', '', 800);
      }
    } else {
      const num = parseInt(raw);
      if (!isNaN(num)) {
        let s = 0;
        const timer = setInterval(() => {
          s += Math.ceil(num / 25);
          if (s >= num) { s = num; clearInterval(timer); }
          el.textContent = s;
        }, 30);
      } else {
        el.textContent = raw;
      }
    }
  });
}

/* ===================== ENHANCED PARTICLES ===================== */
// Upgrade the particle canvas with mouse interaction
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(upgradeParticles, 2500);
});

function upgradeParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Store mouse ref on canvas for use in particle loop
  canvas._mouse = { x: mouseX, y: mouseY };
  document.addEventListener('mousemove', e => {
    canvas._mouse = { x: e.clientX, y: e.clientY };
  });
}

/* ===================== STAGGER GRID ITEMS ===================== */
// Add stagger delay to dynamically created cards
const staggerObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      const cards = node.querySelectorAll
        ? node.querySelectorAll('.teacher-card-fut, .class-card-fut, .notice-card-fut')
        : [];
      cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.08}s`;
      });
      if (node.classList?.contains('teacher-card-fut') ||
          node.classList?.contains('class-card-fut')   ||
          node.classList?.contains('notice-card-fut')) {
        node.style.animationDelay = '0s';
      }
    });
  });
});
staggerObserver.observe(document.body, { childList: true, subtree: true });

/* ===================== GLITCH BRAND TEXT ===================== */
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    const brandTitle = document.querySelector('.brand-title');
    if (brandTitle) {
      brandTitle.setAttribute('data-text', brandTitle.textContent);
    }
  }, 2600);
});

/* ===================== MODAL NEON GLOW ===================== */
$(document).on('show.bs.modal', '.modal', function () {
  setTimeout(() => {
    $(this).find('.fut-modal').css({
      'box-shadow': '0 0 60px rgba(0,245,255,0.15), 0 0 120px rgba(123,97,255,0.1), 0 30px 60px rgba(0,0,0,0.5)'
    });
  }, 50);
});

/* ===================== SCROLL REVEAL ===================== */
// Simple IntersectionObserver for glass cards
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeCards() {
  document.querySelectorAll('.glass-card').forEach(card => {
    if (!card.dataset.revealed) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(25px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.3,0.64,1)';
      card.dataset.revealed = 'true';
      revealObserver.observe(card);
    }
  });
}

// Trigger after each navigation
const origNav = window.navigateTo;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.navigateTo !== origNav) return; // already wrapped
    const _n = window.navigateTo;
    if (_n) {
      window.navigateTo = function(p) {
        _n(p);
        setTimeout(observeCards, 200);
      };
    }
  }, 3000);
});

/* ===================== FEE BAR FILL ANIMATION ===================== */
$(document).on('mouseover', '.fee-bar-fill', function () {
  const w = this.style.width;
  $(this).css('width', '0');
  setTimeout(() => $(this).css('width', w), 50);
});
