import { validateEnv } from './lib/env.js';

// Runs when the Next.js server boots (dev, build and start). If a required
// environment variable is missing, this throws and the app will not start.
validateEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
