import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ignores all ESLint errors when building
  },
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"], // ✅ Allow Cloudinary images
  },
  output: 'standalone',

};

export default nextConfig;
