import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/conditions-generales", destination: "/legal/terms-private", permanent: true },
      { source: "/mentions-legales", destination: "/legal/legal-notice", permanent: true },
      { source: "/confidentialite", destination: "/legal/privacy", permanent: true },
      { source: "/accessibilite", destination: "/legal/accessibility", permanent: true },
    ];
  },
  // Configuration pour les images externes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Headers de sécurité supplémentaires
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  // Désactiver les pages d'erreur exposant des informations sensibles
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
