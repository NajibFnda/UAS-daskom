(() => {
  'use strict';

  const GUESTBOOK_KEY = 'mancingking_guestbook_v1';

  function getCurrentPage() {
    const raw = window.location.pathname.split('/').pop();
    return raw && raw.length > 0 ? raw.toLowerCase() : 'index.html';
  }

  function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('primary-menu');
    const currentPage = getCurrentPage();

    // Highlight active nav links, sidebar links, and gallery tabs
    document.querySelectorAll('.navbar-nav a[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href === currentPage) {
        link.classList.add('active');
        const parentDropdown = link.closest('.nav-item.has-dropdown');
        if (parentDropdown) {
          parentDropdown.classList.add('is-active');
        }
      }
    });

    document.querySelectorAll('.sidebar-list a[href], .gallery-tab[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').trim().toLowerCase();
      if (href === currentPage) {
        link.classList.add('active');
      }
    });

    if (!toggle || !menu) return;

    const closeMenu = () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      menu.querySelectorAll('.has-dropdown.is-open').forEach((item) => {
        item.classList.remove('is-open');
        const btn = item.querySelector('.dropdown-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    };

    toggle.addEventListener('click', () => {
      const willOpen = !menu.classList.contains('is-open');
      toggle.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      menu.classList.toggle('is-open', willOpen);
    });

    // Mobile accordion dropdown behavior
    menu.querySelectorAll('.has-dropdown > .dropdown-toggle').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          const item = trigger.closest('.has-dropdown');
          const willOpen = !item.classList.contains('is-open');
          menu.querySelectorAll('.has-dropdown.is-open').forEach((other) => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherBtn = other.querySelector('.dropdown-toggle');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });
          item.classList.toggle('is-open', willOpen);
          trigger.setAttribute('aria-expanded', String(willOpen));
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
  }

  function initScrollTop() {
    const btnUp = document.getElementById('btn-up');
    if (!btnUp) return;

    const updateVisibility = () => {
      btnUp.classList.toggle('is-visible', window.scrollY > 220);
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    btnUp.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const track = slider.querySelector('.slides');
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dots = Array.from(slider.querySelectorAll('.slider-dot'));
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let timerId = null;

    const goTo = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => {
        const active = i === currentIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });
    };

    const startAutoplay = () => {
      stopAutoplay();
      timerId = window.setInterval(() => goTo(currentIndex + 1), 5500);
    };

    const stopAutoplay = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goTo(currentIndex - 1);
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goTo(currentIndex + 1);
        startAutoplay();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startAutoplay();
      });
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    goTo(0);
    startAutoplay();
  }

  function formatDateID(isoDate) {
    if (!isoDate) return '-';
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function initDestinationPlanner() {
    const form = document.getElementById('destination-form');
    const resultBox = document.getElementById('plan-result');
    if (!form || !resultBox) return;

    const locationInput = document.getElementById('location');
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = (locationInput?.value || '').trim();
      const start = startInput?.value || '';
      const end = endInput?.value || '';

      resultBox.innerHTML = '';
      resultBox.classList.remove('is-error');

      if (!location) {
        resultBox.classList.add('is-visible', 'is-error');
        const msg = document.createElement('p');
        msg.textContent = 'Silakan masukkan lokasi tujuan memancing terlebih dahulu.';
        resultBox.appendChild(msg);
        locationInput?.focus();
        return;
      }

      if (!start || !end || end < start) {
        resultBox.classList.add('is-visible', 'is-error');
        const msg = document.createElement('p');
        msg.textContent = 'Tanggal selesai harus sama atau setelah tanggal mulai.';
        resultBox.appendChild(msg);
        endInput?.focus();
        return;
      }

      const msDiff = new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`);
      const days = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)) + 1);

      const textWrap = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `Rencana tersimpan: ${location}`;
      textWrap.appendChild(strong);
      textWrap.appendChild(
        document.createTextNode(
          ` — ${formatDateID(start)} s.d. ${formatDateID(end)} (${days} hari). Pastikan perlengkapan joran, kail, dan umpan sudah siap!`
        )
      );

      const actionLink = document.createElement('a');
      actionLink.href = 'artikel-ulasan.html';
      actionLink.className = 'btn btn-primary';
      actionLink.textContent = 'Lihat Rekomendasi Spot';

      resultBox.appendChild(textWrap);
      resultBox.appendChild(actionLink);
      resultBox.classList.add('is-visible');
    });
  }

  function initArticleFilters() {
    const filterBar = document.querySelector('.filter-pills');
    const cards = Array.from(document.querySelectorAll('.articles-grid .artikel-card[data-category]'));
    if (!filterBar || cards.length === 0) return;

    const buttons = Array.from(filterBar.querySelectorAll('.filter-pill'));
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.filter || 'all';
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        cards.forEach((card) => {
          const match = selected === 'all' || card.dataset.category === selected;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  function readGuestbookEntries() {
    try {
      const raw = window.localStorage.getItem(GUESTBOOK_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeGuestbookEntries(entries) {
    try {
      window.localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage quota / private mode failures gracefully
    }
  }

  function formatTimestampNow() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function initGuestbookPage() {
    const container = document.getElementById('guestbook-entries');
    const countBadge = document.getElementById('guestbook-count');
    if (!container) return;

    const saved = readGuestbookEntries();
    // Render saved comments newest-first before static sample entries
    saved.slice().reverse().forEach((item) => {
      const article = document.createElement('article');
      article.className = 'entry';

      const img = document.createElement('img');
      img.src = 'pict/foto-profil.jpg';
      img.alt = `Foto profil ${item.name || 'Pengunjung'}`;
      img.className = 'entry-avatar';

      const body = document.createElement('div');
      body.className = 'entry-body';

      const head = document.createElement('div');
      head.className = 'entry-head';

      const h3 = document.createElement('h3');
      h3.textContent = item.name || 'Pengunjung';

      const time = document.createElement('span');
      time.className = 'timestamp';
      time.textContent = `Diposting pada: ${item.timestamp || ''}`;

      const msg = document.createElement('p');
      msg.textContent = item.message || '';

      head.appendChild(h3);
      head.appendChild(time);
      body.appendChild(head);
      body.appendChild(msg);
      article.appendChild(img);
      article.appendChild(body);
      container.prepend(article);
    });

    if (countBadge) {
      const total = container.querySelectorAll('.entry').length;
      countBadge.textContent = `${total} Komentar`;
    }
  }

  function initForms() {
    const guestForm = document.getElementById('guestbook-form');
    if (guestForm) {
      const feedback = document.getElementById('guestbook-feedback');
      guestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = (document.getElementById('nama')?.value || '').trim();
        const pesan = (document.getElementById('pesan')?.value || '').trim();
        if (!nama || !pesan) return;

        const entries = readGuestbookEntries();
        entries.push({
          name: nama,
          message: pesan,
          timestamp: formatTimestampNow(),
        });
        writeGuestbookEntries(entries);
        guestForm.reset();

        if (feedback) {
          feedback.classList.add('is-visible');
        }
      });
    }

    const simpleForms = [
      { id: 'kritik-form', feedbackId: 'kritik-feedback' },
      { id: 'lapor-form', feedbackId: 'lapor-feedback' },
      { id: 'kontak-form', feedbackId: 'kontak-feedback' },
    ];

    simpleForms.forEach(({ id, feedbackId }) => {
      const form = document.getElementById(id);
      const feedback = document.getElementById(feedbackId);
      if (!form || !feedback) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.reset();
        feedback.classList.add('is-visible');
      });
    });
  }

  function initGalleryLightbox() {
    const items = Array.from(document.querySelectorAll('.gallery-item.is-photo'));
    if (items.length === 0) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Pratinjau foto');
    lightbox.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Tutup pratinjau">&times;</button>
      <button type="button" class="lightbox-nav prev" aria-label="Foto sebelumnya">&#10094;</button>
      <div class="lightbox-content">
        <img class="lightbox-img" src="" alt="">
        <p class="lightbox-caption"></p>
      </div>
      <button type="button" class="lightbox-nav next" aria-label="Foto berikutnya">&#10095;</button>
    `;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector('.lightbox-img');
    const captionEl = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');

    let currentIdx = 0;

    const showItem = (idx) => {
      currentIdx = (idx + items.length) % items.length;
      const targetImg = items[currentIdx].querySelector('img');
      const targetCaption = items[currentIdx].querySelector('.gallery-caption');
      if (!targetImg) return;
      imgEl.src = targetImg.src;
      imgEl.alt = targetImg.alt || '';
      captionEl.textContent = targetCaption ? targetCaption.textContent : targetImg.alt || '';
    };

    const openLightbox = (idx) => {
      showItem(idx);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    items.forEach((item, idx) => {
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => openLightbox(idx));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showItem(currentIdx - 1));
    nextBtn.addEventListener('click', () => showItem(currentIdx + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showItem(currentIdx - 1);
      if (e.key === 'ArrowRight') showItem(currentIdx + 1);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollTop();
    initHeroSlider();
    initDestinationPlanner();
    initArticleFilters();
    initGuestbookPage();
    initForms();
    initGalleryLightbox();
  });
})();
