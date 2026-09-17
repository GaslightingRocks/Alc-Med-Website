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

  // Event-Delegation statt Einzel-Listener: funktioniert auch für
  // .youtube-link-Elemente, die erst später dynamisch eingefügt werden
  // (z.B. auf referenzen.html über renderReferenzen()).
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.youtube-link');
    if (!link) return;
    e.preventDefault();

    currentVideoId = link.getAttribute('data-youtube');
    const caption = link.getAttribute('data-caption') || '';

    youtubeCaption.textContent = caption;
    youtubeModal.style.display = 'flex';
    consentBox.style.display = 'flex';
    youtubeIframe.src = '';
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

  // Event-Delegation: greift auch für Kacheln, die referenzen.html
  // erst nach dem Laden per JS in die Seite rendert.
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item-wrapper.image-item');
    if (!item) return;

    const raw = item.dataset.gallery;
    if (raw) {
      try {
        openLightbox(JSON.parse(raw), 0);
      } catch (err) {
        console.error('Ungültiges JSON in data-gallery:', err);
      }
    } else {
      const img = item.querySelector('img');
      openLightbox([{ src: img.src, caption: item.dataset.caption || '' }], 0);
    }
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


  /* ── 6. Referenzen-Seite: Projekte aus Datenliste rendern ─
     Jedes neue Projekt = ein neues Objekt hier eintragen.
     Kein HTML anfassen nötig. Drei Typen möglich:

     - "video"   → YouTube-Vorschau, öffnet das YouTube-Modal
     - "image"   → einzelnes Bild, öffnet die Lightbox (ohne Unterschrift)
     - "gallery" → mehrere Bilder, öffnet die Lightbox mit Pfeil-Navigation
  ───────────────────────────────────────────────────────── */

  const projectData = [
    { type: 'video',   thumb: './KBF Jerus.webp',    youtube: '0O08ParzMEc?si=DoXPtKa6760mO6k_', caption: 'Bei AP-Film an der gesamten Produktion mitgewirkt' },
    { type: 'video',   thumb: './KK RL.webp',        youtube: 'JMG1xBxL0fE?si=UpP2_S_4k72Jt41C',  caption: 'Bei AP-Film an der gesamten Produktion mitgewirkt' },
    { type: 'video',   thumb: './911MilThum.png',    youtube: 'L6qSjLmOwjU?si=tO8hRNcLg51GVo6A',  caption: 'Bei AP-Film in der Postproduktion mitgewirkt' },
    { type: 'gallery', thumb: './WeddingThumb.webp', images: ['./Wedding8.webp', './Wedding.webp', './Wedding3.webp', './Wedding4.webp', './Wedding2.webp', './Wedding7.webp', './Wedding5.webp'] },
    { type: 'image',   thumb: './Tripsdrill.jpg' },
    { type: 'gallery', thumb: './Lak.webp',          images: ['./1.jpg', './2.jpg', './3.jpg', './5.jpg', './6.jpg', './LakÖl.png'] },
    { type: 'image',   thumb: './Tübi.jpg' },
    // ↓ neues Projekt einfach hier als weiteres Objekt anhängen, z.B.:
    // { type: 'image', thumb: './NeuesProjekt.jpg' },
  ];

  function renderReferenzen() {
    const grid = document.getElementById('referenzen-grid');
    if (!grid) return; // Funktion tut nichts, wenn es die Seite/das Grid gar nicht gibt

    projectData.forEach(project => {
      const wrapper = document.createElement('div');
    // Kein ".animation"-Klasse hier: Auf referenzen.html soll die
      // Scroll-Einblend-Animation nicht laufen, nur auf der Startseite.
      wrapper.className = 'gallery-item-wrapper';

      if (project.type === 'video') {
        wrapper.classList.add('video-item', 'youtube-link');
        wrapper.setAttribute('data-youtube', project.youtube);
        if (project.caption) wrapper.setAttribute('data-caption', project.caption);
        wrapper.innerHTML = `
          <img src="${project.thumb}" alt="">
          <div class="play-icon"></div>
        `;
      } else if (project.type === 'gallery') {
        wrapper.classList.add('image-item');
        const galleryData = project.images.map(src => ({ src }));
        wrapper.setAttribute('data-gallery', JSON.stringify(galleryData));
        wrapper.innerHTML = `<img src="${project.thumb}" alt="">`;
      } else {
        wrapper.classList.add('image-item');
        wrapper.innerHTML = `<img src="${project.thumb}" alt="">`;
      }

      grid.appendChild(wrapper);
    });
  }

  renderReferenzen();

});