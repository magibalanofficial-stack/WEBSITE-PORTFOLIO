/* =============================================
   FUTURISTIC PORTFOLIO — SCRIPT.JS
   ============================================= */

'use strict';

/* ===== PARTICLE SYSTEM ===== */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let mouse = { x: W / 2, y: H / 2 };

  const PARTICLE_COUNT = 90;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -Math.random() * 0.5 - 0.1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0, 245, 255' : '123, 47, 255';
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.01 + Math.random() * 0.02;
    }

    update() {
      this.pulse += this.pulseSpeed;
      this.x += this.speedX + (mouse.x / W - 0.5) * 0.05;
      this.y += this.speedY;
      this.opacity = (0.15 + Math.sin(this.pulse) * 0.1);
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Grid lines
  function drawGrid() {
    const spacing = 80;
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.025)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // Init particles
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
})();


/* ===== NAVBAR SCROLL EFFECT ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === current) link.classList.add('active');
    });
  });
})();


/* ===== HAMBURGER MENU ===== */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');

  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();


/* ===== TYPED TEXT EFFECT ===== */
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Data Scientist',
    'ML Engineer',
    'AI Enthusiast',
    'Problem Solver',
    'Python Developer',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPausing = false;

  function type() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = current.slice(0, charIndex--);
    } else {
      el.textContent = current.slice(0, charIndex++);
    }

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIndex > current.length) {
      if (isPausing) return;
      isPausing = true;
      setTimeout(() => {
        isDeleting = true;
        isPausing = false;
        type();
      }, 1800);
      return;
    }

    if (isDeleting && charIndex < 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
})();


/* ===== COUNTER ANIMATION ===== */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  let triggered = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(interval);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 16);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        animateCounters();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);
})();


/* ===== SCROLL REVEAL ===== */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ===== SKILL BAR ANIMATION ===== */
(function initSkillBars() {
  function animateBars(panel) {
    panel.querySelectorAll('.skill-fill').forEach(bar => {
      setTimeout(() => bar.classList.add('animated'), 100);
    });
  }

  // Animate visible panel on load
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateBars(activePanel);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(activePanel);
  }

  // Skill tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const panelId = 'panel-' + btn.dataset.tab;
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.classList.add('active');
        // Reset bars and animate
        panel.querySelectorAll('.skill-fill').forEach(bar => bar.classList.remove('animated'));
        setTimeout(() => animateBars(panel), 50);
      }
    });
  });
})();


/* ===== CONTACT FORM ===== */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) return;

    // Simulate sending
    const btnContent = submitBtn.querySelector('.btn-content');
    btnContent.textContent = 'TRANSMITTING...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      btnContent.textContent = 'TRANSMIT MESSAGE';

      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 4000);
      }
    }, 1600);
  });
})();


/* ===== SMOOTH SCROLL for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


/* ===== CURSOR GLOW TRAIL (desktop only) ===== */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Skip touch devices

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(0,245,255,0.04), transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();


/* ===== TILT EFFECT ON CARDS ===== */
(function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-4px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ===== BOOT SEQUENCE EASTER EGG ===== */
(function bootConsole() {
  const lines = [
    '%c[MAGI SYSTEM] Booting portfolio v2.0...',
    '%c[OK] Particle engine initialized',
    '%c[OK] Neural networks loaded',
    '%c[OK] Data pipelines connected',
    '%c[OK] All systems operational — Welcome! 🚀',
  ];
  const styles = [
    'color: #00f5ff; font-family: monospace; font-size: 12px;',
    'color: #7b2fff; font-family: monospace; font-size: 11px;',
    'color: #7b2fff; font-family: monospace; font-size: 11px;',
    'color: #7b2fff; font-family: monospace; font-size: 11px;',
    'color: #00f5ff; font-family: monospace; font-size: 12px; font-weight: bold;',
  ];

  lines.forEach((line, i) => {
    setTimeout(() => console.log(line, styles[i]), i * 300);
  });
})();
