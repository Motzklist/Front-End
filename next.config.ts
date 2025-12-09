/** @type {import('next').NextConfig} */
const nextConfig = {
    // Other configurations will go here
    // e.g., output: 'standalone' if using advanced Docker builds

    // Explicitly define environment variables accessible during build
    // The key here is to assert the existence of process.env for TypeScript
    env: {
        // Expose the variable set by Docker Compose/Shell to the Next.js build process
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
};

// Use the standard way to export in a Next.js TypeScript config file
module.exports = nextConfig;