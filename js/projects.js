/*
 * Project data. Order here = order in the nav and the scroll sequence.
 *
 * Each project has `rows`, rendered top to bottom. Row layouts:
 *   full     one image across the full width
 *   cols     `items` side by side in equal columns (set `gap: false` for a seamless strip,
 *            `inset: true` to pull the row in slightly from the page edge)
 *   feature  one tall image on the left, two stacked on the right
 *
 * Each item: { src, ratio, alt, fit?, bg?, crop? }
 *   ratio  box width / height (taken from the Figma frame)
 *   fit    "cover" (default) or "contain"
 *   bg     background behind a contained image
 *   crop   { w, h, l, t } in % — exact Figma crop of the image inside its box
 *
 * Projects with no `rows` show placeholder tiles until images are added.
 */
const SOF = 'assets/img/space-of-freedom/';
const SF = 'assets/img/space-fictions/';

window.PROJECTS = [
  {
    slug: 'space-of-freedom',
    title: 'What’s a space of freedom?',
    subtitle: 'With Pedro Meireis',
    year: '2024',
    categories: ['Branding', 'Experiential Design', 'Editorial'],
    rows: [
      {
        layout: 'feature',
        items: [
          { src: SOF + '03.jpg', alt: 'Exhibition view', crop: { w: 106.59, h: 100, l: -1.95, t: 0 } },
          { src: SOF + '01.jpg', ratio: 743 / 495.33, alt: 'Exhibition graphics', crop: { w: 120.36, h: 120.36, l: -10.68, t: -7.13 } },
          { src: SOF + '02.jpg', ratio: 743 / 484, alt: 'Exhibition detail', crop: { w: 100, h: 102.34, l: 0, t: 0 } }
        ]
      },
      { layout: 'full', items: [{ src: SOF + 'screenshot.png', ratio: 1496 / 748.06, alt: 'Book spread' }] },
      { layout: 'full', items: [{ src: SOF + '04.jpg', ratio: 1496 / 862.85, alt: 'Book cover', fit: 'contain', bg: '#000' }] },
      {
        layout: 'cols', gap: false,
        items: ['05', '06', '07', '08'].map(n => ({ src: SOF + n + '.jpg', ratio: 374 / 293.57, alt: 'Book spread' }))
      },
      {
        layout: 'cols',
        items: ['09', '10'].map(n => ({ src: SOF + n + '.jpg', ratio: 743 / 583.21, alt: 'Book spread' }))
      },
      {
        layout: 'cols',
        items: ['11', '12'].map(n => ({ src: SOF + n + '.jpg', ratio: 743 / 583.21, alt: 'Book spread' }))
      },
      {
        layout: 'cols', gap: false, inset: true,
        items: ['1', '2', '3', '4'].map(n => ({ src: SOF + 'mam-' + n + '.jpg', ratio: 379.8 / 755.64, alt: 'Social media post' }))
      },
      {
        layout: 'cols', inset: true,
        items: [
          { src: SOF + '13.jpg', ratio: 732 / 488, alt: 'Exhibition graphics', crop: { w: 120.36, h: 120.36, l: -10.68, t: -7.13 } },
          null
        ]
      }
    ]
  },
  {
    slug: 'space-fictions',
    title: 'Space Fictions',
    year: '2025',
    categories: ['Editorial'],
    rows: [
      { layout: 'full', items: [{ src: SF + 'covers-thx.jpg', ratio: 3, alt: 'THX 1138 cover and fold-out', crop: { w: 100, h: 300, l: 0, t: -44.8 } }] },
      {
        layout: 'cols',
        items: [
          { src: SF + 'covers-detail.jpg', ratio: 1440 / 1794, alt: 'Booklet covers' },
          { src: SF + 'spines.jpg', ratio: 1080 / 1346, alt: 'Booklet spines' }
        ]
      },
      {
        layout: 'cols',
        items: [
          { src: SF + 'covers-cq-solaris.jpg', ratio: 1, alt: 'CQ and Solaris covers and fold-outs' },
          { src: SF + 'covers-caligari-malkovich.jpg', ratio: 1, alt: 'Das Cabinet des Dr. Caligari and Being John Malkovich covers and fold-outs' }
        ]
      },
      {
        layout: 'cols',
        items: [
          { src: SF + 'project-spread.jpg', ratio: 1, alt: 'Project drawings spread' },
          { src: SF + 'thx-foldout.jpg', ratio: 1, alt: 'THX 1138 fold-out' }
        ]
      },
      {
        layout: 'cols',
        items: [
          { src: SF + 'spreads-cq.jpg', ratio: 1, alt: 'CQ booklet spreads' },
          { src: SF + 'spreads-caligari.jpg', ratio: 1, alt: 'Das Cabinet des Dr. Caligari booklet spreads' }
        ]
      }
    ]
  },
  { slug: 'malibu-ski-league', title: 'Malibu Ski League', year: '2024', categories: ['Branding', 'merchandising'] },
  { slug: 'solvitur-ambulando', title: 'Solvitur Ambulando', year: '2022', categories: ['Editorial'] },
  { slug: 'art-in-the-public-space', title: 'Art in the public space', year: '2023', categories: ['Editorial', 'Experiential Design', 'Social Media'] },
  { slug: 'missed-connections', title: 'Missed Connections', year: '2021', categories: ['Editorial'] },
  { slug: 'albana-lima', title: 'Albana Lima', year: '2023', categories: ['Branding', 'merchandising'] },
  { slug: 'looking-up', title: 'Looking Up An Atlas of constellations', year: '2021', categories: ['Editorial'] },
  { slug: 'playground', title: 'Playground', year: '∞', categories: ['Creative Direction'] }
];
