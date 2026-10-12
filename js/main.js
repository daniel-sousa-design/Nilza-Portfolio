(() => {
  const projects = window.PROJECTS;
  const nav = document.querySelector('.projects-nav');
  const navList = document.querySelector('.projects-nav__list');
  const container = document.querySelector('.projects');
  const cue = document.querySelector('.next-cue');
  const cueName = document.querySelector('.next-cue__name');
  const footer = document.querySelector('.footer');
  const info = document.getElementById('info');
  const toggle = document.querySelector('.topbar__toggle');
  const navToggle = document.querySelector('.projects-nav__toggle');
  const backToTop = document.querySelector('.back-to-top');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [];
  const navRows = [];
  let active = -1;
  let travelling = null;  // index of the project a nav click / back-to-top is scrolling to

  // Reloads land where the URL says (a project's #hash, or the top), not at a stale offset.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // One line of text that can slide in/out, clipped at its cap line (see .reveal in CSS).
  const reveal = (html, cls = '', n) =>
    `<span class="reveal ${cls}"${n === undefined ? '' : ` style="--n:${n}"`}><span class="reveal__in">${html}</span></span>`;

  /* ---------- Nav ---------- */

  projects.forEach((p, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grid projects-nav__row';
    btn.style.setProperty('--i', i);                        // stagger order when opening
    btn.style.setProperty('--ri', projects.length - 1 - i); // reversed when closing
    btn.innerHTML = `
      <span class="col-project">${reveal(p.title, 'projects-nav__title')}${p.subtitle ? `<span class="projects-nav__sub"><span>${[].concat(p.subtitle).map((l, n) => reveal(l, '', n)).join('')}</span></span>` : ''}</span>
      <span class="col-year">${reveal(`[${p.year}]`)}</span>
      <span class="col-category">${reveal(p.categories.map(c => `[${c}]`).join(''))}</span>`;
    btn.addEventListener('click', () => goTo(i));
    li.appendChild(btn);
    navList.appendChild(li);
    navRows.push(btn);
  });

  // Keep scroll offsets in sync with the sticky nav's real height (it scales with the viewport).
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    layoutNav();
  }).observe(nav);

  // Height of a row without its subtitle (subtitles may be mid-animation, so measure them out).
  const baseHeight = row => {
    const sub = row.querySelector('.projects-nav__sub');
    return row.offsetHeight - (sub ? sub.offsetHeight : 0);
  };
  const subHeight = row => row.querySelector('.projects-nav__sub > span')?.scrollHeight || 0;

  // Slide the list so the active row sits at the top of the nav window; the fade starts
  // right under it, so only the next project shows through, faded and half covered.
  function layoutNav() {
    if (active < 0) return;
    let offset = 0;
    let total = 0;
    navRows.forEach((row, n) => {
      if (n < active) offset += baseHeight(row);
      total += baseHeight(row);
    });
    const activeH = baseHeight(navRows[active]) + subHeight(navRows[active]);
    const nextH = baseHeight(navRows[active + 1] || navRows[active]);
    nav.style.setProperty('--offset', `${offset}px`);
    nav.style.setProperty('--window-h', `${activeH + nextH}px`);  // grows with a longer subtitle
    nav.style.setProperty('--active-h', `${activeH}px`);
    nav.style.setProperty('--rows-h', `${total + subHeight(navRows[active])}px`);
  }

  /* ---------- Project rendering ---------- */

  function tile(item, eager) {
    if (!item) {
      const empty = document.createElement('div');
      empty.className = 'row__empty';
      return empty;
    }
    const el = document.createElement('figure');
    el.className = 'tile';
    el.style.margin = '0';
    if (item.ratio) el.style.setProperty('--ratio', item.ratio);
    if (item.bg) el.style.setProperty('--bg', item.bg);
    if (item.fit === 'contain') el.classList.add('tile--contain');

    if (item.placeholder) {
      el.classList.add('tile--placeholder');
      el.textContent = '[Images coming soon]';
      return el;
    }

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || '';
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    if (item.crop) {
      const { w, h, l, t } = item.crop;
      el.classList.add('tile--crop');
      Object.assign(img.style, { width: `${w}%`, height: `${h}%`, left: `${l}%`, top: `${t}%` });
    }
    el.appendChild(img);
    return el;
  }

  function placeholderRows() {
    const ph = ratio => ({ placeholder: true, ratio });
    return [
      { layout: 'full', items: [ph(1496 / 748)] },
      { layout: 'cols', items: [ph(743 / 583), ph(743 / 583)] }
    ];
  }

  function renderProject(i) {
    const p = projects[i];
    const section = document.createElement('section');
    section.className = 'project';
    section.id = p.slug;
    section.dataset.index = i;
    section.setAttribute('aria-label', p.title);

    (p.rows || placeholderRows()).forEach((row, r) => {
      const el = document.createElement('div');
      el.className = `row row--${row.layout}`;
      if (row.layout === 'cols') {
        el.style.setProperty('--cols', row.items.length);
        el.classList.add(`row--n${row.items.length}`);
        if (row.gap === false) el.classList.add('row--flush');
        if (row.inset) el.classList.add('row--inset');
      }
      row.items.forEach(item => el.appendChild(tile(item, i === 0 && r === 0)));
      section.appendChild(el);
    });

    container.appendChild(section);
    sections.push(section);
  }

  /* ---------- Sequential loading ---------- */

  function loadNext() {
    if (sections.length >= projects.length) return;
    renderProject(sections.length);
    updateCue();
  }

  function ensureLoaded(i) {
    while (sections.length <= i) loadNext();
  }

  function updateCue() {
    const next = projects[sections.length];
    if (next) {
      cueName.textContent = next.title;
    } else {
      cue.hidden = true;
      footer.hidden = false;
    }
  }

  // Reaching the end of the current project and scrolling on loads the next one.
  new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) loadNext();
  }, { threshold: 0.5 }).observe(cue);

  /* ---------- Active project ---------- */

  function setActive(i) {
    if (i === active) return;
    active = i;
    navRows.forEach((row, n) => {
      row.classList.toggle('is-active', n === i);
      row.classList.toggle('is-next', n === i + 1);
      row.classList.toggle('is-past', n < i);
      if (n === i) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
    layoutNav();
  }

  function updateActive() {
    if (travelling !== null) return;  // don't flick through every project on the way
    const line = nav.getBoundingClientRect().bottom + window.innerHeight * 0.3;
    let current = 0;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) current = Number(s.dataset.index);
    }
    setActive(current);
  }

  // The URL follows the reader: #slug while a project is in view, nothing while at the top.
  function syncHash() {
    if (travelling !== null) return;
    const atTop = nav.getBoundingClientRect().top > 1;
    const hash = atTop ? '' : `#${projects[active].slug}`;
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateActive(); updateBackToTop(); syncHash(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', updateActive);

  /* ---------- Full project list ([+]) ---------- */

  function setNavOpen(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Hide project list' : 'Show all projects');
    navToggle.textContent = open ? '[-]' : '[+]';
  }

  navToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')));
  // Leaving the nav closes it again (plays the opening animation in reverse).
  nav.addEventListener('mouseleave', () => setNavOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNavOpen(false); });

  /* ---------- Back to top ---------- */

  // Shown once the projects section has taken over the screen (nav locked at the top).
  function updateBackToTop() {
    backToTop.classList.toggle('is-visible', nav.getBoundingClientRect().top <= 1);
  }

  // Hold the nav on the destination while a smooth scroll runs, then hand back to scrolling.
  function travelTo(i, scroll) {
    travelling = i;
    setActive(i);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      travelling = null;
      updateActive();
      syncHash();
    };
    window.addEventListener('scrollend', finish, { once: true });
    setTimeout(finish, 1500);  // no scrollend support, or nothing to scroll
    requestAnimationFrame(scroll);
  }

  backToTop.addEventListener('click', () => {
    setNavOpen(false);
    history.replaceState(null, '', location.pathname + location.search);
    travelTo(0, () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  });

  function goTo(i) {
    setNavOpen(false);
    ensureLoaded(i);
    history.replaceState(null, '', `#${projects[i].slug}`);
    travelTo(i, () => sections[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
  }

  // Typed or linked #hashes go to their project too.
  const indexFromHash = () => projects.findIndex(p => `#${p.slug}` === location.hash);
  window.addEventListener('hashchange', () => {
    const i = indexFromHash();
    if (i >= 0) goTo(i);
  });

  /* ---------- Info toggle ---------- */

  // Text leaves and arrives line by line, like the page-load intro: closing slides the lines
  // up out of view (bottom first) while the panel folds; opening unfolds it while the lines
  // slide down into place (top first). The fold is timed to the wave, so the divider below
  // travels with the text.
  const LINE_MS = 900;  // .reveal__in transition
  const WAVE_MS = 500;
  let infoBlocks = null;
  let infoRun = 0;

  function splitInfo() {
    if (infoBlocks) return;
    infoBlocks = [...info.querySelectorAll('.label, p, li')].map(el => ({ el, html: el.innerHTML }));
    infoBlocks.forEach(({ el }) => {
      if (el.children.length === 0) splitIntoLines(el);
      else el.innerHTML = reveal(el.innerHTML);
    });
  }

  function restoreInfo() {
    infoBlocks?.forEach(({ el, html }) => { el.innerHTML = html; });
    infoBlocks = null;
    info.classList.remove('is-folding');
  }

  function waveInfo(reverse) {
    const box = info.querySelector('.info__inner').getBoundingClientRect();
    const height = info.querySelector('.info__inner').scrollHeight || 1;
    const vw = window.innerWidth;
    info.querySelectorAll('.reveal__in').forEach(line => {
      const r = line.getBoundingClientRect();
      const y = (r.top - box.top) / height;
      const x = r.left / vw;
      const d = reverse ? (1 - y) * WAVE_MS + (1 - x) * 150 : y * WAVE_MS + x * 150;
      line.style.setProperty('--d', `${Math.round(d)}ms`);
    });
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.textContent = open ? '[+]' : '[-]';
    const run = ++infoRun;

    if (reduceMotion) {
      info.classList.toggle('is-collapsed', open);
      return;
    }

    const total = WAVE_MS + 150 + LINE_MS;  // first line starts → last line lands
    splitInfo();
    info.classList.add('is-folding');
    if (open) {
      waveInfo(true);
      info.style.setProperty('--fold-ms', `${total}ms`);
      info.style.setProperty('--fold-delay', '0ms');
      info.classList.add('is-hiding', 'is-collapsed');
      setTimeout(() => {
        if (run === infoRun) restoreInfo();  // once folded away
      }, total + 100);
    } else {
      info.style.setProperty('--fold-ms', `${total - 250}ms`);
      info.style.setProperty('--fold-delay', '150ms');
      info.classList.add('is-hiding');
      info.querySelectorAll('.reveal__in').forEach(l => { l.style.transition = 'none'; });
      info.offsetHeight;  // lines start above their cut line
      info.querySelectorAll('.reveal__in').forEach(l => { l.style.transition = ''; });
      info.classList.remove('is-collapsed');
      waveInfo(false);
      requestAnimationFrame(() => info.classList.remove('is-hiding'));
      setTimeout(() => {
        if (run === infoRun) restoreInfo();
      }, total + 100);
    }
  });

  /* ---------- Load-in animation ----------
   * Every line of text slides down into place, in a wave from top to bottom. Paragraphs
   * are split into their rendered lines first; afterwards the original markup is put
   * back so text reflows normally on resize.
   */

  const escapeHTML = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  function splitIntoLines(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${escapeHTML(w)}</span>`).join(' ');
    const lines = [];
    let top = null;
    el.querySelectorAll('.w').forEach(w => {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map(l => reveal(escapeHTML(l.join(' ')))).join('');
  }

  async function intro() {
    const root = document.documentElement;
    if (!root.classList.contains('reveal-init')) return;

    await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]);

    const blocks = [...document.querySelectorAll(
      '.topbar > *, .info .label, .info p, .info li, .projects-nav__head > *'
    )].map(el => ({ el, html: el.innerHTML, text: el.textContent }));

    blocks.forEach(({ el }) => {
      if (el.children.length === 0) {  // plain text: animate each rendered line
        splitIntoLines(el);
      } else {
        el.innerHTML = reveal(el.innerHTML);
      }
    });

    // The divider opens first in the middle of the window (a [0%]–[100%] count beside it),
    // holds there for a beat at [100%], then moves down into place as the text wave and the
    // images start.
    const OPEN_MS = 1200;           // matches the clip-path transition on .spectrum
    const HOLD_MS = 500;
    const SPECTRUM_MS = OPEN_MS + HOLD_MS;
    const spectrum = document.querySelector('.spectrum');
    const loader = document.querySelector('.loader');
    const loaderText = document.querySelector('.loader .reveal__in');

    // Delay each line by its position on screen: top-to-bottom wave, slight left-to-right lean.
    const lines = document.querySelectorAll('.topbar .reveal__in, .info .reveal__in, .projects-nav .reveal__in');
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    lines.forEach(line => {
      const r = line.getBoundingClientRect();
      const d = SPECTRUM_MS + Math.min(Math.max(r.top, 0), vh) / vh * 700 + r.left / vw * 150;
      line.style.setProperty('--d', `${Math.round(d)}ms`);
    });

    if (spectrum) {
      const r = spectrum.getBoundingClientRect();
      spectrum.style.setProperty('--y', `${Math.round(vh / 2 - (r.top + r.height / 2))}px`);
    }

    root.classList.add('reveal-start', 'intro-wait', 'intro-centre');
    root.classList.remove('reveal-init');
    root.offsetHeight; // commit the start position before animating
    requestAnimationFrame(() => root.classList.remove('reveal-start'));
    setTimeout(() => root.classList.remove('intro-centre'), SPECTRUM_MS);
    setTimeout(() => root.classList.remove('intro-wait'), SPECTRUM_MS);

    // The count follows the divider's actual width, so it shares its easing, and travels with
    // its right end: centred at 0%, right aligned at the page edge (its resting place) at 100%.
    if (spectrum && loader && loaderText) {
      const count = () => {
        const side = parseFloat(getComputedStyle(spectrum).clipPath.split(' ')[1]) || 0;  // inset(0px 50%) → 50
        const p = root.classList.contains('intro-wait') ? 1 - side / 50 : 1;
        const pct = Math.round(p * 100);
        loaderText.textContent = `[${pct}%]`;
        loader.style.setProperty('--x', '0px');
        const { right, width } = loader.getBoundingClientRect();  // resting position
        const startRight = (vw + width) / 2;
        loader.style.setProperty('--x', `${(startRight + (right - startRight) * p) - right}px`);
        if (pct < 100) requestAnimationFrame(count);
      };
      requestAnimationFrame(count);
    }

    setTimeout(() => {
      lines.forEach(line => line.style.removeProperty('--d'));
      // Restore original markup unless a control changed its text meanwhile (e.g. [+] → [-]).
      blocks.forEach(({ el, html, text }) => {
        if (el.textContent.replace(/\s+/g, '') === text.replace(/\s+/g, '')) el.innerHTML = html;
      });
    }, SPECTRUM_MS + 2000);
  }

  /* ---------- Init ---------- */

  const fromHash = indexFromHash();
  loadNext();
  if (fromHash >= 0) {
    ensureLoaded(fromHash);
    requestAnimationFrame(() => sections[fromHash].scrollIntoView({ behavior: 'instant', block: 'start' }));
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  setActive(Math.max(fromHash, 0));
  document.fonts?.ready.then(layoutNav);
  intro();
})();
