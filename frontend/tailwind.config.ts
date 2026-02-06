
// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     // 👇 ESTA LÍNEA ES LA QUE HACE QUE FUNCIONEN LOS ESTILOS EN TU ESTRUCTURA
//     "./src/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
// export default config;


// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     // 👇 ESTO ES LO IMPORTANTE: Que apunte a ./src/...
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;



import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // 👇 ESTAS SON LAS RUTAS QUE LE DICEN A TAILWIND DÓNDE BUSCAR
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- Agrega esta "comodín" por seguridad
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;



