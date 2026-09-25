const TYPE_COLORS = {
  Normal: { background: '#a8a878', color: '#1a1a1a' },
  Fire: { background: '#f08030', color: '#3b1a00' },
  Water: { background: '#6890f0', color: '#0d1b3e' },
  Electric: { background: '#f8d030', color: '#3a2c00' },
  Grass: { background: '#78c850', color: '#12300a' },
  Ice: { background: '#98d8d8', color: '#0f3333' },
  Fighting: { background: '#c03028', color: '#ffffff' },
  Poison: { background: '#a040a0', color: '#ffffff' },
  Ground: { background: '#e0c068', color: '#3a2c00' },
  Flying: { background: '#a890f0', color: '#1f1446' },
  Psychic: { background: '#f85888', color: '#3d0017' },
  Bug: { background: '#a8b820', color: '#262b00' },
  Rock: { background: '#b8a038', color: '#2e2600' },
  Ghost: { background: '#705898', color: '#ffffff' },
  Dragon: { background: '#7038f8', color: '#ffffff' },
  Dark: { background: '#705848', color: '#ffffff' },
  Steel: { background: '#b8b8d0', color: '#1f1f33' },
  Fairy: { background: '#ee99ac', color: '#3d0f1a' },
};

const FALLBACK_TYPE_COLOR = TYPE_COLORS.Normal;

function typeColor(type) {
  return TYPE_COLORS[type] ?? FALLBACK_TYPE_COLOR;
}

export default function Home() {
  const pokemon = {
    name: 'Charizard',
    number: '006',
    types: ['Fire', 'Flying'],
    height: '1.7 m',
    weight: '90.5 kg',
    artwork:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
  };

  const primaryColor = typeColor(pokemon.types[0]).background;

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
            background: `linear-gradient(160deg, color-mix(in srgb, ${primaryColor} 20%, #ffffff) 0%, ${primaryColor} 100%)`,
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
          {pokemon.types.map((type) => (
            <span
              key={type}
              style={{
                ...typeColor(type),
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {type}
            </span>
          ))}
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
    </main>
  );
}
