const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
const navLinks = siteNav.querySelectorAll('a');
const sections = Array.from(navLinks)
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function setActiveLink(hash) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.hash === hash);
  });
}

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('nav-open', isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    setActiveLink(link.hash);
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const mostVisible = visibleEntries.reduce((prev, current) =>
          prev.intersectionRatio > current.intersectionRatio ? prev : current
        );
        setActiveLink(`#${mostVisible.target.id}`);
      }
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: [0.15, 0.35, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

window.addEventListener('load', () => {
  if (window.location.hash) {
    setActiveLink(window.location.hash);
  } else if (sections.length) {
    setActiveLink(`#${sections[0].id}`);
  }
});
