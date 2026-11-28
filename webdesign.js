/* =============================================================
   webdesign.js – Alcedo Media
   Schlankes Script nur für webdesign.html.

   Warum nicht JSFIle.js? Das erwartet auf jeder Seite das
   YouTube-Modal und die Bild-Lightbox im HTML. Die Webdesign-Seite
   braucht beides nicht (Referenzen verlinken direkt auf die
   echten Websites), daher hier nur, was die Seite wirklich nutzt:
   1. Hamburger-Menü (identisch zur Startseite)
   2. Navbar-Schriftzug beim Scrollen einblenden
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Hamburger-Menü ────────────────────────────────── */

  const hamburger   = document.getElementById('hamburger');
  const nav         = document.getElementById('nav');
  const menuOverlay = document.getElementById('menuOverlay');

  if (hamburger && nav) {
    const closeMenu = () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    };

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }

  /* ── 2. Navbar-Schriftzug beim Scrollen ───────────────── */

  const topbar = document.querySelector('.topbar');

  if (topbar) {
    const updateTopbar = () => {
      topbar.classList.toggle('scrolled', window.scrollY > 300);
    };
    window.addEventListener('scroll', updateTopbar, { passive: true });
    updateTopbar();
  }

});