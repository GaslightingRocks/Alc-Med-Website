/* =============================================================
   main.js – Alcedo Media
   Struktur:
   1.  Galerie-Video: Hover Play/Pause
   2.  YouTube-Modal: Öffnen & Schließen
   3.  Bild-Lightbox: Öffnen & Schließen
   4.  Hamburger-Menü: Toggle
   5.  Galerie: Rechtsklick sperren
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


  /* ── 2. YouTube Modal (FIXED) ─────────────────────────── */
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
    const caption = link.getAttribute('data-caption') || "";

    // 👉 IMMER setzen (sofort sichtbar)
    youtubeCaption.textContent = caption;

    youtubeModal.style.display = 'flex';
    consentBox.style.display = 'flex';
    youtubeIframe.src = "";
  });
});

consentBtn.addEventListener('click', () => {
  youtubeIframe.src =
    `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1`;

  consentBox.style.display = 'none';
});

const closeYoutubeModal = () => {
  youtubeModal.style.display = 'none';
  youtubeIframe.src = "";
  consentBox.style.display = 'flex';
  youtubeCaption.textContent = "";
};

youtubeClose.addEventListener('click', closeYoutubeModal);

youtubeModal.addEventListener('click', (e) => {
  if (e.target === youtubeModal) closeYoutubeModal();
});
  /* ── 3. Bild Lightbox ─────────────────────────────────── */

  const lightbox        = document.getElementById('image-lightbox');
  const lightboxImg     = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose   = document.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item-wrapper.image-item').forEach(item => {
    item.addEventListener('click', () => {

      const img = item.querySelector('img');

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;

      lightboxCaption.textContent =
        item.getAttribute('data-caption') || '';

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });


  /* ── 4. ESC schließt alles ───────────────────────────── */

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeYoutubeModal();
    }
  });


  /* ── 6. Rechtsklick sperren ───────────────────────────── */

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.gallery')) e.preventDefault();
  });

});


/* ── Contact Form ───────────────────────────────────────── */

const form = document.getElementById("kontaktform");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch("https://formspree.io/f/xvzvwjoo", {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    });

    if (response.ok) {
      form.reset();
      alert("✅ Nachricht gesendet! Ich melde mich so bald wie möglich.");
    } else {
      alert("❌ Fehler beim Senden.");
    }
  });
}
/* ── 5. Hamburger-Menü ──────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (!hamburger || !nav) {
    console.warn("Hamburger oder Nav nicht gefunden");
    return;
  }

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("open");
  });

  // Menü schließen beim Klick auf Link
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      nav.classList.remove("open");
    });
  });

});
