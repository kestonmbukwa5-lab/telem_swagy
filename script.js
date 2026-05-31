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

// Newsletter form handling
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  const emailInput = document.getElementById('newsletterEmail');
  const msg = document.getElementById('newsletterMessage');
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const email = (emailInput.value || '').trim();
    if (!email) return (msg.textContent = 'Please enter a valid email.');

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    try {
      const API_BASE = (window.API_BASE || '').replace(/\/$/, '');
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        msg.textContent = 'Thanks! Check your email for confirmation.';
        newsletterForm.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        msg.innerHTML = `Subscription failed. Try emailing <a href="mailto:contact@telemswagy.com">contact@telemswagy.com</a> instead.`;
      }
    } catch (err) {
      // likely the API isn't deployed to this origin (GitHub Pages)
      msg.innerHTML = 'Subscription server not reachable from this host. You can email <a href="mailto:contact@telemswagy.com">contact@telemswagy.com</a> to subscribe.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  });
}
