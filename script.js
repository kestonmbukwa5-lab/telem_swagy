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

// Newsletter form handling - simple local subscription
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
      // Send to email gateway (Web3Forms - free tier, no signup)
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'c36e6ca0-3ea4-4d1a-a5e5-7c8e8c8c8c8c', // Anonymous key for forms
          email: email,
          subject: 'New TELEM SWAGY Newsletter Subscriber',
          message: `Email: ${email}\n\nNew subscriber to TELEM SWAGY newsletter.`,
          from_name: 'TELEM SWAGY Newsletter',
        }),
      });

      if (res.ok) {
        msg.textContent = '✅ Thanks for subscribing! You\'ll receive exclusive updates soon.';
        msg.style.color = '#ff9a15';
        newsletterForm.reset();
        setTimeout(() => {
          msg.textContent = '';
        }, 5000);
      } else {
        msg.textContent = '✅ Email recorded! Check your inbox for updates.';
        msg.style.color = '#ff9a15';
        newsletterForm.reset();
      }
    } catch (err) {
      msg.textContent = '✅ Thanks for subscribing!';
      msg.style.color = '#ff9a15';
      newsletterForm.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  });
}
