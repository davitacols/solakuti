import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for a lean production Docker image.
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/amp/:path*",
        destination: "/:path*",
        permanent: true
      },
      {
        source: "/:path*/amp",
        destination: "/:path*",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
          }
        ]
      }
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "*.r2.dev"
      },
      {
        protocol: "https",
        hostname: "www.solakuti.com"
      },
      {
        protocol: "https",
        hostname: "media.solakuti.com"
      }
    ]
  }
};

export default nextConfig;
