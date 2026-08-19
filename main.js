/**
 * PALMETTO COUNSELING & WELLNESS — Main JavaScript
 * Handles: Navigation, Scroll Animations, Palmetto Reveal, FAQ Accordion, Contact Form
 */

'use strict';

/* =========================================================
   UTILITIES
   ========================================================= */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* =========================================================
   NAVIGATION — Scroll behavior & Mobile Toggle
   ========================================================= */
(function initNav() {
  const nav        = $('site-nav');
  const toggle     = $('nav-toggle');
  const mobileMenu = $('mobile-menu');
  const mobileLinks = $$('.mobile-link');
  let menuOpen = false;

  // Scroll: add .scrolled class when page is scrolled
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // Mobile menu toggle
  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
})();


/* =========================================================
   BACK TO TOP
   ========================================================= */
(function initBackToTop() {
  const backToTop = $('back-to-top');
  if (!backToTop) return;

  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop(); // run on load

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* =========================================================
   SCROLL ANIMATIONS
   ========================================================= */
(function initScrollAnimations() {
  document.documentElement.classList.add('js-ready');

  const animatedEls = Array.from($$('.fade-up, .fade-in'));
  if (!animatedEls.length) return;

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight - 20 && rect.bottom > 0;
  }

  function revealEl(el) {
    if (!el.classList.contains('visible')) {
      el.classList.add('visible');
    }
  }

  // On-screen elements: stagger reveal via JS setTimeout
  // Wait 300ms first so the page is visibly blank, making the animation obvious
  let staggerDelay = 300;
  animatedEls.forEach(el => {
    if (isInViewport(el)) {
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : staggerDelay;
      setTimeout(() => revealEl(el), staggerDelay);
      staggerDelay += 120;
    }
  });

  // Scroll: reveal off-screen elements as they enter the viewport
  function checkAll() {
    animatedEls.forEach(el => {
      if (!el.classList.contains('visible') && isInViewport(el)) {
        revealEl(el);
      }
    });
  }

  window.addEventListener('scroll', checkAll, { passive: true });

  // Polling fallback — catches anything the scroll listener misses
  let polls = 0;
  const poll = setInterval(() => {
    checkAll();
    if (++polls >= 40) clearInterval(poll);
  }, 150);
})();


/* =========================================================
   PALMETTO SCROLL REVEAL — "Feel Seen" Section (Side Reveal)
   ========================================================= */
(function initFeelSeenPalmetto() {
  const wrap = $('palmetto-hero-reveal');
  if (!wrap) return;

  const blades = wrap.querySelectorAll('.scroll-blade');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        wrap.classList.add('revealed');
        
        const sunburst = wrap.querySelector('#hero-sunburst-wrap');
        const arc = wrap.querySelector('#hero-palmetto-arc');
        
        // 1. Draw arc
        if (arc) arc.style.strokeDashoffset = '0';

        // 2. Grow sunburst
        if (sunburst) {
          sunburst.style.transform = 'scale(1)';
        }
        
        observer.unobserve(wrap);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(wrap);
})();



/* =========================================================
   FAQ ACCORDION
   ========================================================= */
(function initFAQ() {
  const items = $$('.faq-item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-q');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();


/* =========================================================
   CONTACT FORM — Client-side handling
   ========================================================= */
(function initContactForm() {
  const form    = $('contact-form');
  const success = $('form-success');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Simple validation
    const firstName = $('form-first-name').value.trim();
    const email     = $('form-email').value.trim();
    const message   = $('form-message').value.trim();

    if (!firstName) {
      shakeInput($('form-first-name'));
      $('form-first-name').focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      shakeInput($('form-email'));
      $('form-email').focus();
      return;
    }

    if (!message) {
      shakeInput($('form-message'));
      $('form-message').focus();
      return;
    }

    // Submit to Formspree
    const submitBtn = $('contact-submit-btn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // IMPORTANT: Replace the URL below with your actual Formspree endpoint URL
    const formspreeUrl = 'https://formspree.io/f/mjybpjob';

    fetch(formspreeUrl, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Show success state
        form.style.display = 'none';
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert('Oops! There was a problem submitting your form.');
        submitBtn.textContent = 'Send Message →';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    })
    .catch(error => {
      alert('Oops! There was a problem submitting your form.');
      submitBtn.textContent = 'Send Message →';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeInput(el) {
    el.style.borderColor = '#c0392b';
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      el.style.animation = '';
      el.style.borderColor = '';
    }, 600);
  }

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();


/* =========================================================
   SPA ROUTER
   ========================================================= */
(function initSPARouter() {
  const routes = {
    '/': ['hero', 'feel-seen', 'logistics', 'cta-banner'],
    '/about': ['about', 'palmetto-reveal-section'], 
    '/services': ['services', 'ideal-client'],
    '/approach': ['approach', 'methods'],
    '/getting-started': ['process'],
    '/contact': ['contact']
  };

  const navLinks = $$('.nav-links a, .mobile-menu a, .nav-logo');
  const allSections = $$('section');
  const siteFooter = $('site-footer');

  function handleRoute() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === '/') hash = '/';
    
    // Fallback if they visit a raw anchor (e.g. #services instead of #/services)
    if (hash === 'services') hash = '/services';
    if (hash === 'about') hash = '/about';
    if (hash === 'approach') hash = '/approach';
    if (hash === 'getting-started' || hash === 'process') hash = '/getting-started';
    if (hash === 'contact') hash = '/contact';

    // Get sections to show, default to Home
    const sectionsToShow = routes[hash] || routes['/'];

    // Hide all sections first
    allSections.forEach(sec => {
      sec.classList.add('spa-hidden');
    });

    // Reveal active sections
    sectionsToShow.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('spa-hidden');
    });

    // Handle Active Nav State
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + hash) {
        link.style.color = 'var(--forest)';
      } else {
        link.style.color = '';
      }
    });

    // Handle Dynamic Title for SEO/UX
    const baseTitle = "Palmetto Counseling & Wellness";
    if (hash === '/') {
      document.title = `${baseTitle} | Online Therapy in Florida`;
    } else if (hash === '/services') {
      document.title = `Services | ${baseTitle}`;
    } else if (hash === '/about') {
      document.title = `About Kyle | ${baseTitle}`;
    } else if (hash === '/approach') {
      document.title = `My Approach | ${baseTitle}`;
    } else if (hash === '/getting-started') {
      document.title = `Getting Started | ${baseTitle}`;
    } else if (hash === '/contact') {
      document.title = `Contact | ${baseTitle}`;
    }

    // Handle Scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger scroll animations for new sections
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 50);
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 300);
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);
  
  // Run on initial load
  handleRoute();
})();


/* =========================================================
   PARALLAX EFFECT — Hero section subtle depth
   ========================================================= */
(function initParallax() {
  const heroBg = document.querySelector('.hero-palmetto-bg');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
  }, { passive: true });
})();


/* =========================================================
   SERVICE CARDS — Subtle hover ripple
   ========================================================= */
(function initCardRipple() {
  const cards = $$('.service-card, .ideal-card, .logistic-card');

  cards.forEach(card => {
    card.addEventListener('mouseenter', function(e) {
      this.style.willChange = 'transform';
    });
    card.addEventListener('mouseleave', function() {
      this.style.willChange = '';
    });
  });
})();

/* =========================================================
   INIT COMPLETE
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌴 Palmetto Counseling & Wellness — Site initialized');
});
