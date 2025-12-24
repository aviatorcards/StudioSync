/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'localhost',
            'minio', // MinIO in Docker
        ],
    },
    async rewrites() {
        return [
            // API proxy - use INTERNAL_API_URL (http://backend:8000/api) if available
            {
                source: '/api/:path*',
                destination: (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api') + '/:path*/',
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
