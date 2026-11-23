import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { before, test } from 'node:test';

const originalPurples = /#(?:5b3df5|8a6cff|efebff|4a33c9|e9e4ff|ece9f7|dcd9ea|faf9ff)\b/i;
const colorLiteral = /#(?:[\da-f]{6}|[\da-f]{3})\b|rgba?\([^()]+\)/gi;
const [jsx, sourceCss] = await Promise.all([
  readFile(new URL('../app/page.js', import.meta.url), 'utf8'),
  readFile(new URL('../app/page.module.css', import.meta.url), 'utf8'),
]);

let servedCss;
let servedStyles;

before(async () => {
  const signal = AbortSignal.timeout(10_000);
  const page = await fetch('http://localhost:3000/', { signal });
  assert.equal(page.status, 200, 'Gatherly home page HTTP status');
  const html = await page.text();
  const stylesheet = html.match(/<link\b[^>]*\bhref="(\/_next\/static\/css\/app\/page\.css[^"]*)"/);
  assert.ok(stylesheet, 'The HTML links to the home page stylesheet');

  const response = await fetch(new URL(stylesheet[1], page.url), { signal });
  assert.equal(response.status, 200, 'Home page stylesheet HTTP status');
  assert.match(response.headers.get('content-type') ?? '', /^text\/css\b/);
  servedCss = await response.text();
  servedStyles = parseStyles(servedCss.replace(/\.page_(\w+?)__[\w-]+/g, '.$1'));
});

function parseRules(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selectors, block]) => {
    const declarations = new Map([...block.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)]
      .map(([, property, value]) => [property, value.trim()]));
    return selectors.split(',').map((selector) => [selector.trim(), declarations]);
  });
}

function parseStyles(css) {
  const media = new Map();
  // The page stylesheet uses top-level media queries with unnested style rules.
  const base = css.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^@media\s+([^\n{]+)\{([\s\S]*?)^}/gm, (_, query, block) => {
      media.set(query.trim(), parseRules(block));
      return '';
    });
  return { base: parseRules(base), media };
}

function property(rules, selector, name) {
  return rules.findLast(([rule, declarations]) => rule === selector && declarations.has(name))
    ?.[1].get(name);
}

function atWidth(selector, name, width) {
  const rules = [...servedStyles.base];
  for (const [query, overrides] of servedStyles.media) {
    const match = query.match(/^\((min|max)-width:\s*(\d+)px\)$/);
    if (!match) continue;
    const [, bound, pixels] = match;
    if (bound === 'min' ? width >= Number(pixels) : width <= Number(pixels)) {
      rules.push(...overrides);
    }
  }
  return property(rules, selector, name);
}

function rgba(literal) {
  if (literal.startsWith('#')) {
    let hex = literal.slice(1);
    if (hex.length === 3) hex = [...hex].map((digit) => digit.repeat(2)).join('');
    return [...hex.match(/../g).map((channel) => Number.parseInt(channel, 16)), 1];
  }
  const [red, green, blue, alpha = 1] = literal.slice(literal.indexOf('(') + 1, -1)
    .split(',').map(Number);
  return [red, green, blue, alpha];
}

function colors(rules, selector, name) {
  const declaration = property(rules, selector, name);
  assert.ok(declaration, `Expected ${selector} to declare ${name}`);
  const resolved = declaration.replace(/var\((--[\w-]+)\)/g, (_, token) => {
    const value = property(rules, '.page', token);
    assert.ok(value, `Expected .page to define ${token}`);
    return value;
  });
  const literals = resolved.match(colorLiteral);
  assert.ok(literals?.length, `Expected a color in ${selector} ${name} = ${declaration}`);
  return literals.map(rgba);
}

function composite([r, g, b, alpha], background) {
  return [r, g, b].map((channel, i) => channel * alpha + background[i] * (1 - alpha));
}

