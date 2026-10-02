/* ==========================================================================
   Hôtel Aria — interactions & animations
   GSAP + ScrollTrigger + Lenis (smooth scroll)
   ========================================================================== */
(() => {
  window.ARIA_READY = true;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Image slots: flag missing photos ---------- */
  $$('.media img').forEach((img) => {
    const flag = () => img.closest('.media')?.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) flag();
    img.addEventListener('error', flag, { once: true });
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  const toggleMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  };
  burger?.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Fallback without GSAP or with reduced motion ---------- */
  if (!hasGsap || reduceMotion) {
    document.body.classList.remove('is-loading');
    $('.loader')?.remove();
    $$('.reveal-clip').forEach((el) => (el.style.clipPath = 'none'));
    $('.atmo__frame') && ($('.atmo__frame').style.clipPath = 'none');
    $$('.hero__media img, .atmo__frame img, .room__media img').forEach((el) => (el.style.transform = 'none'));
    $$('.loader__word span').forEach((el) => (el.style.transform = 'none'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 0 }) : document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' }));
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2 || !document.querySelector(id)) return;
      e.preventDefault();
      scrollTo(id);
    });
  });

  /* ---------- Text splitting ---------- */
  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="split-word">${w}</span>`).join(' ');
    return $$('.split-word', el);
  };
  const splitChars = (el) => {
    const text = el.textContent.trim();
    el.innerHTML = [...text].map((c) => `<span class="split-char">${c}</span>`).join('');
    return $$('.split-char', el);
  };
  const splitLines = (el) => {
    // Keep explicit <br> as forced breaks, then group words by rendered line.
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map((p) => p.trim().split(/\s+/).map((w) => `<span class="split-word">${w}</span>`).join(' '))
      .join(' <span class="split-br"></span> ');
    const lines = [];
    let current = [];
    let lastTop = null;
    [...el.children].forEach((node) => {
      if (node.classList.contains('split-br')) {
        if (current.length) lines.push(current);
        current = [];
        lastTop = null;
        return;
      }
      const top = node.offsetTop;
      if (lastTop !== null && Math.abs(top - lastTop) > 4) {
        lines.push(current);
        current = [];
      }
      current.push(node.textContent);
      lastTop = top;
    });
    if (current.length) lines.push(current);
    el.innerHTML = lines.map((l) => `<span class="split-line"><span>${l.join(' ')}</span></span>`).join('');
    return $$('.split-line > span', el);
  };

  /* ---------- Cursor ---------- */
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor-label');
  if (finePointer && cursor) {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    const lxTo = gsap.quickTo(cursorLabel, 'x', { duration: 0.6, ease: 'power3' });
    const lyTo = gsap.quickTo(cursorLabel, 'y', { duration: 0.6, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-ready');
      pos.x = e.clientX; pos.y = e.clientY;
      xTo(pos.x); yTo(pos.y); lxTo(pos.x); lyTo(pos.y);
    });
    $$('a, button, .service, .place, .review').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorLabel.querySelector('span').textContent = el.dataset.cursor;
        gsap.to(cursorLabel, { scale: 1, duration: 0.5, ease: 'expo.out' });
        gsap.to(cursor, { autoAlpha: 0, duration: 0.2 });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(cursorLabel, { scale: 0, duration: 0.4, ease: 'expo.out' });
        gsap.to(cursor, { autoAlpha: 1, duration: 0.2 });
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Hover tilt on media ---------- */
  if (finePointer) {
    $$('.room__media, .intro__media .media, .split__secondary .media').forEach((el) => {
      const img = el.querySelector('img');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(img, { xPercent: dx * -4, yPercent: dy * -4, duration: 0.8, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(img, { xPercent: 0, yPercent: 0, duration: 1, ease: 'expo.out' }));
    });
  }

  /* ---------- Services floating preview ---------- */
  const preview = $('.hover-preview');
  if (finePointer && preview) {
    const imgs = $$('img', preview);
    const pxTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
    const pyTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
    let lastX = 0;
    const list = $('[data-preview-list]');
    list.addEventListener('mousemove', (e) => {
      pxTo(e.clientX + 180);
      pyTo(e.clientY);
      gsap.to(preview, { rotate: gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6), duration: 0.6, ease: 'power3' });
      lastX = e.clientX;
    });
    $$('.service', list).forEach((row) => {
      row.addEventListener('mouseenter', () => {
        imgs.forEach((im, i) => im.classList.toggle('is-active', i === Number(row.dataset.preview)));
        const active = imgs[Number(row.dataset.preview)];
        preview.querySelector('.media').classList.toggle('is-missing', !active || active.naturalWidth === 0);
      });
    });
    list.addEventListener('mouseenter', () => gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }));
    list.addEventListener('mouseleave', () => gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'expo.out' }));
  }

  /* ---------- Nav state ---------- */
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > innerHeight * 0.85);
      nav.classList.toggle('is-hidden', y > lastY && y > innerHeight && !menu.classList.contains('is-open'));
      lastY = y;
    },
  });

  /* ---------- Marquees (scroll-velocity reactive) ---------- */
  const marquees = $$('[data-marquee]').map((m) => {
    const track = $('.marquee__track', m);
    const group = $('.marquee__group', m);
    // Duplicate the group to make the loop seamless
    for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
    return { m, track, group, x: 0, dir: Number(m.dataset.direction || 1), boost: 0 };
  });
  let velocity = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { velocity = self.getVelocity(); } });
  gsap.ticker.add((_, delta) => {
    const dt = delta / 16.67;
    marquees.forEach((q) => {
      const w = q.group.offsetWidth;
      q.boost += (Math.abs(velocity) / 220 - q.boost) * 0.08;
      const dir = velocity < 0 ? -q.dir : q.dir;
      q.x -= (0.9 + q.boost) * dt * dir;
      if (q.x <= -w) q.x += w;
      if (q.x > 0) q.x -= w;
      gsap.set(q.track, { x: q.x, skewX: gsap.utils.clamp(-8, 8, -velocity / 300) * q.dir });
    });
    velocity *= 0.9;
  });

  /* ---------- Build everything once fonts are ready ---------- */
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(init);

  function init() {
    // Split headings
    $$('[data-split="lines"]').forEach((el) => {
      el._lines = splitLines(el);
      gsap.set(el._lines, { yPercent: 110 });
    });
    $$('[data-split="chars"]').forEach((el) => {
      el._chars = splitChars(el);
    });
    $$('[data-split="words"]').forEach((el) => {
      el._words = splitWords(el);
    });
    gsap.set('.footer__word .split-char', { yPercent: 105 });
    gsap.set('[data-fade]', { autoAlpha: 0, y: 40 });

    intro();
    scrollAnimations();
    ScrollTrigger.refresh();
  }

  /* ---------- Loader + hero intro ---------- */
  function intro() {
    const counter = $('.loader__count');
    const count = { v: 0 };
    const heroTitle = $('.hero__title');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.to('.loader__word span', { y: 0, duration: 1.1, stagger: 0.08 })
      .to(count, {
        v: 100, duration: 1.6, ease: 'power2.inOut',
        onUpdate: () => (counter.textContent = String(Math.round(count.v)).padStart(3, '0')),
      }, 0)
      .to('.loader__bar', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to('.loader__word span', { yPercent: -110, duration: 0.8, stagger: 0.05, ease: 'expo.in' }, '>-0.1')
      .to('.loader', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '>-0.3')
      .add(() => { document.body.classList.remove('is-loading'); lenis?.start(); }, '<0.4')
      .to('.hero__media img', { scale: 1, duration: 2.2, ease: 'expo.out' }, '<0.2')
      .to(heroTitle._lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, '<0.3')
      .to('.hero__wordmark .split-char', { y: 0, duration: 1.4, stagger: 0.07 }, '<0.1')
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, '<0.3')
      .add(() => $('.loader')?.remove());
  }

  /* ---------- Scroll-driven animations ---------- */
  function scrollAnimations() {
    // Hero parallax out
    gsap.to('.hero__media .media', {
      yPercent: 25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__content', {
      yPercent: -12, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true },
    });

    // Headline line reveals (except hero, handled by intro)
    $$('[data-split="lines"]').forEach((el) => {
      if (el.closest('.hero') || el.closest('.atmo')) return;
      gsap.to(el._lines, {
        yPercent: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    // Generic fades
    ScrollTrigger.batch($$('[data-fade]').filter((el) => !el.closest('.hero')), {
      start: 'top 90%',
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }),
    });

    // Hairline rules draw in
    $$('[data-rule]').forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.6, ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    });

    // Intro words fill on scroll
    const words = $('[data-scrub-words]')?._words;
    if (words) {
      gsap.to(words, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.intro__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    }

    // Clip-path image reveals
    $$('.reveal-clip').forEach((el) => {
      const img = el.querySelector('img');
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
        .to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.4 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.2);
    });

    // Figure parallax
    $$('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        yPercent: Number(el.dataset.parallax), ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Inner image parallax (sticky breakfast photo)
    $$('[data-inner-parallax] img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.25, yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.closest('.section'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Counters
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const start = end > 1000 ? end - 140 : 0;
      const obj = { v: start };
      el.textContent = start.toFixed(decimals);
      gsap.to(obj, {
        v: end, duration: 2.2, ease: 'expo.out',
        onUpdate: () => (el.textContent = obj.v.toFixed(decimals)),
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // Rooms: horizontal scroll on desktop, staggered reveal on mobile
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const track = $('.rooms__track');
      const getDist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -getDist(), ease: 'none',
        scrollTrigger: {
          trigger: '.rooms__pin', start: 'center center', end: () => '+=' + getDist(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      gsap.to('.rooms__progress i', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.rooms__pin', start: 'center center', end: () => '+=' + getDist(), scrub: true },
      });
      $$('.room:not(.room--intro)').forEach((room) => {
        const img = room.querySelector('.room__media img');
        gsap.fromTo(img, { xPercent: 8 }, {
          xPercent: -8, ease: 'none',
          scrollTrigger: { trigger: room, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
        gsap.from(room.querySelector('.room__body'), {
          y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: room, containerAnimation: tween, start: 'left 85%' },
        });
      });
    });
    mm.add('(max-width: 760px)', () => {
      $$('.room').forEach((room) => {
        gsap.from(room, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: room, start: 'top 88%' } });
      });
    });

    // Atmosphere: frame expands to full-bleed while pinned
    const atmoTitle = $('.atmo__title');
    gsap.timeline({
      scrollTrigger: { trigger: '[data-atmo]', start: 'top top', end: '+=120%', pin: true, scrub: 1 },
    })
      .to('.atmo__frame', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      .to('.atmo__frame img', { scale: 1, ease: 'none' }, 0)
      .to(atmoTitle._lines, { yPercent: 0, stagger: 0.08, ease: 'power3.out', duration: 0.5 }, 0.35)
      .from('.atmo__text .caption', { autoAlpha: 0, y: 20, duration: 0.3 }, 0.35);

    // Service rows slide in
    $$('.service').forEach((row, i) => {
      gsap.from(row, {
        x: i % 2 ? 60 : -60, autoAlpha: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 92%' },
      });
    });

    // Neighbourhood: names scrub horizontally for depth
    $$('.place__name').forEach((el, i) => {
      gsap.fromTo(el, { xPercent: i % 2 ? 10 : 5 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 50%', scrub: true },
      });
    });

    // CTA background parallax
    gsap.fromTo('[data-cta-media]', { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('[data-cta-media] img', { scale: 1.2 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });

    // Footer wordmark
    gsap.to('.footer__word .split-char', {
      yPercent: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.footer', start: 'top 85%' },
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
