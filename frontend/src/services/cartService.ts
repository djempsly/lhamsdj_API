const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Obtener mi carrito
export async function getCart() {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: "GET",
      credentials: "include", // 🍪 Cookie necesaria
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: null };
  }
}

// Agregar item
export async function addToCart(productId: number, quantity: number, variantId?: number) {
  try {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId, 
        quantity, 
        productVariantId: variantId // Opcional (si tiene talla)
      }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

// // Agrega esta función al final de tu archivo
// export async function getCartCount() {
//   const cart = await getCart();
//   if (cart && cart.success && cart.data) {
//     // Sumamos la cantidad de todos los items
//     return cart.data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
//   }
//   return 0;
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// // Obtener Carrito
// export async function getCart() {
//   try {
//     const res = await fetch(`${API_URL}/cart`, {
//       method: "GET",
//       credentials: "include",
//       cache: "no-store",
//     });
//     return await res.json();
//   } catch (error) {
//     return { success: false, data: null };
//   }
// }

// // Agregar Item (Ya la tenías, la dejo por referencia)
// export async function addToCart(productId: number, quantity: number, variantId?: number) {
//   try {
//     const res = await fetch(`${API_URL}/cart/items`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ productId, quantity, productVariantId: variantId }),
//       credentials: "include",
//     });
//     return await res.json();
//   } catch (error) {
//     return { success: false, message: "Error de conexión" };
//   }
// }

// 👇 NUEVO: Actualizar cantidad (Sumar/Restar)
export async function updateCartItem(itemId: number, quantity: number) {
  try {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

// 👇 NUEVO: Eliminar Item
export async function removeCartItem(itemId: number) {
  try {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

// Helper para contar (Ya la tenías)
export async function getCartCount() {
  const cart = await getCart();
  if (cart?.success && cart.data?.items) {
    return cart.data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }
  return 0;
}