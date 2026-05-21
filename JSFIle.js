/* =============================================================
   main.js – Alcedo Media
   Struktur:
   1.  Galerie-Video: Hover Play/Pause
   2.  YouTube-Modal: Öffnen & Schließen
   3.  Bild-Lightbox: Öffnen & Schließen
   4.  Kontaktformular
   5.  Hamburger-Menü: Toggle
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Galerie-Video Hover ───────────────────────────── */

  document.querySelectorAll('.gallery-item-wrapper').forEach(wrapper => {
    const video = wrapper.querySelector('video');
    if (!video) return;

    wrapper.addEventListener('mouseenter', () => video.play());
    wrapper.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });


  /* ── 2. YouTube Modal ─────────────────────────────────── */

  const youtubeModal   = document.getElementById('youtube-modal');
  const youtubeIframe  = document.getElementById('youtube-iframe');
  const youtubeClose   = document.querySelector('.close-btn');
  const consentBox     = document.getElementById('youtube-consent');
  const consentBtn     = document.getElementById('youtube-consent-btn');
  const youtubeCaption = document.getElementById('youtube-caption');

  let currentVideoId = null;

  document.querySelectorAll('.youtube-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      currentVideoId = link.getAttribute('data-youtube');
      const caption = link.getAttribute('data-caption') || '';

      youtubeCaption.textContent = caption;
      youtubeModal.style.display = 'flex';
      consentBox.style.display = 'flex';
      youtubeIframe.src = '';
    });
  });

  consentBtn.addEventListener('click', () => {
    youtubeIframe.src =
      `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1`;
    consentBox.style.display = 'none';
  });

  const closeYoutubeModal = () => {
    youtubeModal.style.display = 'none';
    youtubeIframe.src = '';
    consentBox.style.display = 'flex';
    youtubeCaption.textContent = '';
  };

  youtubeClose.addEventListener('click', closeYoutubeModal);

  youtubeModal.addEventListener('click', (e) => {
    if (e.target === youtubeModal) closeYoutubeModal();
  });


  /* ── 3. Bild-Lightbox ─────────────────────────────────── */

  let lbImages = [];
  let lbIndex  = 0;

  function openLightbox(images, startIndex) {
    lbImages = images;
    lbIndex  = startIndex;
    renderLightbox();
    document.getElementById('image-lightbox').classList.add('active');
  }

  function renderLightbox() {
    const item = lbImages[lbIndex];
    document.getElementById('lightbox-img').src = item.src;
    document.getElementById('lightbox-caption').textContent = item.caption || '';

    const nav = document.getElementById('lightbox-nav');
    if (lbImages.length > 1) {
      nav.style.display = 'flex';
      document.getElementById('lb-counter').textContent =
        (lbIndex + 1) + ' / ' + lbImages.length;
    } else {
      nav.style.display = 'none';
    }
  }

  document.querySelectorAll('.gallery-item-wrapper.image-item').forEach(item => {
    item.addEventListener('click', () => {
      const raw = item.dataset.gallery;
      if (raw) {
        try {
          openLightbox(JSON.parse(raw), 0);
        } catch (e) {
          console.error('Ungültiges JSON in data-gallery:', e);
        }
      } else {
        const img = item.querySelector('img');
        openLightbox([{ src: img.src, caption: item.dataset.caption || '' }], 0);
      }
    });
  });

  document.getElementById('lb-prev').addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    renderLightbox();
  });

  document.getElementById('lb-next').addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbImages.length;
    renderLightbox();
  });

  document.querySelector('.lightbox-close').addEventListener('click', () => {
    document.getElementById('image-lightbox').classList.remove('active');
  });

  document.getElementById('image-lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('image-lightbox')) {
      document.getElementById('image-lightbox').classList.remove('active');
    }
  });


  /* ── 4. Kontaktformular ───────────────────────────────── */

  const form = document.getElementById('kontaktform');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const response = await fetch('https://formspree.io/f/xvzvwjoo', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        alert('✅ Nachricht gesendet! Ich melde mich so bald wie möglich.');
      } else {
        alert('❌ Fehler beim Senden.');
      }
    });
  }


  /* ── 5. Hamburger-Menü ────────────────────────────────── */

  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

});