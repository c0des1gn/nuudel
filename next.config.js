const path = require('path');

//const withPlugins = require('next-compose-plugins');

// Tell webpack to compile the "nuudel-core" package
// https://www.npmjs.com/package/next-transpile-modules
const withTM = require('next-transpile-modules')(['nuudel-core']);

module.exports = withTM({
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  rewrites: () => [{ source: '/list', destination: '/lists' }], //  /api/:path*
  images: {
    domains: ['nuudel.io'],
    minimumCacheTTL: 60,
    //loader: 'imgix',
    //deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    //imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    dirs: ['src/pages', 'src/components', 'src/widgets'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
    ignoreDuringBuilds: true,
  },
  //reactStrictMode: true,
  env: {
    HOST: process.env.HOST,
    WEB: process.env.WEB,
    PORT: process.env.PORT,
    DOMAIN: process.env.DOMAIN,
    NEXT_PUBLIC_OBJECT_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
    NEXT_PUBLIC_IMAGE_UPLOAD_URL: process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL,
    NEXT_PUBLIC_NEXT_PUBLIC_COMMON_BACKEND_URL:
      process.env.NEXT_PUBLIC_COMMON_BACKEND_URL,
    WEB_APP_GOOGLE_API_KEY: process.env.WEB_APP_GOOGLE_API_KEY,
    NEXT_PUBLIC_MAPBOX_ACCESSTOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESSTOKEN,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_WS_SUBSCRIPTION: process.env.NEXT_PUBLIC_WS_SUBSCRIPTION,
  },
});
