/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    productionBrowserSourceMaps: false,

    // Webpack configuration for compatibility
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false
            };
        }
        return config;
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data:",
                            "connect-src 'self'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },

    // Custom rewrites
    async rewrites() {
        return [
            {
                source: '/updates.json',
                destination: '/api/updates',
            },
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'aipolicy.local',
                    },
                ],
                destination: '/:path*',
            },
        ]
    },

    // Optimize build output
    compress: true,
    generateEtags: true,
    poweredByHeader: false,

    // Experimental features
    experimental: {
        // Server actions configuration
        serverActions: {
            allowedOrigins: ['aipolicy.local:3000', 'localhost:3000', 'localhost:3001']
        },
        // Enable modern features
        optimizePackageImports: ['lucide-react']
    }
}

module.exports = nextConfig
