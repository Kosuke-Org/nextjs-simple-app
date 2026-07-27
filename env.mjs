// Validates required environment variables at startup.
// Imported by next.config.mjs so it runs for `next dev`, `next build`, and `next start`.
// If a required variable is missing, the process exits and the app never starts.

const REQUIRED_ENV_VARS = ['POKEMON_API_KEY'];

const missing = REQUIRED_ENV_VARS.filter((name) => {
  const value = process.env[name];
  return value === undefined || value.trim() === '';
});

if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment variable(s): ${missing.join(', ')}.\n` +
      `The application cannot start. Set them in your environment or a .env file (see .env.example).\n`
  );
  process.exit(1);
}
