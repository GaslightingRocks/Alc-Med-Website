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
  /* ── 0. Bilder-Schutz ─────────────────────────────────── */

  // Rechtsklick-Menü nur auf Bildern/Videos/Galerie unterbinden
  // (der Rest der Seite behält sein normales Kontextmenü).
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('img, video, .gallery-item-wrapper, .lightbox-content, .about-img-wrapper, .gallery-logo')) {
      e.preventDefault();
    }
  });

  // Bilder nicht per Drag & Drop auf den Desktop ziehen lassen
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
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


  /* ── Hilfsfunktionen: Overlays mit Animation schließen ────
     Fügt kurz die Klasse ".closing" hinzu (spielt die Ausblend-
     Animation aus 08-modal-lightbox.css ab) und versteckt das
     Overlay erst danach wirklich.
     CLOSE_DURATION muss zur Animationsdauer im CSS passen.
  ───────────────────────────────────────────────────────── */

  const CLOSE_DURATION =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
  const closeTimers = new WeakMap();

  function animateClose(el, onHidden) {
    if (el.classList.contains('closing')) return; // läuft schon
    el.classList.add('closing');
    const timer = setTimeout(() => {
      el.classList.remove('closing');
      closeTimers.delete(el);
      onHidden();
    }, CLOSE_DURATION);
    closeTimers.set(el, timer);
  }

  // Falls während des Ausblendens sofort wieder geöffnet wird
  function cancelClose(el) {
    clearTimeout(closeTimers.get(el));
    closeTimers.delete(el);
    el.classList.remove('closing');
  }

