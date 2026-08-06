const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
const siteHeader = document.getElementById('siteHeader');
const navLinks = siteNav.querySelectorAll('a');
const sections = Array.from(navLinks)
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function setActiveLink(hash) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.hash === hash);
  });
}

function closeNav() {
  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('nav-open', isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeNav();
    setActiveLink(link.hash);
  });
});

window.addEventListener(
  'scroll',
  () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
  },
  { passive: true }
);
siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(
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
  sections.forEach((section) => navObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

window.addEventListener('load', () => {
  if (window.location.hash) {
    setActiveLink(window.location.hash);
  } else if (sections.length) {
    setActiveLink(`#${sections[0].id}`);
  }
});

/* —— Ku Bar player —— */
(function initPlayer() {
  const audio = document.getElementById('playerAudio');
  const playBtn = document.getElementById('playerPlay');
  const seek = document.getElementById('playerSeek');
  const currentEl = document.getElementById('playerCurrent');
  const durationEl = document.getElementById('playerDuration');
  if (!audio || !playBtn || !seek) return;

  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  let seeking = false;

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function setPlaying(playing) {
    playBtn.setAttribute('aria-label', playing ? 'Pause Ku Bar' : 'Play Ku Bar');
    if (iconPlay) iconPlay.hidden = playing;
    if (iconPause) iconPause.hidden = !playing;
  }

  playBtn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch (err) {
      setPlaying(false);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (seeking || !audio.duration) return;
    seek.value = String((audio.currentTime / audio.duration) * 100);
    currentEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    setPlaying(false);
    seek.value = '0';
    currentEl.textContent = '0:00';
  });

  seek.addEventListener('pointerdown', () => {
    seeking = true;
  });
  seek.addEventListener('pointerup', () => {
    seeking = false;
  });
  seek.addEventListener('input', () => {
    if (!audio.duration) return;
    const t = (Number(seek.value) / 100) * audio.duration;
    audio.currentTime = t;
    currentEl.textContent = formatTime(t);
  });
})();

/* —— Newsletter —— */
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('newsletterEmail');
  const msg = document.getElementById('newsletterMessage');
  const WAITLIST_KEY = 'telem_swagy_waitlist';

  function setMessage(text, type) {
    msg.textContent = text;
    msg.classList.remove('is-success', 'is-error');
    if (type) msg.classList.add(type);
  }

  function saveLocal(email) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    const exists = list.some((e) => String(e).toLowerCase() === email.toLowerCase());
    if (!exists) {
      list.push(email);
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
    }
    return !exists;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (emailInput.value || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email.', 'is-error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const prevLabel = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing…';
    setMessage('');

    const apiBase = (window.TELEM_API_URL || '').replace(/\/$/, '');

    try {
      if (apiBase) {
        const res = await fetch(`${apiBase}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Subscribe failed');
        }
        setMessage(
          data.subscribed === false
            ? 'You are already on the list.'
            : 'Thanks — you are subscribed.',
          'is-success'
        );
        form.reset();
      } else {
        const isNew = saveLocal(email);
        setMessage(
          isNew
            ? 'Saved on this device. Connect the API later to sync the waitlist.'
            : 'That email is already saved on this device.',
          'is-success'
        );
        form.reset();
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong. Try again.', 'is-error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
    }
  });
})();

/* —— Booking (mailto) —— */
(function initBooking() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const msg = document.getElementById('bookingMessage');
  const BOOKING_EMAIL = 'contact@telemswagy.com';

  function setMessage(text, type) {
    msg.textContent = text;
    msg.classList.remove('is-success', 'is-error');
    if (type) msg.classList.add(type);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('bookName').value || '').trim();
    const email = (document.getElementById('bookEmail').value || '').trim();
    const eventType = document.getElementById('bookType').value;
    const message = (document.getElementById('bookMessage').value || '').trim();

    if (!name || !email || !eventType || !message) {
      setMessage('Please fill in all fields.', 'is-error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email.', 'is-error');
      return;
    }

    const subject = encodeURIComponent(`Booking inquiry: ${eventType} — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nEvent type: ${eventType}\n\n${message}\n`
    );
    const href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`;

    setMessage('Opening your email app…', 'is-success');
    window.location.href = href;
  });
})();
