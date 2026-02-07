/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3ad0uqew6ugbz.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      }
    ],
  },
};

export default nextConfig;
