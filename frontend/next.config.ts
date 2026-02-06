// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "d3ad0uqew6ugbz.cloudfront.net", // Tu CloudFront
//       },
//       {
//         protocol: "https",
//         hostname: "**", // ⚠️ TEMPORAL: Permite todo para que no te de error si hay placeholders
//       },
//     ],
//   },
// };

// export default nextConfig;



// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "d3ad0uqew6ugbz.cloudfront.net"
//         //hostname: "**", // Permitir todo (para desarrollo), o pon tu dominio de CloudFront
//       },
//     ],
//   },
// };

// export default nextConfig;





import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3ad0uqew6ugbz.cloudfront.net", // Tu dominio real
        port: "",
        pathname: "/**", // Permitir cualquier ruta/carpeta
        
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Dejamos esto por si acaso usas placeholders
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      }
    ],
  },
};

export default nextConfig;