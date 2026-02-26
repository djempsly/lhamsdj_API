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

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts, deleteProduct } from "@/services/productService";
import { Plus, Trash2, Pencil, Package } from "lucide-react";
import { Product } from "@/types"; // Asegúrate de tener tus tipos definidos

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar datos
  const loadProducts = async () => {
    setLoading(true);
    const res = await getProducts();
    setProducts(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    const res = await deleteProduct(id);
    if (res.success) {
      alert("Producto eliminado");
      loadProducts(); // Recargar la tabla
    } else {
      alert("Error al eliminar: " + res.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando productos...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Productos</h1>
        <Link 
          href="/admin/products/create" 
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus size={20} /> Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Imagen</th>
              <th className="p-4 font-medium text-gray-500">Nombre</th>
              <th className="p-4 font-medium text-gray-500">Precio</th>
              <th className="p-4 font-medium text-gray-500">Stock</th>
              <th className="p-4 font-medium text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                {/* IMAGEN PEQUEÑA */}
                <td className="p-4">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden border">
                    <Image 
                      src={product.images[0]?.url || "https://via.placeholder.com/100"} 
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                
                {/* NOMBRE Y CATEGORÍA */}
                <td className="p-4">
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">ID: {product.id}</p>
                </td>

                {/* PRECIO */}
                <td className="p-4 font-medium">${product.price}</td>

                {/* STOCK */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <Package size={12} />
                    {product.stock}
                  </span>
                </td>

                {/* BOTONES */}
                <td className="p-4 text-right space-x-2">
                  {/* <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
                    <Pencil size={18} />
                  </button> */}


                        {/* AHORA ES: */}
      <Link 
        href={`/admin/products/edit/${product.id}`}
        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition inline-block"
      >
        <Pencil size={18} />
      </Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500">
                  No tienes productos aún. ¡Crea el primero!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}