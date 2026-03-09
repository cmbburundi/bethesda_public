/* ============================================================
   Centre Médical Bethesda — Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Sticky nav shadow on scroll ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. Mobile hamburger toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('is-active', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ── 3. Mobile services submenu toggle ── */
  const mobileServicesToggle = document.querySelector('.mobile-services-toggle');
  const mobileServicesSubmenu = document.querySelector('.mobile-services-submenu');
  if (mobileServicesToggle && mobileServicesSubmenu) {
    mobileServicesToggle.addEventListener('click', () => {
      const isOpen = mobileServicesSubmenu.classList.toggle('open');
      mobileServicesToggle.classList.toggle('active', isOpen);
    });
  }

  /* ── 4. Desktop dropdown: close on outside click ── */
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  /* ── 5. Active nav link highlight via IntersectionObserver ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link[href]');
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const matches = href === '#' + entry.target.id ||
              href.endsWith('/' + entry.target.id);
            link.classList.toggle('active', matches);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => observer.observe(s));
  }

  /* ── 6. FAQ Accordion ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── 7. Contact / Appointment form ── */
  const form = document.querySelector('.contact-form');
  if (form) {
    const note = form.querySelector('.form-note');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameField = form.querySelector('[name="nom"]');
      const phoneField = form.querySelector('[name="telephone"]');

      if (nameField && !nameField.value.trim()) {
        if (note) {
          note.textContent = 'Veuillez entrer votre nom complet.';
          note.style.color = '#E8896A';
        }
        nameField.focus();
        return;
      }

      if (note) {
        note.textContent = '✓ Merci ! Notre équipe vous contactera très bientôt.';
        note.style.color = '#F4C84A';
      }
      form.reset();
    });
  }

  /* ── 8. Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#nav' || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 8 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 9. Add current-page active class to nav links ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav .nav-link, .footer-links a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href && href === currentPath) {
      link.classList.add('active');
    }
  });

  /* ── 10. Mobile Footer Accordion (AWS-style) ── */
  document.querySelectorAll('.footer-col h4').forEach(h4 => {
    h4.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const col = h4.parentElement;
        const isOpen = col.classList.contains('open');

        // Close others
        document.querySelectorAll('.footer-col.open').forEach(d => {
          if (d !== col) d.classList.remove('open');
        });

        col.classList.toggle('open', !isOpen);
      }
    });
  });

  /* ── 11. Hero subtitle typewriter animation ── */
  const twEl = document.getElementById('hero-typewriter');
  if (twEl) {
    const fullText = twEl.dataset.text || twEl.textContent.trim();
    twEl.textContent = '';
    twEl.classList.add('typing');
    let i = 0;
    const speed = 26; // ms per character
    const startDelay = 550; // wait for page render

    const tick = () => {
      if (i < fullText.length) {
        twEl.textContent += fullText[i++];
        setTimeout(tick, speed);
      } else {
        // Remove cursor after a short pause
        setTimeout(() => twEl.classList.remove('typing'), 900);
      }
    };
    setTimeout(tick, startDelay);
  }

  /* ── 12. Campaign checklist animated entry ── */
  const checkItems = document.querySelectorAll('.campaign-services-list li');
  if (checkItems.length) {
    const checkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          checkObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    checkItems.forEach(item => checkObserver.observe(item));
  }

});
