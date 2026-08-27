(() => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navLinks');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 800) close(); });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
