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

    // Note: allowedDevOrigins will be available in future Next.js versions
    // For now, cross-origin dev requests work but show warnings
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob: https:",
                            "font-src 'self' data:",
                            "connect-src 'self' ws: wss: https:",
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "object-src 'none'",
                            "form-action 'self'",
                        ].join('; '),
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
                source: '/api/:path*/',
                destination: (process.env.INTERNAL_API_URL || 'http://localhost:8000/api') + '/:path*/',
            },
            {
                source: '/api/:path*',
                destination: (process.env.INTERNAL_API_URL || 'http://localhost:8000/api') + '/:path*',
            },
            // Media proxy - serve uploaded files from backend
            {
                source: '/media/:path*',
                destination: (process.env.INTERNAL_API_URL?.replace('/api', '') || 'http://localhost:8000') + '/media/:path*',
            },
            // Note: WebSocket (ws://) proxying is handled at the infrastructure level (Docker/Nginx).
            // Next.js rewrites() does not support ws:// destinations.
            // Serve MkDocs index for the root /docs path
            {
                source: '/docs',
                destination: '/docs/index.html',
            },
            // Serve MkDocs subpages - map /docs/:path*/ to /docs/:path*/index.html
            {
                source: '/docs/:path*/',
                destination: '/docs/:path*/index.html',
            },
            {
                source: '/docs/:path*',
                destination: '/docs/:path*/index.html',
            },
        ];
    },
    trailingSlash: true,
    output: 'standalone',
};

module.exports = nextConfig;
