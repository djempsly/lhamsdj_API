// const config = {
//   plugins: {
//     "@tailwindcss/postcss": {},
//   },
// };

//export default config;
// /** @type {import('postcss-load-config').Config} */
// const config = {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// };

// export default config;


// /** @type {import('postcss-load-config').Config} */
// const config = {
//   plugins: {
//     // 👇 CAMBIO AQUÍ: Usamos el paquete nuevo con @
//     '@tailwindcss/postcss': {}, 
//     autoprefixer: {},
//   },
// };

// export default config;


/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {}, // 👈 Nota que ya no tiene el @
    autoprefixer: {},
  },
};

export default config;