function luminance(rgb) {
  const [r, g, b] = rgb.slice(0, 3).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const a = luminance(composite(foreground, background));
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('the page source and served stylesheet contain no purple colors', () => {
  for (const [name, content] of [
    ['app/page.js', jsx], ['app/page.module.css', sourceCss], ['served page.css', servedCss],
  ]) {
    assert.doesNotMatch(content, originalPurples, `${name} contains a legacy purple`);
    assert.doesNotMatch(content, /\b(?:rebeccapurple|purple|indigo|darkviolet|violet)\b/i, name);
    for (const literal of content.match(colorLiteral) ?? []) {
      const [r, g, b] = rgba(literal);
      assert.ok(Math.min(r, b) <= g, `${name} contains purple ${literal}`);
    }
  }
});

test('accent declarations use green or lime in the source and served stylesheet', () => {
  const accents = [
    ['.logo', 'color'], ['.logoMark', 'background'], ['.logoMark', 'box-shadow'],
    ['.nav a:hover', 'color'], ['.nav .navButton', 'background'],
    ['.nav .navButton:hover', 'background'], ['.eyebrow', 'color'],
    ['.eyebrow', 'background'], ['.highlight', 'background'],
    ['.primaryButton', 'background'], ['.primaryButton:hover', 'background'],
    ['.secondaryButton', 'color'], ['.heroVisual', 'background'],
    ['.featuredLabel', 'color'], ['.chip:first-child', 'background'],
    ['.dateTile', 'background'], ['.dateTile', 'color'], ['.dateMonth', 'color'],
    ['.category', 'background'], ['.category', 'color'], ['.stepNumber', 'background'],
    ['.hostBanner', 'background'], ['.hostButton', 'background'],
    ['.hostButton:hover', 'background'], ['.footerLogo', 'color'],
  ];
  for (const [name, rules] of [['source', parseStyles(sourceCss).base], ['served', servedStyles.base]]) {
    for (const [selector, declaration] of accents) {
      for (const [r, g, b] of colors(rules, selector, declaration)) {
        assert.ok(g > r && g > b,
          `${name} ${selector} ${declaration} must be green or lime, found rgb(${r}, ${g}, ${b})`);
      }
    }
  }
});

test('landing-page text and button color pairs meet the 4.5:1 contrast threshold', () => {
  const { base } = parseStyles(sourceCss);
  const ink = (selector, fallback = selector) => {
    const rule = property(base, selector, 'color') ? selector : fallback;
    return colors(base, rule, 'color')[0];
  };
  const fill = (selector) => colors(base, selector, 'background')[0];
  const pageInk = ink('.page');
  const page = fill('.page');
  // Bound the translucent header even when dark content scrolls beneath it.
  const header = composite(fill('.header'), [0, 0, 0]);
  const [glow, ...hostStops] = colors(base, '.hostBanner', 'background');
  const pairs = [
    ['Page headings', pageInk, page],
    ['Header logo', ink('.logo'), header],
    ['Header links', ink('.nav a'), header],
    ['Header links on hover', ink('.nav a:hover'), header],
    ['Header button', ink('.nav .navButton'), fill('.nav .navButton')],
    ['Header button on hover', ink('.nav .navButton:hover'), fill('.nav .navButton:hover')],
    ['Eyebrow', ink('.eyebrow'), fill('.eyebrow')],
    ['Highlighted hero title', pageInk, fill('.highlight')],
    ['Subtitle', ink('.subtitle'), page],
    ['Primary button', ink('.primaryButton'), fill('.primaryButton')],
    ['Primary button on hover', ink('.primaryButton:hover', '.primaryButton'), fill('.primaryButton:hover')],
    ['Secondary button', ink('.secondaryButton'), fill('.secondaryButton')],
    ['Secondary button on hover', ink('.secondaryButton:hover', '.secondaryButton'), fill('.secondaryButton')],
    ['Featured event label', ink('.featuredLabel'), fill('.featuredCard')],
    ['Featured event title', pageInk, fill('.featuredCard')],
    ['Featured event details', ink('.featuredMeta'), fill('.featuredCard')],
    ['Featured event price', ink('.featuredPrice'), fill('.featuredCard')],
    ['Highlighted category chip', ink('.chip:first-child'), fill('.chip:first-child')],
    ['Date month', ink('.dateMonth'), fill('.dateTile')],
    ['Date day', ink('.dateTile'), fill('.dateTile')],
    ['Category pill', ink('.category'), fill('.category')],
    ['Event title', pageInk, fill('.card')],
    ['Event details', ink('.meta'), fill('.card')],
    ['Event price', ink('.price'), fill('.card')],
    ['Step number', ink('.stepNumber'), fill('.stepNumber')],
    ['Steps heading and titles', pageInk, fill('.stepsBand')],
    ['Step descriptions', ink('.meta'), fill('.stepsBand')],
    ['Host button', ink('.hostButton'), fill('.hostButton')],
    ['Host button on hover', ink('.hostButton:hover', '.hostButton'), fill('.hostButton:hover')],
    ['Footer copyright', ink('.footer'), page],
    ['Footer wordmark', ink('.footerLogo'), page],
  ];
  for (const stop of colors(base, '.heroVisual', 'background')) {
    pairs.push(['Category chip on hero gradient', ink('.chip'), stop]);
  }
  // Check the banner's gradient endpoints both bare and under the maximum glow.
  for (const stop of hostStops) {
    for (const background of [stop, composite(glow, stop)]) {
      pairs.push(['Host heading', ink('.hostBanner'), background]);
      pairs.push(['Host copy', ink('.hostText'), background]);
    }
  }

  const failures = pairs.flatMap(([label, foreground, background]) => {
    const ratio = contrast(foreground, background);
    const fg = foreground.slice(0, 3).join(', ');
    const bg = background.slice(0, 3).join(', ');
    return ratio >= 4.5 ? [] : [`${label}, rgb(${fg}) on rgb(${bg}): ${ratio.toFixed(3)}:1`];
  });
  assert.deepEqual(failures, [], 'Every text pair should reach 4.5:1');
});

test('the served hero and steps grids stack at their mobile breakpoints', () => {
  assert.equal(atWidth('.hero', 'display', 1280), 'grid');
  assert.match(atWidth('.hero', 'grid-template-columns', 901), /^minmax\([^)]+\)\s+minmax\([^)]+\)$/);
  for (const width of [900, 899, 375]) {
    assert.equal(atWidth('.hero', 'grid-template-columns', width), '1fr', `Hero at ${width}px`);
  }

  assert.equal(atWidth('.steps', 'display', 1280), 'grid');
  assert.match(atWidth('.steps', 'grid-template-columns', 721), /^repeat\(3,/);
  for (const width of [720, 719, 375]) {
    assert.equal(atWidth('.steps', 'grid-template-columns', width), '1fr', `Steps at ${width}px`);
  }
  assert.equal(atWidth('.step', 'padding-left', 375), '3.75rem');
  assert.equal(atWidth('.step:not(:last-child)::after', 'border-top', 375), '0');
  assert.match(atWidth('.step:not(:last-child)::after', 'border-left', 375), /dashed/);
});

