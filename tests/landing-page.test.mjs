import assert from 'node:assert/strict';
import { before, test } from 'node:test';

const events = [
  ['Design Systems Meetup', 'Dec', '4', '18:30 · Milan', 'Tech', 'Free'],
  ['Sunset Jazz on the Rooftop', 'Dec', '9', '20:00 · Rome', 'Music', '€25'],
  ['Startup Founders Breakfast', 'Dec', '12', '08:00 · Online', 'Business', '€10'],
];

const steps = [
  ['1', 'Discover', 'Browse concerts, meetups and workshops happening near you.'],
  ['2', 'Book', 'Reserve your spot in a couple of clicks and get your ticket by email.'],
  ['3', 'Show up', 'Meet people who share your interests and enjoy the event.'],
];

let body;
let header;
let sections;
let footer;

before(async () => {
  const response = await fetch('http://localhost:3000/', {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200, 'Gatherly home page HTTP status');
  const html = await response.text();
  body = elementContents(html, 'body')[0]?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.ok(body, 'The response includes server-rendered body markup');
  [header] = elementContents(body, 'header');
  [footer] = elementContents(body, 'footer');
  const [main] = elementContents(body, 'main');
  assert.ok(header && main && footer, 'The page contains a header, main, and footer');
  sections = [...main.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
});

function elementContents(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))]
    .map(([, content]) => content);
}

function visibleText(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classText(html, tag, className) {
  // The CSS module suffix can change when Next.js rebuilds the stylesheet.
  const element = new RegExp(
    `<${tag}\\b[^>]*\\bclass="[^"]*\\bpage_${className}__[\\w-]+\\b[^"]*"[^>]*>` +
    `([\\s\\S]*?)</${tag}>`,
  );
  const match = html.match(element);
  assert.ok(match, `Expected ${tag}.${className} in the rendered markup`);
  return visibleText(match[1]);
}

function section(id) {
  const match = sections.find(([, attributes]) => attributes.includes(` id="${id}"`));
  assert.ok(match, `Expected section #${id}`);
  return match[2];
}

function fragmentLinks(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="#([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(([, id, label]) => [visibleText(label), id]);
}

test('the Gatherly sections, hero copy, host invitation, and footer are served in order', () => {
  assert.equal(classText(header, 'span', 'logoMark'), '');
  assert.match(visibleText(header), /^Gatherly\b/);
  assert.deepEqual(sections.map(([, attributes]) => attributes.match(/\bid="([^"]+)"/)?.[1]),
    [undefined, 'events', 'how-it-works', 'host']);
  assert.match(sections[0][1], /\bclass="page_hero__[\w-]+"/);

  const hero = sections[0][2];
  assert.deepEqual(elementContents(hero, 'h1').map(visibleText), [
    'Find events worth showing up for',
  ]);
  assert.equal(classText(hero, 'p', 'eyebrow'), 'Your city, your events');
  assert.equal(classText(hero, 'p', 'subtitle'),
    'Gatherly brings together the best concerts, meetups and workshops in one place, so you can spend less time searching and more time enjoying.');
  assert.deepEqual(elementContents(section('events'), 'h2').map(visibleText), ['Upcoming events']);

  const host = section('host');
  assert.deepEqual(elementContents(host, 'h2').map(visibleText), ['Organizing something?']);
  assert.equal(classText(host, 'p', 'hostText'),
    'Publish your event on Gatherly and reach people who want to attend.');
  assert.deepEqual(fragmentLinks(host), [['Host an event', 'host']]);
  assert.match(visibleText(footer), /© 2026 Gatherly\. All rights reserved\.$/);
});

test('upcoming event cards keep their details and split single- and two-digit dates', () => {
  const upcoming = section('events');
  assert.match(upcoming, /<div class="page_eventGrid__[\w-]+">\s*<article\b/);
  const cards = elementContents(upcoming, 'article');
  const details = cards.map((card) => [
    classText(card, 'h3', 'cardTitle'),
    classText(card, 'span', 'dateMonth'),
    classText(card, 'span', 'dateDay'),
    classText(card, 'p', 'meta'),
    classText(card, 'span', 'category'),
    classText(card, 'p', 'price'),
  ]);
  assert.deepEqual(details, events);
});

test('how it works serves the three numbered steps in order', () => {
  const howItWorks = section('how-it-works');
  assert.deepEqual(elementContents(howItWorks, 'h2').map(visibleText), ['How it works']);
  assert.match(howItWorks, /<ol class="page_steps__[\w-]+">/);
  const lists = elementContents(howItWorks, 'ol');
  assert.equal(lists.length, 1, 'The steps form one ordered list');
  assert.deepEqual(elementContents(lists[0], 'li').map((step) => [
    classText(step, 'span', 'stepNumber'),
    classText(step, 'h3', 'stepTitle'),
    classText(step, 'p', 'meta'),
  ]), steps);
});

test('the new hero panel features the first upcoming event and the category chips', () => {
  const hero = sections[0][2];
  const panel = hero.match(/<div\b[^>]*class="page_heroVisual__[\w-]+"[^>]*>/);
  assert.ok(panel, 'The hero has a separate visual panel');
  assert.ok(hero.indexOf('</h1>') < panel.index, 'The hero copy precedes the featured panel');
  assert.match(panel[0], /\baria-hidden="true"/, 'The duplicate event panel is decorative');
  const featured = hero.slice(panel.index);
  assert.equal(classText(featured, 'span', 'featuredLabel'), 'Next up');
  assert.deepEqual([
    classText(featured, 'p', 'featuredTitle'),
    classText(featured, 'span', 'dateMonth'),
    classText(featured, 'span', 'dateDay'),
    classText(featured, 'p', 'featuredMeta'),
    classText(featured, 'span', 'category'),
    classText(featured, 'span', 'featuredPrice'),
  ], events[0]);
  const chips = [...featured.matchAll(/<span class="page_chip__[\w-]+">([^<]+)<\/span>/g)];
  assert.deepEqual(chips.map(([, label]) => label), events.map((event) => event[4]));
});

test('header and hero links point to their intended sections and every fragment resolves uniquely', () => {
  const [nav] = elementContents(header, 'nav');
  assert.ok(nav, 'The header contains navigation');
  assert.deepEqual(fragmentLinks(nav), [
    ['Events', 'events'],
    ['How it works', 'how-it-works'],
    ['Host an event', 'host'],
  ]);
  assert.deepEqual(fragmentLinks(sections[0][2]), [
    ['Explore events', 'events'],
    ['Host an event', 'host'],
  ]);
  const ids = [...body.matchAll(/<[\w-]+\b[^>]*\bid="([^"]+)"/g)].map(([, id]) => id);
  for (const [label, target] of fragmentLinks(body)) {
    assert.equal(ids.filter((id) => id === target).length, 1, `${label} target #${target}`);
  }
});
