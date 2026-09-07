// Standard Pokemon type colours, used to theme the card per type.
const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const FALLBACK_COLOR = '#A8A77A';

export function typeColor(type) {
  return TYPE_COLORS[type] ?? FALLBACK_COLOR;
}

/**
 * Picks black or white text depending on how light the background is,
 * so labels stay readable on both Electric yellow and Dragon purple.
 */
export function readableTextOn(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#1a1a1a' : '#ffffff';
}

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Fetches a single Pokemon from the PokeAPI.
 * Returns null when the Pokemon does not exist or the API is unreachable,
 * so the page can render a friendly fallback instead of crashing.
 */
export async function getPokemon(nameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nameOrId)}`,
      // Pokemon data effectively never changes, so cache it for a day.
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const types = data.types.map((entry) => entry.type.name);

    return {
      name: titleCase(data.name),
      number: String(data.id).padStart(3, '0'),
      types,
      // The API reports height in decimetres and weight in hectograms.
      height: `${(data.height / 10).toFixed(1)} m`,
      weight: `${(data.weight / 10).toFixed(1)} kg`,
      artwork:
        data.sprites.other['official-artwork'].front_default ??
        data.sprites.front_default,
      accent: typeColor(types[0]),
    };
  } catch {
    return null;
  }
}
