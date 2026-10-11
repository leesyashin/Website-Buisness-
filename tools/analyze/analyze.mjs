// Referenz-Analyse: vermisst Websites, damit wir sehen, was gute Seiten gemeinsam haben.
//
//   node analyze.mjs                      alle URLs aus referenzen/sites.txt
//   node analyze.mjs https://example.com  nur diese URL(s)
//   node analyze.mjs --no-video …         ohne Scroll-Video (schneller)
//
// Pro Domain entsteht referenzen/<domain>/ mit
//   report.json      alle Messwerte (Technik, Schriften, Farben, Bewegung, Layout, Performance)
//   report.md        dieselben Werte lesbar
//   desktop-*.jpg    Screenshots beim Scrollen (1440 × 900)
//   mobile-*.jpg     Screenshots beim Scrollen (390 × 844)
//   scroll.webm      Video vom langsamen Durchscrollen am Desktop – zeigt die Animationen
// Danach: node summarize.mjs → referenzen/VERGLEICH.md

import { chromium } from 'playwright';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { libs } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outRoot = join(root, 'referenzen');
const args = process.argv.slice(2);
const withVideo = !args.includes('--no-video');
const urls = args.filter((a) => !a.startsWith('--'));

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const MAX_SHOTS = 14;

// Erkennt Bibliotheken auch dann, wenn sie in ein Bundle kompiliert sind (kein window.gsap o. ä.)
const SIGNATURES = [
  ['GSAP', /GreenSock|gsap\.registerPlugin|_gsScope|"gsap"/],
  ['ScrollTrigger', /ScrollTrigger/],
  ['SplitText', /SplitText/],
  ['Flip', /Flip\.getState/],
  ['Lenis', /lenis-smooth|new Lenis|lenis\.raf|\blenis\b/i],
  ['Locomotive Scroll', /LocomotiveScroll|locomotive-scroll/],
  ['Three.js', /WebGLRenderer|THREE\.REVISION|three\.module/],
  ['React Three Fiber', /@react-three\/fiber|useFrame\(/],
  ['Motion / Framer Motion', /framer-motion|motion-dom|useMotionValue/],
  ['Theatre.js', /@theatre\/core/],
  ['anime.js', /animejs|anime\.timeline/],
  ['Barba.js', /@barba\/core|barba\.init/],
  ['Swup', /new Swup|swup/i],
  ['Swiper', /swiper-wrapper|new Swiper/],
  ['Embla', /embla/i],
  ['Lottie', /lottie|bodymovin/i],
  ['Rive', /@rive-app|rive\.wasm/],
  ['Spline', /@splinetool/],
  ['Matter.js', /Matter\.Engine/],
  ['Highway', /@dogstudio\/highway/],
  ['Taxi.js', /@unseenco\/taxi/],
];

const executablePath = existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
  ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  : undefined;

const list = urls.length ? urls : await readSites();
if (!list.length) {
  console.error('Keine URLs. In referenzen/sites.txt eintragen (eine pro Zeile) oder als Argument übergeben.');
  process.exit(1);
}

const browser = await chromium.launch({ executablePath });
for (const url of list) {
  const slug = new URL(url).hostname.replace(/^www\./, '') + new URL(url).pathname.replace(/\/+$/, '').replace(/\//g, '_');
  const dir = join(outRoot, slug);
  await mkdir(dir, { recursive: true });
  process.stdout.write(`→ ${url} … `);
  try {
    const desktop = await measure(url, dir, 'desktop', DESKTOP);
    const mobile = await measure(url, dir, 'mobile', MOBILE);
    const report = { url, slug, measuredAt: new Date().toISOString(), desktop, mobile };
    await writeFile(join(dir, 'report.json'), JSON.stringify(report, null, 2));
    await writeFile(join(dir, 'report.md'), toMarkdown(report));
    console.log('ok');
  } catch (err) {
    console.log('FEHLER');
    console.error(`   ${err.message.split('\n')[0]}`);
    await writeFile(join(dir, 'error.txt'), String(err.stack || err));
  }
}
await browser.close();

async function readSites() {
  const file = join(outRoot, 'sites.txt');
  if (!existsSync(file)) return [];
  return (await readFile(file, 'utf8'))
    .split('\n')
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map((l) => (/^https?:\/\//.test(l) ? l : `https://${l}`));
}

async function measure(url, dir, kind, viewport) {
  const mobile = kind === 'mobile';
  const recordVideo = withVideo && !mobile ? { dir: join(dir, '.video'), size: viewport } : undefined;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'de-DE',
    userAgent: mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
      : undefined,
    recordVideo,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  const bundled = new Set();
  page.on('response', async (res) => {
    if (res.request().resourceType() !== 'script') return;
    const body = await res.text().catch(() => '');
    if (body.length > 8e6) return;
    for (const [name, re] of SIGNATURES) if (re.test(body)) bundled.add(name);
  });

  // Performance-Beobachter vor dem ersten Skript der Seite
  await page.addInitScript(() => {
    window.__ra = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__ra.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__ra.cls += e.value))).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500); // Intro-Animationen ablaufen lassen
  await dismissCookies(page);
  await page.waitForTimeout(800);

  const atLoad = await page.evaluate(() => ({ animations: document.getAnimations().length, cls: window.__ra?.cls || 0 }));
  await page.screenshot({ path: join(dir, `${kind}-00.jpg`), type: 'jpeg', quality: 70 });

  // Langsam durchscrollen wie ein Mensch (Mausrad), damit scroll-gekoppelte Szenen auslösen
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(viewport.height * 0.75);
  const shotsEvery = Math.max(1, Math.ceil(height / step / MAX_SHOTS));
  let shot = 1;
  for (let y = 0, i = 0; y < height - viewport.height && shot < MAX_SHOTS; y += step, i++) {
    for (let k = 0; k < 6; k++) {
      if (mobile) await page.evaluate((d) => window.scrollBy(0, d), step / 6);
      else await page.mouse.wheel(0, step / 6);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(700);
    if ((i + 1) % shotsEvery === 0) {
      await page.screenshot({ path: join(dir, `${kind}-${String(shot).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 70 });
      shot++;
    }
  }
  await page.waitForTimeout(600);

  const data = await page.evaluate(collect);
  data.motion.animationsAtLoad = atLoad.animations;
  data.perf.clsAtLoad = +atLoad.cls.toFixed(3);
  data.tech.bundledLibs = [...bundled];
  data.errors = errors;
  data.screenshots = shot;

  const video = page.video();
  await context.close();
  if (video) {
    await rename(await video.path(), join(dir, 'scroll.webm')).catch(() => {});
    await rm(join(dir, '.video'), { recursive: true, force: true });
  }
  return data;
}

async function dismissCookies(page) {
  const labels = [
    'Alle akzeptieren', 'Alles akzeptieren', 'Akzeptieren', 'Alle Cookies akzeptieren', 'Zustimmen', 'Einverstanden',
    'Accept all', 'Accept All', 'Accept', 'Allow all', 'I agree', 'Agree', 'Got it', 'OK',
  ];
  for (const frame of page.frames()) {
    for (const label of labels) {
      const btn = frame.getByRole('button', { name: label, exact: true }).first();
      if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
        await btn.click({ timeout: 2000 }).catch(() => {});
        return;
      }
    }
  }
}

// Läuft im Browser. Keine Closures über Modul-Variablen!
function collect() {
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const vh = innerHeight;
  const cs = (el) => getComputedStyle(el);
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = cs(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0;
  };
  const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const hex = (c) => {
    if (!c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c)) return null;
    if (cache.has(c)) return cache.get(c);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const v = a < 128 ? null : '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    cache.set(c, v);
    return v;
  };
  const scripts = $$('script[src]').map((s) => s.src);
  const html = document.documentElement;
  const has = (re) => scripts.some((s) => re.test(s));

  // ---------- Technik
  const tech = {
    generator: document.querySelector('meta[name="generator"]')?.content || null,
    framework: [
      window.__NEXT_DATA__ || has(/\/_next\//) ? 'Next.js' : null,
      window.__NUXT__ || has(/\/_nuxt\//) ? 'Nuxt' : null,
      document.querySelector('astro-island') || has(/\/_astro\//) ? 'Astro' : null,
      html.dataset.wfPage || html.hasAttribute('data-wf-site') ? 'Webflow' : null,
      document.querySelector('[data-framer-name], [data-framer-component-type]') || has(/framer(usercontent)?\.com/) ? 'Framer' : null,
      has(/wp-content|wp-includes/) ? 'WordPress' : null,
      window.Shopify ? 'Shopify' : null,
      has(/squarespace/) ? 'Squarespace' : null,
      has(/wixstatic|parastorage/) ? 'Wix' : null,
      document.querySelector('[data-reactroot], #__next, #root') ? 'React' : null,
      window.__VUE__ || document.querySelector('[data-v-app]') ? 'Vue' : null,
      document.querySelector('[class*="svelte-"]') ? 'Svelte' : null,
    ].filter(Boolean),
    motionLibs: [
      window.gsap ? `GSAP ${window.gsap.version || ''}`.trim() : has(/gsap/i) ? 'GSAP' : null,
      window.ScrollTrigger || has(/ScrollTrigger/i) ? 'ScrollTrigger' : null,
      window.SplitText || has(/SplitText/i) ? 'SplitText' : null,
      window.ScrollSmoother || document.querySelector('#smooth-wrapper') ? 'ScrollSmoother' : null,
      html.classList.contains('lenis') || window.Lenis || window.lenis || has(/lenis/i) ? 'Lenis' : null,
      document.querySelector('[data-scroll-container], .has-scroll-smooth') || has(/locomotive/i) ? 'Locomotive Scroll' : null,
      window.THREE || has(/three(\.module)?(\.min)?\.js/i) ? 'Three.js' : null,
      has(/ogl/i) ? 'OGL' : null,
      document.querySelector('spline-viewer') || has(/splinetool/i) ? 'Spline' : null,
      window.rive || has(/rive/i) ? 'Rive' : null,
      window.lottie || window.bodymovin || document.querySelector('lottie-player, dotlottie-player') ? 'Lottie' : null,
      document.querySelector('[data-barba]') || window.barba ? 'Barba.js' : null,
      window.swup || document.querySelector('#swup') ? 'Swup' : null,
      window.Swiper || document.querySelector('.swiper') ? 'Swiper' : null,
      document.querySelector('.splide') ? 'Splide' : null,
      document.querySelector('[data-aos]') ? 'AOS' : null,
      document.querySelector('[data-framer-appear-id], [style*="--framer"]') ? 'Framer Motion' : null,
      has(/motion(\.dev)?/i) && !window.gsap ? 'Motion' : null,
    ].filter(Boolean),
    webgl: $$('canvas').filter((c) => {
      try {
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    }).length,
    canvases: $$('canvas').length,
    scriptHosts: [...new Set(scripts.map((s) => { try { return new URL(s).hostname; } catch { return ''; } }))].filter(Boolean),
  };

  // ---------- CSS-Fähigkeiten (nur lesbare Stylesheets)
  let cssText = '';
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) cssText += rule.cssText + '\n';
    } catch {}
  }
  const css = {
    scrollDrivenAnimations: /animation-timeline|scroll-timeline|view-timeline/.test(cssText),
    viewTransitions: /view-transition/.test(cssText),
    reducedMotionRules: (cssText.match(/prefers-reduced-motion/g) || []).length,
    containerQueries: /@container/.test(cssText),
    clamp: (cssText.match(/clamp\(/g) || []).length,
    customProperties: new Set(cssText.match(/--[a-zA-Z0-9-]+(?=:)/g) || []).size,
    keyframes: (cssText.match(/@keyframes/g) || []).length,
    oklch: /oklch\(/.test(cssText),
    easings: [...new Set(cssText.match(/cubic-bezier\([^)]+\)/g) || [])].slice(0, 8),
  };

  // ---------- Typografie
  const typo = (...sels) => {
    const el = sels.map((sel) => $$(sel).find(visible)).find(Boolean);
    if (!el) return null;
    return describe(el);
  };
  const longest = (sel) => {
    const el = $$(sel).filter(visible).sort((a, b) => b.textContent.length - a.textContent.length)[0];
    return el ? describe(el) : null;
  };
  const describe = (el) => {
    const s = cs(el);
    return {
      text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
      family: s.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      size: s.fontSize,
      weight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      transform: s.textTransform,
    };
  };
  const loadedFonts = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))];
  const typography = {
    loadedFonts,
    h1: typo('h1'),
    h2: typo('h2'),
    body: longest('p'),
    button: typo('a[class*="button" i], a[class*="btn" i], button'),
    nav: typo('header nav a', 'nav a', 'header a'),
  };

  // ---------- Farben nach Fläche gewichtet
  const bg = new Map();
  const fg = new Map();
  for (const el of $$('body *')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const area = Math.min(r.width, innerWidth) * Math.min(r.height, vh * 3);
    const s = cs(el);
    const b = hex(s.backgroundColor);
    if (b) bg.set(b, (bg.get(b) || 0) + area);
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      const f = hex(s.color);
      if (f) fg.set(f, (fg.get(f) || 0) + (el.textContent.length || 1));
    }
  }
  const bodyBg = hex(cs(document.body).backgroundColor) || hex(cs(html).backgroundColor) || '#ffffff';
  const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => c);
  const colors = { pageBackground: bodyBg, backgrounds: top(bg, 8), text: top(fg, 6) };

  // ---------- Bewegung
  const all = $$('body *');
  const motion = {
    animationsAfterScroll: document.getAnimations().length,
    willChange: all.filter((el) => cs(el).willChange !== 'auto').length,
    transformed: all.filter((el) => cs(el).transform !== 'none').length,
    sticky: all.filter((el) => cs(el).position === 'sticky').length,
    fixed: all.filter((el) => cs(el).position === 'fixed' && visible(el)).length,
    pinSpacers: $$('.pin-spacer').length,
    splitTextNodes: $$('[class*="split" i], .word, .char, .line').length,
    videos: $$('video').map((v) => ({ autoplay: v.autoplay, muted: v.muted, loop: v.loop, src: (v.currentSrc || v.src || '').split('/').pop().slice(0, 60) })).slice(0, 6),
    cursorFollower: !!$$('[class*="cursor" i]').find((el) => cs(el).position === 'fixed'),
    marquee: !!document.querySelector('[class*="marquee" i], [class*="ticker" i]'),
  };

  // ---------- Layout & Inhalt
  const main = document.querySelector('main') || document.body;
  const sections = Array.from(main.children).filter((el) => el.getBoundingClientRect().height > 120);
  const firstViewportCtas = $$('a, button')
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return visible(el) && r.top + scrollY < vh && el.textContent.trim().length > 1 && el.textContent.trim().length < 40;
    })
    .filter((el) => {
      const s = cs(el);
      return hex(s.backgroundColor) || parseFloat(s.borderWidth) > 0;
    })
    .map((el) => el.textContent.trim().replace(/\s+/g, ' '))
    .slice(0, 5);
  const radii = new Map();
  for (const el of all) {
    const r = cs(el).borderTopLeftRadius;
    if (r !== '0px' && visible(el)) radii.set(r, (radii.get(r) || 0) + 1);
  }
  const imgs = $$('img');
  const layout = {
    pageHeightViewports: +(document.documentElement.scrollHeight / vh).toFixed(1),
    sections: sections.length,
    sectionHeightsVh: sections.slice(0, 20).map((s) => +(s.getBoundingClientRect().height / vh).toFixed(1)),
    navLinks: $$('header nav a, nav a').filter(visible).length,
    firstViewportCtas,
    headings: $$('h1, h2, h3').filter(visible).slice(0, 24).map((h) => `${h.tagName.toLowerCase()}: ${h.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)}`),
    words: (main.innerText || '').split(/\s+/).filter(Boolean).length,
    radii: top(radii, 4),
    images: imgs.length,
    lazyImages: imgs.filter((i) => i.loading === 'lazy').length,
    modernImageFormats: imgs.filter((i) => /\.(webp|avif)(\?|$)/i.test(i.currentSrc || '')).length,
    darkTheme: (() => {
      const m = bodyBg.match(/\w\w/g).map((h) => parseInt(h, 16));
      return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] < 100;
    })(),
  };

  // ---------- Performance
  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const perf = {
    domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    loadMs: nav ? Math.round(nav.loadEventEnd) : null,
    lcpMs: Math.round(window.__ra?.lcp || 0),
    cls: +(window.__ra?.cls || 0).toFixed(3),
    requests: res.length,
    transferKB: Math.round((res.reduce((a, r) => a + (r.transferSize || 0), 0) + (nav?.transferSize || 0)) / 1024),
    jsKB: Math.round(res.filter((r) => r.initiatorType === 'script').reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
  };

  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || null,
    lang: html.lang || null,
    tech,
    css,
    typography,
    colors,
    motion,
    layout,
    perf,
  };
}

function toMarkdown(r) {
  const d = r.desktop;
  const m = r.mobile;
  const t = (o) => (o ? `${o.family} · ${o.size} · ${o.weight} · LH ${o.lineHeight} · LS ${o.letterSpacing}${o.transform !== 'none' ? ' · ' + o.transform : ''}` : '–');
  const sw = (c) => `\`${c}\``;
  return `# ${d.title || r.slug}

${r.url} · gemessen ${r.measuredAt.slice(0, 10)}${d.description ? `\n\n> ${d.description}` : ''}

## Technik
- Framework/CMS: ${d.tech.framework.join(', ') || '–'}${d.tech.generator ? ` (Generator: ${d.tech.generator})` : ''}
- Bewegung: ${libs(d).join(', ') || 'keine Bibliothek erkannt'}
- WebGL-Canvas: ${d.tech.webgl} · Canvas gesamt: ${d.tech.canvases}
- CSS: Scroll-driven Animations ${d.css.scrollDrivenAnimations ? 'ja' : 'nein'} · View Transitions ${d.css.viewTransitions ? 'ja' : 'nein'} · reduced-motion-Regeln ${d.css.reducedMotionRules} · clamp() ${d.css.clamp}× · Custom Properties ${d.css.customProperties} · @keyframes ${d.css.keyframes}${d.css.oklch ? ' · OKLCH' : ''}
- Easing-Kurven: ${d.css.easings.map(sw).join(' ') || '–'}

## Typografie
- Geladene Schriften: ${d.typography.loadedFonts.join(', ') || '–'}
- H1: ${t(d.typography.h1)}${d.typography.h1 ? `\n  „${d.typography.h1.text}“` : ''}
- H2: ${t(d.typography.h2)}
- Fließtext: ${t(d.typography.body)}
- Button: ${t(d.typography.button)}
- Navigation: ${t(d.typography.nav)}
- H1 mobil: ${m.typography.h1 ? m.typography.h1.size : '–'} · Fließtext mobil: ${m.typography.body ? m.typography.body.size : '–'}

## Farbe
- Seitenhintergrund: ${sw(d.colors.pageBackground)} (${d.layout.darkTheme ? 'dunkel' : 'hell'})
- Flächen: ${d.colors.backgrounds.map(sw).join(' ')}
- Text: ${d.colors.text.map(sw).join(' ')}

## Bewegung
- Animationen beim Laden / nach dem Scrollen: ${d.motion.animationsAtLoad} / ${d.motion.animationsAfterScroll}
- Angeheftete Abschnitte (pin-spacer): ${d.motion.pinSpacers} · sticky: ${d.motion.sticky} · fixed: ${d.motion.fixed}
- Elemente mit transform: ${d.motion.transformed} · will-change: ${d.motion.willChange} · Split-Text-Knoten: ${d.motion.splitTextNodes}
- Eigener Cursor: ${d.motion.cursorFollower ? 'ja' : 'nein'} · Laufband: ${d.motion.marquee ? 'ja' : 'nein'}
- Videos: ${d.motion.videos.length ? d.motion.videos.map((v) => `${v.src || 'ohne src'}${v.autoplay ? ' (autoplay' + (v.loop ? ', loop' : '') + ')' : ''}`).join(', ') : '–'}

## Layout & Inhalt
- Seitenlänge: ${d.layout.pageHeightViewports} Bildschirmhöhen (mobil ${m.layout.pageHeightViewports}) · Abschnitte: ${d.layout.sections}
- Abschnittshöhen (vh): ${d.layout.sectionHeightsVh.join(' · ')}
- Navigationslinks: ${d.layout.navLinks} · CTAs im ersten Bild: ${d.layout.firstViewportCtas.map((c) => `„${c}“`).join(', ') || '–'}
- Wörter: ${d.layout.words} · Bilder: ${d.layout.images} (lazy ${d.layout.lazyImages}, WebP/AVIF ${d.layout.modernImageFormats}) · Radien: ${d.layout.radii.join(', ') || 'eckig'}

### Gliederung
${d.layout.headings.map((h) => `- ${h}`).join('\n') || '–'}

## Performance (Desktop, Cloud-Messung, nur als Richtwert)
- LCP ${d.perf.lcpMs} ms · CLS beim Laden ${d.perf.clsAtLoad} · DOMContentLoaded ${d.perf.domContentLoadedMs} ms · load ${d.perf.loadMs} ms
- ${d.perf.requests} Anfragen · ${d.perf.transferKB} KB übertragen · davon JS ${d.perf.jsKB} KB
${d.errors.length ? `\n## JS-Fehler\n${d.errors.map((e) => `- ${e}`).join('\n')}\n` : ''}
## Screenshots
Desktop: ${Array.from({ length: d.screenshots }, (_, i) => `[${i}](desktop-${String(i).padStart(2, '0')}.jpg)`).join(' ')}
Mobil: ${Array.from({ length: m.screenshots }, (_, i) => `[${i}](mobile-${String(i).padStart(2, '0')}.jpg)`).join(' ')}${existsSync(join(outRoot, r.slug, 'scroll.webm')) ? '\nScroll-Video: [scroll.webm](scroll.webm)' : ''}

## Qualitative Bewertung
_Nach dem Ansehen von Screenshots und Video ausfüllen, Raster siehe docs/REFERENZ-RASTER.md._
`;
}
