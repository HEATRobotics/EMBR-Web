/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    fontLoaders: [
      {
        loader: '@next/font/google',
        options: {
          subsets: ['latin'], // You can add other subsets if needed, e.g., 'latin-ext'
          preconnect: true, // Improves font loading performance
        },
      },
    ],
  },
};

export default nextConfig;
