const path = require('path');

/**
 * @type {import('next').NextConfig}
 **/
let nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  rewrites: () => [
    { source: '/list', destination: '/lists' },
    {
      source: '/admin/page/:id/:path*',
      destination: '/admin/post/:id/?post_type=page',
    },
    {
      source: '/admin/page/:path*',
      destination: '/admin/post/?post_type=page',
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yourdomain.com',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },
  eslint: {
    dirs: ['src/pages', 'src/components', 'src/forms'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: [
    'nuudel-core',
    '@devexpress/dx-react-grid-material-ui',
    '@mui/icons-material',
  ],
  //productionBrowserSourceMaps: process.env.ANALYZE === 'true',
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FB_APPID: process.env.FB_CLIENT_ID,
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_WEB: process.env.WEB,
    NEXT_PUBLIC_PORT: process.env.PORT,
    NEXT_PUBLIC_DOMAIN: process.env.DOMAIN,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_OBJECT_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
    NEXT_PUBLIC_IMAGE_UPLOAD_URL: process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL,
    NEXT_PUBLIC_COMMON_BACKEND_URL: process.env.NEXT_PUBLIC_COMMON_BACKEND_URL,
    WEB_APP_GOOGLE_API_KEY: process.env.WEB_APP_GOOGLE_API_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_WS_SUBSCRIPTION: process.env.NEXT_PUBLIC_WS_SUBSCRIPTION,
  },
};

if ('true' === process.env.ANALYZE) {
  const withNextBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  nextConfig = withNextBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;