// Wandelt URLs (http/https) im Text automatisch in klickbare Links um
  function renderCaptionWithLinks(element, text) {
    element.textContent = '';
    if (!text) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    parts.forEach(part => {
      if (urlRegex.test(part)) {
        const link = document.createElement('a');
        link.href = part;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'DICKMANN LEDER'; // Alternativ z.B. 'Zur Website' schreiben
        element.appendChild(link);
      } else {
        element.appendChild(document.createTextNode(part));
      }
    });
  }


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

    cancelClose(youtubeModal);
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
    youtubeIframe.src = ''; // Video sofort stoppen (Ton!)
    animateClose(youtubeModal, () => {
      // Erst nach dem Ausblenden zurücksetzen, damit das Panel
      // während der Animation nicht springt/leer wird
      youtubeModal.style.display = 'none';
      consentBox.style.display = 'flex';
      youtubeCaption.textContent = '';
    });
  };

  youtubeClose.addEventListener('click', closeYoutubeModal);

  youtubeModal.addEventListener('click', (e) => {
    if (e.target === youtubeModal) closeYoutubeModal();
  });


  /* ── 3. Bild-Lightbox ─────────────────────────────────── */

  let lbImages = [];
  let lbIndex  = 0;
  let lbRenderToken = 0;

  /* Bilder vorladen & vorab dekodieren: Das Bild wird erst
     getauscht, wenn es komplett bereit ist. Dadurch gibt es kein
     Ruckeln/Springen mehr, und bereits geladene Bilder erscheinen
     sofort. Die Promises liegen im Cache, jedes Bild wird nur
     einmal geladen. */
  const imageCache = new Map();

  function loadImage(src) {
    if (!imageCache.has(src)) {
      const img = new Image();
      img.src = src;
      imageCache.set(src, img.decode().catch(() => {}).then(() => img));
    }
    return imageCache.get(src);
  }

  async function openLightbox(images, startIndex) {
    const lightboxEl = document.getElementById('image-lightbox');
    lbImages = images;
    lbIndex  = startIndex;

    // Erst öffnen, wenn das erste Bild bereit ist (sonst blitzt kurz
    // das Bild der zuvor geöffneten Galerie auf)
    await renderLightbox();
    cancelClose(lightboxEl);
    lightboxEl.classList.add('active');

    // Restliche Galerie-Bilder im Hintergrund vorladen
    images.forEach(item => loadImage(item.src));
  }

  function closeLightbox() {
    const lightboxEl = document.getElementById('image-lightbox');
    animateClose(lightboxEl, () => lightboxEl.classList.remove('active'));
  }

  async function renderLightbox() {
    const token = ++lbRenderToken;
    const item = lbImages[lbIndex];

    await loadImage(item.src);
    if (token !== lbRenderToken) return; // zwischenzeitlich weitergeklickt

    document.getElementById('lightbox-img').src = item.src;
    renderCaptionWithLinks(document.getElementById('lightbox-caption'), item.caption);

    const nav = document.getElementById('lightbox-nav');
    const lightboxEl = document.getElementById('image-lightbox');
    if (lbImages.length > 1) {
      nav.style.display = 'flex';
      lightboxEl.classList.add('has-nav');
      document.getElementById('lb-counter').textContent =
        (lbIndex + 1) + ' / ' + lbImages.length;

      // Nachbarn vorladen, damit der nächste Klick sofort greift
      loadImage(lbImages[(lbIndex + 1) % lbImages.length].src);
      loadImage(lbImages[(lbIndex - 1 + lbImages.length) % lbImages.length].src);
    } else {
      nav.style.display = 'none';
      lightboxEl.classList.remove('has-nav');
    }
  }

  // Beim Überfahren einer Galerie-Kachel (Desktop) schon das erste
  // große Bild laden – beim Klick ist es dann meist schon da.
  document.addEventListener('mouseover', (e) => {
    const tile = e.target.closest('.gallery-item-wrapper.image-item');
    if (!tile || !tile.dataset.gallery) return;
    try {
      const first = JSON.parse(tile.dataset.gallery)[0];
      if (first) loadImage(first.src);
    } catch (err) { /* ungültiges JSON wird beim Klick gemeldet */ }
  });

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

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

  document.getElementById('image-lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('image-lightbox')) closeLightbox();
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
    { type: 'video',   thumb: './KBF Jerus.webp',    youtube: '0O08ParzMEc?si=DoXPtKa6760mO6k_', caption: '2020 wurde der Song Jerusalema von Master KG durch selbstaufgenommene Tanzvideos zu einem weltweiten viralen Hit. Dieses Videos ist als teil dieser Challange entstanden.\n\n~Ari wirkte an der gesamten Produktion bei AP-Film mit, von der Planung über die Durchführung der Videoaufnahmen bis zur finalen Schnittbearbeitung'},
    { type: 'video',   thumb: './KK RL.webp',        youtube: 'JMG1xBxL0fE?si=UpP2_S_4k72Jt41C',  caption: 'Bessere Arbeitsbedingungen, mehr Gehalt, mehr Wertschätzung – das fordert die stern-Bundestagspetition: Pflege braucht Würde.\n\n~Ari wirkte an der gesamten Produktion bei AP-Film, von der Planung über die Durchführung der Videoaufnahmen bis zur finalen Schnittbearbeitung' },
    { type: 'video',   thumb: './911MilThum.png',    youtube: 'L6qSjLmOwjU?si=tO8hRNcLg51GVo6A',  caption: '911 MILLENNIUM haben das größte Buch der Welt über den 911er Porsche geschaffen – exklusiv, streng limitiert und nummeriert.\n\n~Ari hat bei AP-Film in der Postproduktion mitgewirkt' },
    { type: 'gallery', thumb: './WeddingThumb.webp', images: ['./Wedding8.webp', './Wedding.webp', './Wedding3.webp', './Wedding4.webp', './Wedding2.webp', './Wedding7.webp', './Wedding5.webp'] },
    { type: 'gallery', thumb: './LederDeckblatt.webp', images:['Leder1.webp','Leder2.webp','Leder3.webp','Leder4.webp'], caption: "Produktfotografie für Ledergroßhandel\nhttps://www.d-leder.com/autoleder-leder-f-auto-oldtimer/\n\n~Milian erstellte Produktfotos von Lederprodukten welche auf der Website von Dickmann Leder verwendet werden."},
    { type: 'image',   thumb: './Tripsdrill.jpg', caption: "Erlebnispark Tripsdrill, Achterbahn. \n\n *Keine direkte geschäftliche Verbindung oder Beauftragung durch Tripsdrill"},
    { type: 'gallery', thumb: './Lak.webp',          images: ['./1.jpg', './2.jpg', './3.jpg', './5.jpg', './6.jpg', './LakÖl.png'] },
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
        // NEU: Hier geben wir jedem Bild in der Galerie die project.caption mit!
        const galleryData = project.images.map(src => ({
          src: src,
          caption: project.caption || ''
        }));
        wrapper.setAttribute('data-gallery', JSON.stringify(galleryData));
        wrapper.innerHTML = `<img src="${project.thumb}" alt="">`;
      } else {
        wrapper.classList.add('image-item');
        // NEU: Auch bei Einzelbildern das data-caption Attribut setzen!
        if (project.caption) wrapper.setAttribute('data-caption', project.caption);
        wrapper.innerHTML = `<img src="${project.thumb}" alt="">`;
      }

      grid.appendChild(wrapper);
    });
  }

  renderReferenzen();

});


/* ── Navbar Brand Reveal beim Scrollen ─────────────────── */

  const topbar = document.querySelector('.topbar');

  if (topbar) {
    window.addEventListener('scroll', () => {
      // Wenn weiter als 150px gescrollt wurde, Klasse hinzufügen
      if (window.scrollY > 300) {
        topbar.classList.add('scrolled');
      } else {
        topbar.classList.remove('scrolled');
      }
    });
  }
