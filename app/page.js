import { getPokemon, typeColor, readableTextOn } from './pokemon';

// Change this to any Pokemon name or Pokedex number to swap the card.
const FEATURED_POKEMON = 'pikachu';

export default async function Home() {
  const pokemon = await getPokemon(FEATURED_POKEMON);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)',
      }}
    >
      <h1 style={{ margin: 0, textAlign: 'center', color: '#1a1a1a' }}>
        The pokemon website
      </h1>

      {pokemon ? <PokemonCard pokemon={pokemon} /> : <NotFound />}
    </main>
  );
}

function PokemonCard({ pokemon }) {
  return (
    <div
      style={{
        width: '320px',
        borderRadius: '20px',
        padding: '1.5rem',
        background: '#fff',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
        border: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          background: `linear-gradient(160deg, color-mix(in srgb, ${pokemon.accent} 18%, #fff) 0%, ${pokemon.accent} 100%)`,
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pokemon.artwork}
          alt={pokemon.name}
          width={200}
          height={200}
          style={{ display: 'block' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: '1rem',
        }}
      >
        <h2 style={{ margin: 0, color: '#1a1a1a' }}>{pokemon.name}</h2>
        <span style={{ color: '#888', fontWeight: 600 }}>#{pokemon.number}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        {pokemon.types.map((type) => {
          const background = typeColor(type);
          return (
            <span
              key={type}
              style={{
                background,
                color: readableTextOn(background),
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {type}
            </span>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '1rem',
          color: '#555',
          fontSize: '0.9rem',
        }}
      >
        <span>Height: {pokemon.height}</span>
        <span>Weight: {pokemon.weight}</span>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div
      style={{
        width: '320px',
        borderRadius: '20px',
        padding: '1.5rem',
        background: '#fff',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
        border: '1px solid #f0f0f0',
        textAlign: 'center',
        color: '#555',
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>
        Could not load &ldquo;{FEATURED_POKEMON}&rdquo;
      </p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
        The PokeAPI was unreachable or that name does not exist.
      </p>
    </div>
  );
}
