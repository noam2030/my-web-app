import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone mode when building Docker containers for Google Cloud Run
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' } : {}),
};

export default nextConfig;
