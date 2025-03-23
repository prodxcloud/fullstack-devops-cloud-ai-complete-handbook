/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'via.placeholder.com',
      'files.stripe.com',
      'images.unsplash.com'  // Add Unsplash domain for the images used in the homepage
    ],
    unoptimized: true,
  },
  // Enable static export but with dynamic routes
  trailingSlash: true,
  // Configure dynamic routes
  dynamicParams: true,
}

module.exports = nextConfig 