test('event tracks fit the mobile section and the featured card loses its tilt on phones', () => {
  const viewport = 375;
  assert.equal(atWidth('.section', 'width', viewport), '100%');
  assert.equal(atWidth('.section', 'box-sizing', viewport), 'border-box');
  assert.equal(atWidth('.eventGrid', 'display', viewport), 'grid');
  const padding = atWidth('.section', 'padding', viewport).match(/^\S+ ([\d.]+)rem$/);
  assert.ok(padding, 'The section declares horizontal padding in rem');
  const availableWidth = viewport - 2 * Number(padding[1]) * 16;
  const tracks = atWidth('.eventGrid', 'grid-template-columns', viewport);
  const track = tracks.match(/^repeat\(auto-fit,\s*minmax\((\d+)px,\s*1fr\)\)$/);
  assert.ok(track, `Expected an auto-fitting event grid, found ${tracks}`);
  const minimumTrack = Number(track[1]);
  assert.ok(minimumTrack <= availableWidth && 2 * minimumTrack > availableWidth,
    `At ${viewport}px, exactly one ${minimumTrack}px minimum track should fit in ${availableWidth}px`);

  assert.match(atWidth('.featuredCard', 'transform', 481), /^rotate\(/);
  assert.equal(atWidth('.featuredCard', 'transform', 480), 'none');
  assert.equal(atWidth('.featuredCard', 'box-sizing', viewport), 'border-box');
  assert.equal(atWidth('.heroVisual', 'overflow', viewport), 'hidden');
  for (const selector of ['.headerInner', '.actions', '.chips', '.hostBanner', '.footerInner']) {
    assert.equal(atWidth(selector, 'flex-wrap', viewport), 'wrap', `${selector} at ${viewport}px`);
  }
});

test('the header is sticky from 720px and anchor targets receive extra clearance', () => {
  for (const width of [375, 719]) {
    assert.equal(atWidth('.header', 'position', width) ?? 'static', 'static', `Header at ${width}px`);
  }
  for (const width of [720, 721, 1280]) {
    assert.equal(atWidth('.header', 'position', width), 'sticky', `Header at ${width}px`);
    assert.equal(atWidth('.header', 'top', width), '0', `Header top at ${width}px`);
  }
  for (const selector of ['.section', '.stepsBand', '.hostBanner']) {
    assert.equal(atWidth(selector, 'scroll-margin-top', 719), '1rem', `${selector} on mobile`);
    assert.equal(atWidth(selector, 'scroll-margin-top', 720), '5rem', `${selector} with sticky header`);
  }
});

test('reduced-motion rules disable the new transitions and hover lifts', () => {
  const reducedMotion = servedStyles.media.get('(prefers-reduced-motion: reduce)');
  assert.ok(reducedMotion, 'The served stylesheet includes a reduced-motion media query');
  for (const selector of ['.page a', '.card']) {
    assert.equal(property(reducedMotion, selector, 'transition'), 'none', selector);
  }
  for (const selector of ['.primaryButton:hover', '.hostButton:hover', '.card:hover']) {
    assert.equal(property(reducedMotion, selector, 'transform'), 'none', selector);
  }
});
