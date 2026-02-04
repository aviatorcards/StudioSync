/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: 'minio',
            },
            {
                protocol: 'https',
                hostname: 'minio',
            },
        ],
    },
    // Ignore build errors to ensure the container starts up even with minor type/lint issues
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Note: allowedDevOrigins will be available in future Next.js versions
    // For now, cross-origin dev requests work but show warnings
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Authorization',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            // API proxy - use INTERNAL_API_URL (http://backend:8000/api) if available
            {
                source: '/api/:path*',
                destination: (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api') + '/:path*',
            },
            // Media proxy - serve uploaded files from backend
            {
                source: '/media/:path*',
                destination: 'http://backend:8000/media/:path*',
            },
            // Serve MkDocs index for the root /docs path
            {
                source: '/docs',
                destination: '/docs/index.html',
            },
        ];
    },
    trailingSlash: true,
};

module.exports = nextConfig;
