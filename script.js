(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---- Scroll Reveal (IntersectionObserver) ----
  function initReveal() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ---- Active Nav Highlight on Scroll ----
  function initScrollSpy() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    if (!sections.length || !navLinks.length) return;

    function onScroll() {
      const scrollPos = window.scrollY + 200;

      let currentSection = '';

      // Check if user scrolled to the bottom of the page
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);

      if (isAtBottom) {
        // If at the bottom, activate the last section
        currentSection = sections[sections.length - 1].getAttribute('id');
      } else {
        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = sectionId;
          }
        });
      }

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === currentSection) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    const hamburger = $('#hamburger-btn');
    const mobileNav = $('#mobile-nav');
    const overlay = $('#mobile-nav-overlay');
    const mobileLinks = $$('.mobile-nav-link');

    if (!hamburger || !mobileNav || !overlay) return;

    function toggleMenu(open) {
      const isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('active');

      hamburger.classList.toggle('active', isOpen);
      mobileNav.classList.toggle('active', isOpen);
      overlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => toggleMenu());
    overlay.addEventListener('click', () => toggleMenu(false));

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        toggleMenu(false);
      }
    });
  }

  // ---- Smooth Scroll for anchor links ----
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = $(targetId);
        if (!target) return;

        e.preventDefault();

        const offset = window.innerWidth <= 768 ? 80 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      });
    });
  }

  // ---- Export CV (print) ----
  window.exportCV = function (e) {
    if (e) e.preventDefault();

    // Force all reveal & timeline items visible before print
    $$('.reveal, .timeline__item, .project-card, .project-featured').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('visible');
    });

    // Small delay to let browser repaint, then print
    setTimeout(function () {
      window.print();
    }, 100);
  };

  // ---- Mobile header scroll hide/show ----
  function initHeaderScroll() {
    const header = $('#mobile-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener(
      'scroll',
      () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        header.style.transition = 'transform 0.3s ease';
        lastScroll = currentScroll;
      },
      { passive: true }
    );
  }

  // ---- Pointer glow effect that follows mouse on left panel ----
  function initPointerGlow() {
    const leftPanel = $('#left-panel');
    if (!leftPanel || window.innerWidth <= 768) return;

    // Create glow element
    const glow = document.createElement('div');
    glow.id = 'pointer-glow';
    glow.className = 'pointer-glow';
    glow.style.cssText = `
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(100, 255, 218, 0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transition: transform 0.15s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  // ---- Timeline items fade in stagger ----
  function initTimelineReveal() {
    const items = $$('.timeline__item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, i * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(item);
    });
  }

  // ---- Initialize ----
  function init() {
    initReveal();
    initScrollSpy();
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initPointerGlow();
    initTimelineReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
