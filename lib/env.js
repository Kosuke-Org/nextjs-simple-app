// Centralized environment variable validation.
//
// Add every required variable to REQUIRED_ENV_VARS. `getEnv()` throws if any of
// them is missing or empty, which prevents the app from starting (see
// next.config.mjs where this runs at boot time).

const REQUIRED_ENV_VARS = ['POKEMON_API_BASE_URL'];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return value === undefined || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(
        ', '
      )}. Set them (see .env.example) before starting the app.`
    );
  }
}

export function getEnv() {
  validateEnv();

  return {
    POKEMON_API_BASE_URL: process.env.POKEMON_API_BASE_URL,
  };
}
