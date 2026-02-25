const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadImages(files: FileList | File[]) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }
  formData.append("folder", "products");

  try {
    const res = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Error subiendo imágenes:", error);
    return { success: false, message: "Error de conexión" };
  }
}
