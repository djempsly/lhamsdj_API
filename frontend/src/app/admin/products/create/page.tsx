// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getCategories } from "@/services/categoryService";
// import { uploadImage } from "@/services/uploadService";
// import { createProduct } from "@/services/productService";
// import { ImagePlus, Loader2, Save } from "lucide-react";
// import Image from "next/image";

// export default function CreateProductPage() {
//   const router = useRouter();
  
//   // Estados
//   const [categories, setCategories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // Formulario
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     stock: "",
//     categoryId: "",
//     imageUrl: "", // Aquí guardaremos la URL de AWS
//   });

//   // Cargar categorías al iniciar
//   useEffect(() => {
//     getCategories().then((res) => {
//       if (res.success) setCategories(res.data);
//     });
//   }, []);

//   // Manejar subida de imagen
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Vista previa local
//     setImagePreview(URL.createObjectURL(file));
//     setUploading(true);

//     try {
//       // Subir a AWS S3
//       const res = await uploadImage(file);
//       if (res.success) {
//         setFormData({ ...formData, imageUrl: res.data.url });
//       } else {
//         alert("Error subiendo imagen");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error de conexión");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.imageUrl) return alert("Por favor espera a que suba la imagen");

//     setLoading(true);

//     // Preparamos los datos para el Backend
//     const payload = {
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       stock: parseInt(formData.stock),
//       categoryId: parseInt(formData.categoryId),
//       images: [formData.imageUrl] // El backend espera un array de strings
//     };

//     const res = await createProduct(payload);
//     setLoading(false);

//     if (res.success) {
//       alert("Producto creado exitosamente");
//       router.push("/admin/products"); // Volver a la lista
//     } else {
//       alert("Error: " + res.message);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-8">Nuevo Producto</h1>

//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        
//         {/* SECCIÓN IMAGEN */}
//         <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
//           {imagePreview ? (
//             <div className="relative w-64 h-64">
//               <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-md" />
//               {uploading && (
//                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold rounded-md">
//                   Subiendo a AWS...
//                 </div>
//               )}
//             </div>
//           ) : (
//             <label className="cursor-pointer flex flex-col items-center">
//               <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
//               <span className="text-gray-500">Clic para subir imagen</span>
//               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
//             </label>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* NOMBRE */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
//             <input
//               required
//               type="text"
//               className="w-full p-2 border rounded-md"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//             />
//           </div>

//           {/* CATEGORÍA */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
//             <select
//               required
//               className="w-full p-2 border rounded-md bg-white"
//               value={formData.categoryId}
//               onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
//             >
//               <option value="">Selecciona una categoría</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>{cat.name}</option>
//               ))}
//             </select>
//           </div>

//           {/* PRECIO */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
//             <input
//               required
//               type="number"
//               min="0"
//               step="0.01"
//               className="w-full p-2 border rounded-md"
//               value={formData.price}
//               onChange={(e) => setFormData({...formData, price: e.target.value})}
//             />
//           </div>

//           {/* STOCK */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
//             <input
//               required
//               type="number"
//               min="0"
//               className="w-full p-2 border rounded-md"
//               value={formData.stock}
//               onChange={(e) => setFormData({...formData, stock: e.target.value})}
//             />
//           </div>
//         </div>

//         {/* DESCRIPCIÓN */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
//           <textarea
//             className="w-full p-2 border rounded-md h-32"
//             value={formData.description}
//             onChange={(e) => setFormData({...formData, description: e.target.value})}
//           />
//         </div>

//         {/* BOTÓN GUARDAR */}
//         <button
//           type="submit"
//           disabled={loading || uploading || !formData.imageUrl}
//           className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           {loading ? <Loader2 className="animate-spin" /> : <Save />}
//           Guardar Producto
//         </button>

//       </form>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategories } from "@/services/categoryService";
import { uploadImages } from "@/services/uploadService"; // <--- Usamos la nueva función plural
import { createProduct } from "@/services/productService";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";

export default function CreateProductPage() {
  const router = useRouter();
  
  // Estados
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estado para las imágenes (Array de URLs)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  // Cargar categorías
  useEffect(() => {
    getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Manejar subida MÚLTIPLE
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Subir a AWS S3
      const res = await uploadImages(files);
      
      if (res.success) {
        // El backend devuelve: data: [{url: '...'}, {url: '...'}]
        const newUrls = res.data.map((img: any) => img.url);
        
        // Agregamos las nuevas fotos a las que ya teníamos (sin borrar las anteriores)
        setUploadedUrls((prev) => [...prev, ...newUrls]);
      } else {
        alert("Error subiendo imágenes: " + res.message);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setUploading(false);
      // Limpiamos el input para poder subir las mismas fotos de nuevo si se borraron
      e.target.value = ""; 
    }
  };

  // Función para quitar una foto de la lista antes de guardar
  const removeImage = (indexToRemove: number) => {
    setUploadedUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedUrls.length === 0) return alert("Debes subir al menos una imagen");

    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      images: uploadedUrls // Enviamos el array completo de URLs
    };

    const res = await createProduct(payload);
    setLoading(false);

    if (res.success) {
      alert("✅ Producto creado exitosamente");
      router.push("/admin/products"); 
      router.refresh();
    } else {
      alert("❌ Error: " + res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Nuevo Producto</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        
        {/* SECCIÓN IMÁGENES MÚLTIPLES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Galería de fotos subidas */}
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square border rounded-lg overflow-hidden">
                <Image src={url} alt={`Foto ${index}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Botón de subir (Siempre visible al final) */}
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              {uploading ? (
                <Loader2 className="animate-spin text-gray-400" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">Agregar Fotos</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple // 👈 ¡ESTO ES LA CLAVE!
                onChange={handleImageChange} 
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">Puedes seleccionar varias fotos a la vez.</p>
        </div>

        {/* RESTO DEL FORMULARIO (Igual que antes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              required
              className="w-full p-2 border rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              required
              className="w-full p-2 border rounded-md bg-white"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="">Selecciona...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
            <input
              required
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            className="w-full p-2 border rounded-md h-32"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading || uploadedUrls.length === 0}
          className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar Producto
        </button>

      </form>
    </div>
  );
}