const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCart() {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: null };
  }
}

export async function addToCart(productId: number, quantity: number, variantId?: number) {
  try {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, productVariantId: variantId }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

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

export async function getCartCount() {
  const cart = await getCart();
  if (cart?.success && cart.data?.items) {
    return cart.data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }
  return 0;
}
