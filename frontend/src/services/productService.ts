// Definimos los tipos aquí (o en una carpeta types separada)
// export interface Product {
//   id: number;
//   name: string;
//   price: string; // Viene como string/decimal de la BD
//   images: { url: string }[];
//   stock: number;
//   slug: string;
// }

// export async function getProducts(): Promise<Product[]> {
//   // En Next.js, fetch tiene superpoderes (hace caché automático)
//    // 👇 AGREGA ESTO PARA VER EL ERROR EN LA TERMINAL
//    // 1. Definimos la URL (Aquí estaba el error, faltaba esta línea)
//   const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products`;
//   console.log("📡 Intentando conectar a:", apiUrl);
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
//     cache: 'no-store', // 'no-store' = Datos frescos siempre (como para stock)
//   });

//   if (!res.ok) {
//     throw new Error('Error al cargar productos');
//   }

//   const data = await res.json();
//   return data.data; // Según tu API: { success: true, data: [...] }
// }

import { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export async function getProducts(): Promise<Product[]> {
//   try {
//     const res = await fetch(`${API_URL}/products`, {
//       cache: "no-store",
//     });

//     //if (!res.ok) throw new Error("Error fetching products");


//     if (!res.ok) {
//       const errorText = await res.text(); // Leemos lo que respondió el servidor
//       console.error(`❌ ERROR GRAVE DEL BACKEND:`);
//       console.error(`👉 Estado: ${res.status} ${res.statusText}`);
//       console.error(`👉 Mensaje: ${errorText}`);
//       throw new Error(`Backend respondió ${res.status}`);
//     }

    

//     const json = await res.json();
//     return json.data;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// }



export async function getBestSellers() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products/best-sellers`;
  
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error cargando best sellers:", error);
    return [];
  }
}





export async function getProducts(): Promise<Product[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products`;
  
  
  try {
    // Agregamos un timestamp (?t=...) para engañar al navegador y forzar recarga
    const res = await fetch(`${apiUrl}?t=${Date.now()}`, {
      cache: "no-store", // 1. Next.js: No guardes esto
      headers: {
        "Pragma": "no-cache", // 2. HTTP Standard
        "Cache-Control": "no-cache, no-store, must-revalidate" // 3. HTTP Standard
      }
    });

    if (!res.ok) return [];
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    return [];
  }
}




// export async function getProductBySlug(slug: string) {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
//       cache: "no-store",
//     });
//     const json = await res.json();
//     return json.success ? json.data : null;
//   } catch (error) {
//     return null;
//   }
// }





// Función para obtener un solo producto (Detalle)
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}


export async function createProduct(data: any) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include", // 🍪 Necesario para que el Admin pueda borrar
  });
  return await res.json();
}



// // 1. Obtener producto por ID (Para el Admin)
// export async function getProductById(id: number) {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
//       cache: "no-store",
//     });
//     const json = await res.json();
//     return json.data;
//   } catch (error) {
//     return null;
//   }
// }






// src/services/productService.ts

export async function getProductById(id: number) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/products/id/${id}`;
  //const url = `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`;
  console.log("🔍 Buscando producto ID:", id);
  console.log("📡 URL:", url);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    console.log("📦 Respuesta del Backend:", json);

    if (!res.ok || !json.success) {
      console.error("❌ El backend dijo que no:", json.message);
      return null;
    }

    return json.data;
  } catch (error) {
    console.error("☠️ Error fatal en getProductById:", error);
    return null;
  }
}














// 2. Actualizar Producto (PATCH)
export async function updateProduct(id: number, data: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include", // 🍪 Importante para permisos de Admin
  });
  return await res.json();
}





