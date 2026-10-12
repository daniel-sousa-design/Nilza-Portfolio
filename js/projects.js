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
 * `subtitle` shows under the title in the nav while the project is active; pass an array
 * for several lines.
 *
 * Projects with no `rows` show placeholder tiles until images are added.
 */
const SOF = 'assets/img/space-of-freedom/';
const SF = 'assets/img/space-fictions/';
const LU = 'assets/img/looking-up/';
const SA = 'assets/img/solvitur-ambulando/';
const AEP = 'assets/img/art-in-the-public-space/';
const PG = 'assets/img/playground/';

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
      { layout: 'full', items: [{ src: SOF + '14.jpg', ratio: 1600 / 1067, alt: 'Exhibition view through the perforated metal screens' }] },
      { layout: 'full', items: [{ src: SOF + '13.jpg', ratio: 732 / 488, alt: 'Exhibition graphics', crop: { w: 120.36, h: 120.36, l: -10.68, t: -7.13 } }] }
    ]
  },
  {
    slug: 'space-fictions',
    title: 'Space Fictions',
    subtitle: ['With Ana Resende Studio', '[Award] AIGA’s 50 Books | 50 Covers'],
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
  {
    slug: 'solvitur-ambulando',
    title: 'Solvitur Ambulando',
    year: '2022',
    categories: ['Editorial'],
    rows: [
      { layout: 'full', items: [{ src: SA + 'cover.jpg', ratio: 16 / 9, alt: 'Solvitur Ambulando I, cover and spine' }] },
      { layout: 'full', items: [{ src: SA + 'spines.jpg', ratio: 16 / 9, alt: 'A row of Solvitur Ambulando spines' }] },
      {
        layout: 'cols',
        items: [
          { src: SA + 'spread-footprints.jpg', ratio: 16 / 9, alt: 'Spread: O caminhante hábil não deixa marcas, footprints' },
          { src: SA + 'spread-eruption.jpg', ratio: 16 / 9, alt: 'Spread: volcanic eruption photographs' }
        ]
      },
      { layout: 'full', items: [{ src: SA + 'spread-text.jpg', ratio: 16 / 9, alt: 'Text spread with numbered quotations on walking' }] }
    ]
  },
  {
    slug: 'art-in-the-public-space',
    title: 'Art in the public space',
    year: '2023',
    categories: ['Editorial', 'Experiential Design', 'Social Media'],
    rows: [
      ['poster-street', 'Arte em Espaço Público exhibition poster on a concrete wall'],
      ['overview', 'Poster, leaflet, social media posts, book covers, spines and map spread'],
      ['books', 'Vol. 1 covers, spines and opening spreads'],
      ['spreads-matter', 'Matéria spreads: material swatches and textures'],
      ['spreads-place-form', 'Lugar, Forma and Tempo spreads: maps, silhouettes and timelines']
    ].map(([file, alt]) => ({ layout: 'full', items: [{ src: AEP + file + '.jpg', ratio: 16 / 9, alt }] }))
  },
  { slug: 'missed-connections', title: 'Missed Connections', year: '2021', categories: ['Editorial'] },
  { slug: 'albana-lima', title: 'Albana Lima', year: '2023', categories: ['Branding', 'merchandising'] },
  {
    slug: 'looking-up',
    title: 'Looking Up An Atlas of constellations',
    year: '2021',
    categories: ['Editorial'],
    rows: [
      { layout: 'full', items: [{ src: LU + 'cover-looking-up.jpg', ratio: 2600 / 1447, alt: 'Looking Up: An Atlas of Constellations, fore-edge, back cover, spine and front cover' }] },
      { layout: 'full', items: [{ src: LU + 'photo-covers.jpg', ratio: 3 / 2, alt: 'Looking Up and Looking In on metal steps in the sun' }] },
      {
        layout: 'cols',
        items: [
          { src: LU + 'photo-latitudes.jpg', ratio: 3 / 2, alt: 'Open on the observation latitudes spread' },
          { src: LU + 'photo-star-data.jpg', ratio: 3 / 2, alt: 'Open on a star data spread' }
        ]
      },
      ...[
        ['01', 'Opening quote: As above, so below', '02', 'Astronomy plates'],
        ['03', 'Timeline of astronomy', '04', 'Database of the northern hemisphere'],
        ['05', 'Constellation maps: Lyra and Mensa', '06', 'Constellation boundaries'],
        ['07', 'Constellations’ observation calendar', '08', 'Constellations’ observation latitudes'],
        ['09', 'Observation charts', '10', 'Typology of stars'],
        ['11', 'Constellations’ area', '12', 'Constellations’ planetary systems'],
        ['13', 'Star distances in light years', '14', 'Star charts by constellation'],
        ['15', 'Planetary systems by spectral class', '16', 'Glossary']
      ].map(([a, altA, b, altB]) => ({
        layout: 'cols',
        items: [
          { src: LU + `spread-${a}.jpg`, ratio: 2000 / 1429, alt: altA },
          { src: LU + `spread-${b}.jpg`, ratio: 2000 / 1429, alt: altB }
        ]
      })),
      { layout: 'full', items: [{ src: LU + 'spread-17.jpg', ratio: 2000 / 1429, alt: 'Star data tables' }] },
      { layout: 'full', items: [{ src: LU + 'cover-looking-in.jpg', ratio: 2600 / 1488, alt: 'Looking In: A Reading of Stars, fore-edge, back cover, spine and front cover' }] }
    ]
  },
  {
    slug: 'playground',
    title: 'Playground',
    year: '∞',
    categories: ['Creative Direction'],
    rows: [
      // From OPO to NYC: risograph cards sent to New York studios
      {
        layout: 'cols',
        items: [
          { src: PG + 'nyc-post-3.jpg', ratio: 1, alt: 'From OPO to NYC cards in white, green, orange and pink' },
          { src: PG + 'nyc-post-4.jpg', ratio: 1, alt: 'From OPO to NYC cards in orange, magenta, pink and green' }
        ]
      },
      { layout: 'full', items: [{ src: PG + 'nyc-img-7559.jpg', ratio: 4 / 3, alt: 'A stack of From OPO to NYC cards' }] },
      {
        layout: 'cols',
        items: [
          { src: PG + 'nyc-img-7556.jpg', ratio: 3 / 4, alt: 'Printed sheets of cards on the print-shop table' },
          { src: PG + 'nyc-img-8551.jpg', ratio: 3 / 4, alt: 'A pink card left in a door mail slot' }
        ]
      }
    ]
  }
];
