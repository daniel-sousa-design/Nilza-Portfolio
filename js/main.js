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
  const root = document.documentElement;
  const sections = [];
  const navRows = [];
  let active = -1;
  let travelling = null;  // index of the project a nav click / back-to-top is scrolling to

  // Reloads start at the top, not at a stale offset (see Init).
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

  /* ---------- Dark mode ---------- */

  const themeToggle = document.querySelector('.topbar__theme');
  function setTheme(dark) {
    if (dark) root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    themeToggle.textContent = dark ? '[Light]' : '[Dark]';
    themeToggle.setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  }
  themeToggle.addEventListener('click', () => setTheme(root.dataset.theme !== 'dark'));
  if (root.dataset.theme === 'dark') {
    themeToggle.textContent = '[Light]';
    themeToggle.setAttribute('aria-pressed', 'true');
  }

  /* ---------- Info toggle ---------- */

  // Text leaves and arrives line by line, like the page-load intro: closing slides the lines
  // up out of view (bottom first) while the panel folds; opening unfolds it while the lines
  // slide down into place (top first). The fold is timed to the wave, so the divider below
  // travels with the text.
  const LINE_MS = 550;  // .reveal__in transition after the intro (css: .intro-done .info .reveal__in)
  const ROW_STEP_MS = 45;  // each row of text starts this long after the one above…
  const WAVE_MAX_MS = 700; // …squeezed so the whole wave never takes longer than this
  const LEAN_MS = 60;      // slight left-to-right lean within a row
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

  // Stagger by visual row: lines side by side (other columns) move together, each row after
  // the one above (opening) or below (closing). Returns the wave's length in ms.
  function waveInfo(reverse) {
    const vw = window.innerWidth;
    const lines = [...info.querySelectorAll('.reveal__in')].map(el => {
      const r = el.getBoundingClientRect();
      return { el, top: r.top, x: r.left / vw };
    });
    const rows = [];
    [...new Set(lines.map(l => Math.round(l.top)))].sort((a, b) => a - b).forEach(t => {
      if (!rows.length || t - rows[rows.length - 1] > 4) rows.push(t);
    });
    const rowOf = top => rows.findIndex((t, i) => i === rows.length - 1 || top < (t + rows[i + 1]) / 2);
    const step = Math.min(ROW_STEP_MS, WAVE_MAX_MS / Math.max(rows.length - 1, 1));
    lines.forEach(({ el, top, x }) => {
      const i = rowOf(top);
      const d = reverse ? (rows.length - 1 - i) * step + (1 - x) * LEAN_MS : i * step + x * LEAN_MS;
      el.style.setProperty('--d', `${Math.round(d)}ms`);
    });
    return (rows.length - 1) * step + LEAN_MS;
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

    splitInfo();
    info.classList.add('is-folding');
    const total = waveInfo(open) + LINE_MS;  // first line starts → last line lands
    if (open) {
      info.style.setProperty('--fold-ms', `${total}ms`);
      info.style.setProperty('--fold-delay', '0ms');
      info.classList.add('is-hiding', 'is-collapsed');
      setTimeout(() => {
        if (run === infoRun) restoreInfo();  // once folded away
      }, total + 100);
    } else {
      info.style.setProperty('--fold-ms', `${total - 150}ms`);
      info.style.setProperty('--fold-delay', '80ms');
      info.classList.add('is-hiding');
      info.querySelectorAll('.reveal__in').forEach(l => { l.style.transition = 'none'; });
      info.offsetHeight;  // lines start above their cut line
      info.querySelectorAll('.reveal__in').forEach(l => { l.style.transition = ''; });
      info.classList.remove('is-collapsed');
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
    if (!root.classList.contains('reveal-init')) {
      root.classList.add('intro-done');
      return;
    }

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
    // holds there for a beat at [100%], the count slides out, and only then the divider moves
    // into place as the text wave and the images start.
    // Played with the Web Animations API on one clock, so the steps can't overlap.
    const OPEN_MS = 1200;
    const OPEN_EASE = 'cubic-bezier(0.87, 0, 0.13, 1)';  // very slow start
    const HOLD_MS = 200;
    const COUNT_OUT_MS = 500;
    const PAUSE_MS = 250;           // still beat between the count leaving and the divider moving
    const EASE = getComputedStyle(root).getPropertyValue('--ease').trim() || 'ease-in-out';
    const SPECTRUM_MS = OPEN_MS + HOLD_MS + COUNT_OUT_MS + PAUSE_MS;  // divider starts moving
    const spectrum = document.querySelector('.spectrum');
    const loader = document.querySelector('.loader');
    const loaderText = document.querySelector('.loader .reveal__in');

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // From the middle of the window the divider travels to its place. If that place is higher up
    // (e.g. a phone with the info panel closed), everything below it waits until it has landed,
    // so the divider never slides through the project nav or the images.
    const MOVE_MS = 900;
    let restTop = Infinity;
    let belowAt = SPECTRUM_MS;
    let dy = 0;
    if (spectrum) {
      const r = spectrum.getBoundingClientRect();
      dy = Math.round(vh / 2 - (r.top + r.height / 2));
      restTop = r.top;
      if (dy > 0) belowAt = SPECTRUM_MS + MOVE_MS * 0.8;  // resting place is above the middle
    }

    // Delay each line by its position on screen: top-to-bottom wave, slight left-to-right lean.
    const lines = document.querySelectorAll('.topbar .reveal__in, .info .reveal__in, .projects-nav .reveal__in');
    lines.forEach(line => {
      const r = line.getBoundingClientRect();
      const start = r.top > restTop ? belowAt : SPECTRUM_MS;
      const d = start + Math.min(Math.max(r.top, 0), vh) / vh * 700 + r.left / vw * 150;
      line.style.setProperty('--d', `${Math.round(d)}ms`);
    });

    // 1. open in the middle  2. hold  3. count slides out  4. pause  5. glide into place
    let open = null;
    if (spectrum) {
      open = spectrum.animate(
        [{ clipPath: 'inset(0 50%)' }, { clipPath: 'inset(0 0)' }],
        { duration: OPEN_MS, easing: OPEN_EASE });
      spectrum.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
        { duration: MOVE_MS, delay: SPECTRUM_MS, easing: EASE, fill: 'backwards' });
    }
    if (loader && loaderText) {
      loader.style.visibility = 'visible';
      loaderText.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }],
        { duration: COUNT_OUT_MS, delay: OPEN_MS + HOLD_MS, easing: EASE, fill: 'both' })
        .finished.then(() => { loader.style.visibility = ''; });
    }

    root.classList.add('reveal-start', 'intro-wait');
    root.classList.remove('reveal-init');
    root.offsetHeight; // commit the start position before animating
    requestAnimationFrame(() => root.classList.remove('reveal-start'));
    setTimeout(() => root.classList.remove('intro-wait'), belowAt);

    // The count reads the opening's eased progress, and travels with the divider's right end:
    // centred at 0%, right aligned at the page edge (its resting place) at 100%.
    if (spectrum && loader && loaderText) {
      const count = () => {
        const progress = open?.effect.getComputedTiming().progress;
        const p = progress == null ? 1 : progress;  // null once the opening has finished
        const pct = Math.round(p * 100);
        loaderText.textContent = `[${pct}%]`;
        loader.style.setProperty('--x', '0px');
        const { right, width } = loader.getBoundingClientRect();  // resting position
        const startRight = (vw + width) / 2;
        loader.style.setProperty('--x', `${(startRight + (right - startRight) * p) - right}px`);
        // stay pinned above the divider while it travels, until the count has slid out
        const r = spectrum.getBoundingClientRect();
        loader.style.setProperty('--y', `${r.top - (vh - r.height) / 2}px`);
        if (performance.now() < countEnd) requestAnimationFrame(count);
      };
      const countEnd = performance.now() + SPECTRUM_MS + MOVE_MS + 100;
      requestAnimationFrame(count);
    }

    setTimeout(() => {
      lines.forEach(line => line.style.removeProperty('--d'));
      // Restore original markup unless a control changed its text meanwhile (e.g. [+] → [-]).
      blocks.forEach(({ el, html, text }) => {
        if (el.textContent.replace(/\s+/g, '') === text.replace(/\s+/g, '')) el.innerHTML = html;
      });
      root.classList.add('intro-done');
    }, belowAt + 2000);
  }

  /* ---------- Init ---------- */

  // On phones the info panel starts closed ([+]); set before first paint, so no fold plays.
  if (window.matchMedia('(max-width: 800px)').matches) {
    info.style.transition = 'none';
    info.classList.add('is-collapsed');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '[+]';
    info.offsetHeight;
    info.style.transition = '';
  }

  // A reload always starts from the top; only a fresh visit to a #project link jumps there.
  const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  if (isReload && location.hash) history.replaceState(null, '', location.pathname + location.search);
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
