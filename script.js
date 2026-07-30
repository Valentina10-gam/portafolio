const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const progressLine = document.getElementById('progressLine');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const reveals = [...document.querySelectorAll('.reveal')];
const compactViewport = window.matchMedia('(max-width: 980px)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const showReveal = item => item && item.classList.add('in-view');

if (compactViewport || reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach(showReveal);
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showReveal(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '120px 0px 120px 0px' });

  reveals.forEach(item => revealObserver.observe(item));

  setTimeout(() => {
    reveals.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.6 && rect.bottom > -200) showReveal(item);
    });
  }, 900);
}

const sections = [...document.querySelectorAll('.chapter')];
const railLinks = [...document.querySelectorAll('.chapter-rail a')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
if ('IntersectionObserver' in window && !compactViewport) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const id = entry.target.id;
        [...railLinks, ...navLinks].forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.08, rootMargin: '100px 0px -8% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
} else {
  sections.forEach(section => section.classList.add('in-view'));
}

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressLine.style.width = `${progress}%`;
}, {passive:true});

const trustItems = [...document.querySelectorAll('#trustGrid article')];
let activeTrust = 0;
if (trustItems.length) {
  trustItems[0].classList.add('active');
  setInterval(() => {
    trustItems[activeTrust].classList.remove('active');
    activeTrust = (activeTrust + 1) % trustItems.length;
    trustItems[activeTrust].classList.add('active');
  }, 1850);
}

const mobileCta = document.querySelector('.mobile-cta');
const contactSection = document.getElementById('contacto');
if (mobileCta && contactSection) {
  const contactObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => mobileCta.classList.toggle('is-hidden', entry.isIntersecting));
  }, {threshold: .12});
  contactObserver.observe(contactSection);
}


// V25 — parallax sutil en hero
const heroSection = document.querySelector('.hero');
if (heroSection && window.matchMedia('(min-width: 981px)').matches) {
  const layers = [...heroSection.querySelectorAll('.parallax-layer')];
  const state = { x: 0, y: 0, s: 0 };
  const applyParallax = () => {
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || '0.1');
      const base = layer.dataset.baseTransform ? `${layer.dataset.baseTransform} ` : '';
      const tx = state.x * depth * 26;
      const ty = state.y * depth * 18 + state.s * depth * -28;
      layer.style.transform = `${base}translate3d(${tx}px, ${ty}px, 0)`;
    });
  };
  heroSection.addEventListener('mousemove', e => {
    const rect = heroSection.getBoundingClientRect();
    state.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    state.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    requestAnimationFrame(applyParallax);
  });
  heroSection.addEventListener('mouseleave', () => {
    state.x = 0;
    state.y = 0;
    requestAnimationFrame(applyParallax);
  });
  window.addEventListener('scroll', () => {
    const rect = heroSection.getBoundingClientRect();
    state.s = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
    requestAnimationFrame(applyParallax);
  }, { passive: true });
  applyParallax();
}


// V27 — narrativa de scroll y hero motion
const activateIntro = () => requestAnimationFrame(() => document.body.classList.add('is-ready'));
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', activateIntro, { once: true });
} else {
  activateIntro();
}
const heroMotion = () => {
  if (!heroSection || heroSection.classList.contains('hero-story')) return;
  const heroContent = heroSection.querySelector('.hero-content');
  const heroImage = heroSection.querySelector('.hero-team img');
  const cue = heroSection.querySelector('.hero-scroll-cue');
  const rect = heroSection.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -rect.top / (window.innerHeight * 0.9)));
  if (heroContent) heroContent.style.transform = `translate3d(0, ${progress * -18}px, 0)`;
  if (heroImage) heroImage.style.opacity = `${1 - progress * 0.12}`;
  if (cue) cue.style.opacity = `${1 - progress * 0.9}`;
};
window.addEventListener('scroll', heroMotion, { passive: true });
heroMotion();


