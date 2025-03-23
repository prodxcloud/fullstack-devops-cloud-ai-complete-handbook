/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'build', // Custom output directory
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  pageExtensions: ['page.tsx', 'tsx', 'ts', 'jsx', 'js'], // Custom file extensions for pages

  // Add custom redirects
};

export default nextConfig;
