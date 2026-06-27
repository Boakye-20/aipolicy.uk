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

    // Custom rewrites
    async rewrites() {
        return [
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
