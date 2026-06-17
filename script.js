/* ── HERO FLOATING PARTICLES (disabled for Antigravity bg) ── */
(function () {
  return; // Disabled to meet "no canvas background" requirement
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Material-style icon labels matching Antigravity theme
  const symbols = [
    'terminal','code','commit','merge','folder','refresh',
    'device_hub','file_copy','spark','search','dashboard',
    'data_object','deployed_code','keyboard_tab','check_circle'
  ];

  // Use text symbols that look like icons
  const displaySyms = ['⌨','</>','{ }','#','⚡','◈','⊕','⊗','◉','⊞','⊟','⊠','⊡','◎','●','-','_','+','=','~'];

  let mouse = { x: -9999, y: -9999, inside: false };
  let particles = [];

  const hero = document.getElementById('hero');

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Global mouse tracking
  document.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    if (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom
    ) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
    } else {
      mouse.inside = false;
    }
  });

  // Each particle: has home position + follows cursor with lag
  function makeParticle(i) {
    const homeX = Math.random() * canvas.width;
    const homeY = Math.random() * canvas.height;
    return {
      x: homeX, y: homeY,
      homeX, homeY,
      vx: 0, vy: 0,
      size: Math.random() * 6 + 11,
      sym: displaySyms[i % displaySyms.length],
      alpha: Math.random() * 0.25 + 0.1,
      baseAlpha: 0,
      lag: Math.random() * 0.04 + 0.02,   // how fast it follows cursor
      followDist: Math.random() * 160 + 60, // orbit radius around cursor
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() - 0.5) * 0.015,
    };
  }

  for (let i = 0; i < 22; i++) {
    const p = makeParticle(i);
    p.baseAlpha = p.alpha;
    particles.push(p);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      let targetX, targetY;

      if (mouse.inside) {
        // Orbit around cursor at varying distances
        p.angle += p.angleSpeed;
        targetX = mouse.x + Math.cos(p.angle + i) * p.followDist * 0.4;
        targetY = mouse.y + Math.sin(p.angle + i) * p.followDist * 0.4;
        p.alpha += (Math.min(p.baseAlpha + 0.35, 0.75) - p.alpha) * 0.08;
      } else {
        // Drift back to home
        targetX = p.homeX + Math.sin(Date.now() * 0.0005 + i) * 18;
        targetY = p.homeY + Math.cos(Date.now() * 0.0007 + i * 1.3) * 12;
        p.alpha += (p.baseAlpha - p.alpha) * 0.04;
      }

      // Smooth lerp toward target
      p.x += (targetX - p.x) * p.lag;
      p.y += (targetY - p.y) * p.lag;

      // Draw
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = `700 ${p.size}px 'Segoe UI', monospace`;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = mouse.inside ? 16 : 6;
      ctx.fillText(p.sym, p.x, p.y);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

/* ── MOBILE HAMBURGER MENU ── */
(function () {
  const btn      = document.getElementById('navHamburger');
  const dropdown = document.getElementById('navDropdown');
  const closeBtn = document.getElementById('navDropdownClose');
  if (!btn || !dropdown) return;

  function openMenu()  { dropdown.classList.add('open');    btn.classList.add('open');    btn.setAttribute('aria-expanded','true');  }
  function closeMenu() { dropdown.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }

  btn.addEventListener('click', () => dropdown.classList.contains('open') ? closeMenu() : openMenu());
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  dropdown.querySelectorAll('.nav-dropdown-link').forEach(l => l.addEventListener('click', closeMenu));
})();

/* ── NAVBAR SCROLL SHOW/HIDE ── */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const hero = document.getElementById('hero');
  const isMobile = () => window.innerWidth <= 600;
  const sections = ['about', 'experience', 'skills', 'certificate', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .nav-dropdown-link[href^="#"]');

  function updateNavbar() {
    // On mobile, always show navbar (hamburger always accessible)
    if (isMobile()) {
      navbar.classList.add('visible');
    } else {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      if (heroBottom <= 60) {
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('visible');
      }
    }

    // Active link highlight
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  window.addEventListener('resize', updateNavbar, { passive: true });
  updateNavbar();
})();

/* ── LOADER ── */
window.addEventListener('load', () => {
  // Huruf AMARSYA TERANO selesai di ~1.15s + bar 1s = ~2.3s total
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    startTyping();
    animateStats();
  }, 2400);
});

/* ── TYPED TEXT ── */
const phrases = [
  'Cisco Packet Tracer',
  'Mikrotik',
  'Operation System(Linux, Windows)',
  'Microsoft Office',
  'Router',
  'Switch',
  'Proyektor'
];
let phraseIdx = 0, charIdx = 0, deleting = false;

function startTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  function tick() {
    const current = phrases[phraseIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 60);
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 100);
    }
  }
  tick();
}

/* ── BACK TO TOP visibility ── */
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── TIMELINE REVEAL ── */
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 150);
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline-item').forEach(el => timelineObserver.observe(el));

/* ── SKILL CARDS hover effect (no bars) ── */
document.querySelectorAll('.skill-card').forEach(card => {
  // no bar animation needed
});

/* ── CERTIFICATE MOBILE SLIDER ── */
(function () {
  const mobileWrap = document.getElementById('certMobile');
  if (!mobileWrap) return;

  // Reuse same certs array — defined inline here for mobile
  const certs = [
    { img: 'img/misc/lks-1.avif',              label: 'LKS Tingkat SMK – ITNSA',                                    desc: 'Sertifikat peserta bidang lomba IT Network System Administration tingkat SMK.' },
    { img: 'img/misc/pkl-2.avif',               label: 'Internship – Universitas Multimedia Nusantara',              desc: 'Sertifikat Praktik Kerja Lapangan sebagai IT Support di Universitas Multimedia Nusantara.' },
    { img: 'img/misc/dibimbing-3.avif',         label: 'Bootcamp Cyber Security – dibimbing.id',                    desc: 'Sertifikat Bootcamp Cyber Security dari Dibimbing.id.' },
    { img: 'img/misc/revou-4.avif',             label: 'Coding Camp Software Engineer – revoU',                     desc: 'Sertifikat CodingCamp Software dari revoU.' },
    { img: 'img/misc/dibimbing-4.avif',         label: 'Bootcamp DevOps – dibimbing.id',                            desc: 'Sertifikat Bootcamp DevOps dari Dibimbing.id.' },
    { img: 'img/misc/buildai.jpg',              label: 'IBM Build AI Agent – Hactiv8',                              desc: 'Sertifikat Event Hactiv8 Build AI Agent dari IBM.' },
    { img: 'img/misc/DSML.jpg',                 label: 'Bootcamp DSML – dibimbing.id',                              desc: 'Sertifikat Event Bootcamp DSML dari Dibimbing.id.' },
    { img: 'img/misc/panahan-2025-5.avif',      label: 'Archery Cakra Buana Championship 2025',                     desc: 'Sertifikat Juara Panahan Cakra Buana Championship 2025 di Depok.' },
    { img: 'img/misc/panahan-2024-6.avif',      label: 'Archery Championship Sahid Bogor 2024',                     desc: 'Sertifikat Juara Panahan Pondok Pesantren Modern Sahid Bogor 2024.' },
    { img: 'img/misc/panahan2023-7.avif',       label: 'Archery De Poris Competition 2023',                         desc: 'Sertifikat Juara Panahan De Poris Archery Competition 2023 Piala Wakil Walikota Tangerang.' },
    { img: 'img/misc/taekwondo 2024-8.avif',    label: 'Taekwondo Tangcity Cup 2024',                               desc: 'Sertifikat Kejuaraan Taekwondo Championship Tangcity Cup 2024.' },
    { img: 'img/misc/taekwondo2016-9.avif',     label: 'Taekwondo Prabu Challenge 2016',                            desc: 'Sertifikat Kejuaraan Prabu Taekwondo Challenge 2016.' },
    { img: 'img/misc/taekwondo 2016-10.avif',   label: 'Taekwondo Black Jaguar 2016',                               desc: 'Sertifikat Kejuaraan Black Jaguar Taekwondo Competition 2016.' },
    { img: 'img/misc/taekwondo 2015-11.avif',   label: 'Taekwondo Super Junior 2015',                               desc: 'Sertifikat Kejuaraan Taekwondo Super Junior, Pra Junior & Junior tahun 2015.' },
    { img: 'img/misc/sertipenghargaan.jpg',     label: 'Penghargaan Prestasi Taekwondo',                            desc: 'Sertifikat Penghargaan Taekwondo dari SMK PGRI 1 Tangerang.' },
  ];

  const total = certs.length;
  let current = 0;

  const img       = document.getElementById('certMobileImg');
  const title     = document.getElementById('certMobileTitle');
  const desc      = document.getElementById('certMobileDesc');
  const counter   = document.getElementById('certMobileCounter');
  const dotsWrap  = document.getElementById('certMobileDots');
  const btnPrev   = document.getElementById('certMobilePrev');
  const btnNext   = document.getElementById('certMobileNext');
  const imgWrap   = document.getElementById('certMobileImgWrap');

  // Fullscreen
  const fullscreen      = document.getElementById('certFullscreen');
  const fullscreenImg   = document.getElementById('certFullscreenImg');
  const fullscreenTitle = document.getElementById('certFullscreenTitle');
  const fullscreenDesc  = document.getElementById('certFullscreenDesc');
  const fullscreenClose = document.getElementById('certFullscreenClose');

  // Build dots
  certs.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'cert-mobile-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Certificate ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    const c = certs[current];

    img.src = c.img;
    img.alt = c.label;
    title.textContent = c.label;
    desc.textContent  = c.desc;
    counter.textContent = (current + 1) + ' / ' + total;

    // Hide desc by default (only show on click)
    desc.classList.add('hidden');

    dotsWrap.querySelectorAll('.cert-mobile-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Click image → toggle desc / open fullscreen
  imgWrap.addEventListener('click', () => {
    // Open fullscreen
    fullscreenImg.src = certs[current].img;
    fullscreenImg.alt = certs[current].label;
    fullscreenTitle.textContent = certs[current].label;
    fullscreenDesc.textContent  = certs[current].desc;
    fullscreen.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  // Click title area → toggle desc
  title.addEventListener('click', () => {
    desc.classList.toggle('hidden');
  });

  // Close fullscreen
  fullscreenClose.addEventListener('click', () => {
    fullscreen.classList.remove('open');
    document.body.style.overflow = '';
  });
  fullscreen.addEventListener('click', e => {
    if (e.target === fullscreen) {
      fullscreen.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Swipe support
  let touchStartX = 0;
  imgWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  imgWrap.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  });

  goTo(0);
})();

/* ── CERTIFICATE SHOWCASE ── */
(function () {
  const certs = [
    { img: 'img/misc/lks-1.avif',              label: 'LKS Tingkat SMK – ITNSA',      desc: 'Sertifikat peserta bidang lomba IT Network System Administration tingkat SMK.' },
    { img: 'img/misc/pkl-2.avif',               label: 'Internship – Universitas Multimedia Nusantara',              desc: 'Sertifikat Praktik Kerja Lapangan sebagai IT Support di Universitas Multimedia Nusantara.' },
    { img: 'img/misc/dibimbing-3.avif',         label: 'Bootcamp Cyber Security - dibimbing.id',       desc: 'Sertifikat Bootcamp Cyber Security dari Dibimbing.id.' },
    { img: 'img/misc/revou-4.avif',              label: 'Coding Camp Software Engineer – revoU',    desc: 'Sertifikat CodingCamp Software dari revoU.' },
    { img: 'img/misc/dibimbing-4.avif',         label: 'Bootcamp DevOps – dibimbing.id',           desc: 'Sertifikat Bootcamp DevOps dari Dibimbing.id.' },
    { img: 'img/misc/buildai.jpg',              label: 'IBM Build AI Agent – Hactiv8',              desc: 'Sertifikat Event Hactiv8 Build AI Agent dari IBM.' },
    { img: 'img/misc/DSML.jpg',                 label: 'Bootcamp DSML – dibimbing.id',              desc: 'Sertifikat Event Bootcamp DSML dari Dibimbing.id.' },
    { img: 'img/misc/panahan-2025-5.avif',      label: 'Archery Cakra Buana Championship 2025',     desc: 'Sertifikat Juara Panahan Cakra Buana Championship 2025 di Depok.' },
    { img: 'img/misc/panahan-2024-6.avif',      label: 'Archery Championship Pondok Pesantren Modern Sahid Bogor 2024',     desc: 'Sertifikat Juara Panahan Pondok Pesantren Modern Sahid Bogor 2024.' },
    { img: 'img/misc/panahan2023-7.avif',       label: 'Archery Championship De Poris Archery Competition 2023',     desc: 'Sertifikat Juara Panahan De Poris Archery Competition 2023 Piala Wakil Walikota Tangerang.' },
    { img: 'img/misc/taekwondo 2024-8.avif',    label: 'Taekwondo Championship Tangcity Cup 2024',                desc: 'Sertifikat Kejuaraan Taekwondo Championship Tangcity Cup 2024.' },
    { img: 'img/misc/taekwondo2016-9.avif',     label: 'Taekwondo Prabu Taekwondo Challenge 2016',                desc: 'Sertifikat Kejuaraan Prabu Taekwondo Challenge 2016.' },
    { img: 'img/misc/taekwondo 2016-10.avif',   label: 'Taekwondo Black Jaguar Taekwondo Competition 2016',              desc: 'Sertifikat Kejuaraan Black Jaguar Taekwondo Competition 2016.' },
    { img: 'img/misc/taekwondo 2015-11.avif',   label: 'Taekwondo Super Junior, Pra Junior & Junior tahun 2015',                desc: 'Sertifikat Kejuaraan Taekwondo Super Junior, Pra Junior & Junior tahun 2015.' },
    { img: 'img/misc/sertipenghargaan.jpg',     label: 'Penghargaan prestasi taekwondo',      desc: 'Sertifikat Penghargaan Taekwondo dari SMK PGRI 1 Tangerang. ' }
  ];

  const total = certs.length;
  let current = 0;

  const featuredImg   = document.getElementById('featuredImg');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredDesc  = document.getElementById('featuredDesc');
  const prevImg       = document.getElementById('prevImg');
  const prevLabel     = document.getElementById('prevLabel');
  const nextImg       = document.getElementById('nextImg');
  const nextLabel     = document.getElementById('nextLabel');
  const dotsWrap      = document.getElementById('certDots');
  const prevCard      = document.getElementById('certPrev');
  const nextCard      = document.getElementById('certNext');

  if (!featuredImg) return;

  // Build dots
  certs.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'cert-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Certificate ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    const prev = (current - 1 + total) % total;
    const next = (current + 1) % total;

    // Featured
    featuredImg.src        = certs[current].img;
    featuredImg.alt        = certs[current].label;
    featuredTitle.textContent = certs[current].label;
    featuredDesc.textContent  = certs[current].desc;

    // Side cards
    prevImg.src   = certs[prev].img;
    prevImg.alt   = certs[prev].label;
    prevLabel.textContent = certs[prev].label;

    nextImg.src   = certs[next].img;
    nextImg.alt   = certs[next].label;
    nextLabel.textContent = certs[next].label;

    // Dots
    dotsWrap.querySelectorAll('.cert-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  // Click side cards to navigate
  prevCard.addEventListener('click', () => goTo(current - 1));
  nextCard.addEventListener('click', () => goTo(current + 1));
  prevCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') goTo(current - 1); });
  nextCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') goTo(current + 1); });

  // Auto-advance every 4 seconds
  let autoTimer = setInterval(() => goTo(current + 1), 4000);

  // Pause on hover
  const showcase = document.querySelector('.cert-showcase');
  if (showcase) {
    showcase.addEventListener('mouseenter', () => clearInterval(autoTimer));
    showcase.addEventListener('mouseleave', () => { autoTimer = setInterval(() => goTo(current + 1), 4000); });
  }

  // Touch/swipe
  let touchStartX = 0;
  if (showcase) {
    showcase.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    showcase.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  }

  goTo(0);
})();

/* ── COUNTER ANIMATION ── */
function animateStats() {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        const target = +el.dataset.target;
        let count = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          count = Math.min(count + step, target);
          el.textContent = count;
          if (count >= target) clearInterval(timer);
        }, 40);
      });
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.about-stats');
  if (statsEl) statObserver.observe(statsEl);
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');

    const name    = document.getElementById('nameInput').value.trim();
    const email   = document.getElementById('emailInput').value.trim();
    const message = document.getElementById('msgInput').value.trim();

    btn.disabled = true;
    btnText.textContent = 'Sending…';

    emailjs.send('service_hvtmd24', 'template_rydp809', {
      from_name:    name,
      from_email:   email,
      message:      message,
      reply_to:     email,
    })
    .then(() => {
      showToast('✅ Message sent successfully!');
      contactForm.reset();
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      showToast('❌ Failed to send. Please try again.');
    })
    .finally(() => {
      btn.disabled = false;
      btnText.textContent = 'Send Message';
    });
  });
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── BACK TO TOP ── */
if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── SMOOTH SCROLL untuk semua anchor link (termasuk orbit-nav) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── PARALLAX on hero shapes ── */
  document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelectorAll('.shape').forEach((s, i) => {
    const factor = (i + 1) * 0.4;
    s.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

/* ── THEME TOGGLE ── */
(function () {
  function syncIcons(theme) {
    document.querySelectorAll('.theme-toggle-btn, .floating-theme-toggle').forEach(btn => {
      const sun  = btn.querySelector('.sun-icon');
      const moon = btn.querySelector('.moon-icon');
      if (!sun || !moon) return;
      if (theme === 'light') {
        sun.style.display  = 'block';
        moon.style.display = 'none';
      } else {
        sun.style.display  = 'none';
        moon.style.display = 'block';
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncIcons(next);
  }

  // Attach click to all theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn, .floating-theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Sync icons on page load
  const saved = localStorage.getItem('theme') || 'dark';
  syncIcons(saved);
})();

/* ── ABOUT FLIP CARD – CLICK TOGGLE ── */
(function () {
  const flipCard = document.querySelector('.about-flip-card');
  if (!flipCard) return;

  // Click selalu toggle .flipped — CSS :hover tetap bekerja di desktop
  // Di mobile (max-width: 900px), hover dinonaktifkan via CSS, .flipped yang aktif
  flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('flipped');
  });
})();
