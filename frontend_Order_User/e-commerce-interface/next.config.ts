import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      // Cho phép ảnh đại diện từ tài khoản Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      // Cho phép ảnh đại diện từ GitHub
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Cho phép ảnh đại diện từ Facebook
      {
        protocol: "https",
        hostname: "**.fbsbx.com",
      },
    ],
  },
};

export default nextConfig;