// V28 — hero que inicia en blanco y se arma en scroll
const heroStory = document.querySelector('.hero-story');
if (heroStory && !heroStory.classList.contains('hero-sequence')) {
  heroStory.classList.add('is-story-ready');
  const intro = heroStory.querySelector('.hero-intro');
  const introLogo = heroStory.querySelector('.hero-intro__logo-wrap');
  const introCopy = heroStory.querySelector('.hero-intro__copy');
  const introTeam = heroStory.querySelector('.hero-intro__team');
  const introScroll = heroStory.querySelector('.hero-intro__scroll');
  const finalLayer = heroStory.querySelector('.hero-final');
  const finalContent = heroStory.querySelector('.hero-final .hero-content');
  const finalTeam = heroStory.querySelector('.hero-final .hero-team');
  const header = document.getElementById('siteHeader');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const map = (value, inMin, inMax) => clamp((value - inMin) / (inMax - inMin));

  const updateHeroStory = () => {
    const headerH = header ? header.offsetHeight : 64;
    const rect = heroStory.getBoundingClientRect();
    const total = Math.max(1, heroStory.offsetHeight - (window.innerHeight - headerH));
    const p = clamp((-rect.top + headerH) / total);

    const bgBlend = clamp((p - 0.42) / 0.26);
    heroStory.style.background = bgBlend < 1
      ? `linear-gradient(180deg, rgba(255,255,255,${1 - bgBlend}) 0%, rgba(247,248,253,${1 - bgBlend}) 100%), linear-gradient(135deg,#19002e 0%,#250045 47%,#35165a 100%)`
      : 'linear-gradient(135deg,#19002e 0%,#250045 47%,#35165a 100%)';

    if (intro) intro.style.opacity = String(1 - map(p, 0.54, 0.8));
    if (introLogo) {
      const out = map(p, 0.42, 0.76);
      introLogo.style.opacity = String(1 - out);
      introLogo.style.transform = `translate(${mix(0, -38, out)}px, ${mix(0, -26, out)}px) scale(${mix(1, 0.94, out)})`;
      introLogo.style.filter = `blur(${mix(0, 6, out)}px)`;
    }
    if (introCopy) {
      const out = map(p, 0.4, 0.74);
      introCopy.style.opacity = String(1 - out);
      introCopy.style.transform = `translate(${mix(0, -54, out)}px, ${mix(0, -12, out)}px)`;
      introCopy.style.filter = `blur(${mix(0, 8, out)}px)`;
    }
    if (introTeam) {
      const out = map(p, 0.46, 0.8);
      introTeam.style.opacity = String(1 - out);
      introTeam.style.transform = `translate(${mix(0, 50, out)}px, ${mix(0, -8, out)}px) scale(${mix(1, 0.96, out)})`;
      introTeam.style.filter = `blur(${mix(0, 8, out)}px)`;
    }
    if (introScroll) {
      const out = map(p, 0.2, 0.46);
      introScroll.style.opacity = String(1 - out);
      const xBase = window.innerWidth > 1100 ? 0 : -50;
      introScroll.style.transform = window.innerWidth > 1100
        ? `translateY(${mix(0, 16, out)}px)`
        : `translateX(-50%) translateY(${mix(0, 16, out)}px)`;
    }

    if (finalLayer) {
      const finalIn = map(p, 0.42, 0.76);
      finalLayer.style.opacity = String(finalIn);
      finalLayer.style.transform = `scale(${mix(1.03, 1, finalIn)})`;
    }
    if (finalContent) {
      const finalIn = map(p, 0.5, 0.84);
      finalContent.style.opacity = String(finalIn);
      finalContent.style.transform = `translate3d(${mix(28, 0, finalIn)}px, ${mix(18, 0, finalIn)}px, 0)`;
      finalContent.style.filter = `blur(${mix(8, 0, finalIn)}px)`;
    }
    if (finalTeam) {
      const finalIn = map(p, 0.52, 0.86);
      finalTeam.style.opacity = String(finalIn);
      finalTeam.style.transform = `translate3d(${mix(36, 0, finalIn)}px, ${mix(26, 0, finalIn)}px, 0)`;
      finalTeam.style.filter = `blur(${mix(8, 0, finalIn)}px)`;
    }
  };

  window.addEventListener('scroll', updateHeroStory, { passive: true });
  window.addEventListener('resize', updateHeroStory);
  updateHeroStory();
}
