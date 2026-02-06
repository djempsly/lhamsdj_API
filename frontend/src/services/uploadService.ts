// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export async function uploadImage(file: File) {
//   const formData = new FormData();
//   formData.append("image", file);
//   formData.append("folder", "products"); // Organizado en carpeta products

//   const res = await fetch(`${API_URL}/uploads`, {
//     method: "POST",
//     body: formData,
//     // No ponemos Content-Type, el navegador lo pone solo con el boundary correcto
//     credentials: "include", // 🍪 Importante para Auth Admin
//   });

//   return await res.json();
// }






const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadImages(files: FileList | File[]) {
  const formData = new FormData();
  
  // Agregamos cada archivo al FormData con el mismo nombre clave 'images'
  // Esto es lo que Multer espera para upload.array('images')
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }
  
  formData.append("folder", "products");

  try {
    const res = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      body: formData,
      credentials: "include", // 🍪 Para que pase la cookie de Admin
    });

    return await res.json();
  } catch (error) {
    console.error("Error subiendo imágenes:", error);
    return { success: false, message: "Error de conexión" };
  }
}