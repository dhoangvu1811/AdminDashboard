/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    // Keep linting as a separate CI/local step. Do not block production build.
    ignoreDuringBuilds: true
  }
}

export default nextConfig
