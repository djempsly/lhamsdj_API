// import Image from "next/image";

// export default function Home() {
//   return (
//     //  <main className="min-h-screen p-24">
//     //   <h1 className="text-4xl font-bold text-center">
//     //     Bienvenido a LhamsDJ Store 🚀
//     //   </h1>
//     // </main>


    
//   );
// }


// import { getProducts } from "@/services/productService";
// import Image from "next/image"; // Componente optimizado de imágenes

// export default async function Home() {
//   // 1. Pedimos los datos AL SERVIDOR antes de renderizar
//   const products = await getProducts();

//   return (
//     <main className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Nuestros Productos</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {products.map((product) => (
//           <div key={product.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
//             {/* Imagen optimizada de Next.js */}
//             <div className="relative w-full h-64 mb-4">
//               <Image 
//                 src={product.images[0]?.url || "https://d3ad0uqew6ugbz.cloudfront.net/lhams.webp"} 
//                 alt={product.name}
//                 fill
//                 className="object-cover rounded-md"
//               />
//             </div>
            
//             <h2 className="text-xl font-semibold">{product.name}</h2>
//             <p className="text-gray-600 font-bold mt-2">${product.price}</p>
            
//             {/* Este botón no hará nada aún, porque estamos en un Server Component */}
//             <button className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800">
//               Ver Detalles
//             </button>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }


// import { getProducts } from "@/services/productService";
// import Image from "next/image";

// export default async function Home() {
//   const products = await getProducts();

//   // 👇 ESTO ES EL CHIVATO: Míralo en tu terminal de VS Code
//   if (products.length > 0) {
//     console.log("📦 PRODUCTO 1 RECIBIDO:", JSON.stringify(products[0], null, 2));
//     console.log("🖼️ IMÁGENES:", products[0].images);
//   } else {
//     console.log("⚠️ NO HAY PRODUCTOS. El array está vacío.");
//   }

//   return (
//     <main className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Nuestros Productos</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {products.map((product) => (
//           <div key={product.id} className="border rounded-lg p-4 shadow-md">
//             <div className="relative w-full h-64 mb-4 bg-gray-200">
//               {/* LÓGICA DE IMAGEN MÁS SEGURA 👇 */}
//               <Image 
//                 src={
//                   (product.images && product.images.length > 0) 
//                     ? product.images[0].url 
//                     : "https://d3ad0uqew6ugbz.cloudfront.net/productos/gorras-polocher/gorras/gorraalgodonazul.webp"
//                 } 
//                 alt={product.name}
//                 fill
//                 className="object-cover rounded-md"
//               />
//             </div>
//             <h2 className="text-xl font-semibold">{product.name}</h2>
//             <p className="text-gray-600 font-bold mt-2">${product.price}</p>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }








import { getProducts, getBestSellers } from "@/services/productService";
import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/ui/Carousel";

export default async function Home() {
  const productsItem = await getProducts();

  const [products, bestSellers] = await Promise.all([
    getProducts(),
    getBestSellers()
  ]);



   // FILTRO: Solo mostramos los destacados
  //const featuredProducts = products.filter((p: any) => p.isFeatured);

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <div className="mb-10">
//         <Carousel />
//       </div>

//       <h2 className="text-2xl font-bold mb-6">Productos Destacados 🔥</h2>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {featuredProducts.map((product) => (
//            // ... (Tu tarjeta de producto existente)
//         ))}
//       </div>
//     </main>
//   );
// }

  return (
    <main className="container mx-auto px-4 py-8">
 
      {/* Banner Hero
      <div className="bg-black text-white rounded-xl p-10 mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Nueva Colección 2025</h1>
        <p className="mb-6">Descubre lo último en tecnología y moda.</p>
        <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
          Comprar Ahora
        </button>
      </div> */}



       {/* Reemplazamos el div negro por esto: */}
      <div className="mb-10">
        <Carousel />
      </div>

      <h2 className="text-2xl font-bold mb-6">Productos Destacados</h2>
      
      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bestSellers.map((product: any) => (
          <Link 
            key={product.id} 
            href={`/product/${product.slug}`}
            className="group"
          >

            
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
              <div className="relative w-full h-64 bg-gray-100">
                <Image 
                  src={product.images[0]?.url || "https://via.placeholder.com/300"} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{product.description?.substring(0, 50)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">${product.price}</span>
                  <span className="text-blue-600 text-sm font-medium">Ver más</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        

{productsItem.map((product: any) => (
          <Link 
            key={product.id} 
            href={`/product/${product.slug}`}
            className="group"
          >

            
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
              <div className="relative w-full h-64 bg-gray-100">
                <Image 
                  src={product.images[0]?.url || "https://via.placeholder.com/300"} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{product.description?.substring(0, 50)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">${product.price}</span>
                  <span className="text-blue-600 text-sm font-medium">Ver más</span>
                </div>
              </div>
            </div>
          </Link>
        ))}







            {/* Opcional: Otra sección con todos los productos recientes */}
      <h2 className="text-2xl font-bold mb-6 mt-12">Novedades</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {products.slice(0, 8).map((product) => (





            // ... tarjeta de producto ...
            <div key={product.id}>...</div> 
         ))}
      </div>
      </div>
    </main>
  );
}