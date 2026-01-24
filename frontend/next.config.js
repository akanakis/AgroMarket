/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        domains: ['images.unsplash.com', 'plus.unsplash.com', 'picsum.photos'],
    },
    // Ensure we can use the same port or let Next.js decide
}

module.exports = nextConfig
