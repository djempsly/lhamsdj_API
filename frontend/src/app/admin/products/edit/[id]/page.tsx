// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { getProductById, updateProduct } from "@/services/productService";
// import { getCategories } from "@/services/categoryService";
// import { uploadImage } from "@/services/uploadService";
// import { ImagePlus, Loader2, Save, ArrowLeft } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// export default function EditProductPage() {
//   // const router = useRouter();
//   // const params = useParams(); // Obtenemos el ID de la URL
//   // const productId = Number(params.id);

//   // Estados
//   const [categories, setCategories] = useState<any[]>([]);
//   const [loadingData, setLoadingData] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // Formulario
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     stock: "",
//     categoryId: "",
//     imageUrl: "",
//   });

//   // // 1. Cargar Datos Iniciales (Producto + Categorías)
//   // useEffect(() => {
//   //   const loadData = async () => {
//   //     try {
//   //       const [productData, categoryRes] = await Promise.all([
//   //         getProductById(productId),
//   //         getCategories()
//   //       ]);

//   //       if (categoryRes.success) setCategories(categoryRes.data);

//   //       if (productData) {
//   //         // Rellenar formulario
//   //         setFormData({
//   //           name: productData.name,
//   //           description: productData.description || "",
//   //           price: productData.price,
//   //           stock: productData.stock,
//   //           categoryId: productData.categoryId,
//   //           imageUrl: productData.images[0]?.url || "",
//   //         });
//   //         setImagePreview(productData.images[0]?.url || null);
//   //       } else {
//   //         alert("Producto no encontrado");
//   //         router.push("/admin/products");
//   //       }
//   //     } catch (error) {
//   //       console.error(error);
//   //     } finally {
//   //       setLoadingData(false);
//   //     }
//   //   };

//   //   loadData();
//   // }, [productId, router]);



  



// const router = useRouter();
//   const params = useParams(); // Obtenemos params directamente

//   // 1. Manejo seguro del ID
//   // A veces params.id puede ser un string o array, nos aseguramos.
//   const rawId = params?.id; 
//   const productId = Number(rawId);

//   // Estados
//   //const [categories, setCategories] = useState<any[]>([]);
//   // ... resto de estados

//   useEffect(() => {
//     // 2. Validación de seguridad: Si no hay ID válido, no hacemos nada aún
//     if (!productId || isNaN(productId)) {
//         console.warn("⚠️ ID inválido o aún no cargado:", rawId);
//         return;
//     }

//     const loadData = async () => {
//       console.log("🚀 Iniciando carga para ID:", productId);
      
//       try {
//         const [productData, categoryRes] = await Promise.all([
//           getProductById(productId),
//           getCategories()
//         ]);

//         if (categoryRes.success) setCategories(categoryRes.data);

//         if (productData) {
//           console.log("✅ Datos cargados en el formulario:", productData);
//           setFormData({
//             name: productData.name,
//             description: productData.description || "",
//             price: productData.price,
//             stock: productData.stock,
//             categoryId: productData.categoryId,
//             imageUrl: productData.images[0]?.url || "",
//           });
//           setImagePreview(productData.images[0]?.url || null);
//         } else {


//           // Si llegamos aquí, es un fantasma.
//             // En vez de alert, volvemos a la lista automáticamente.
//             console.warn("Producto no encontrado, volviendo a la lista...");
//             router.replace("/admin/products"); // .replace borra el historial para no poder volver



//           // SOLO si el ID era válido pero la API devolvió null
//          // console.error("❌ Producto null recibido");
//           //alert("No se pudo cargar el producto. Revisa la consola.");
//           // router.push("/admin/products"); // Comentado para que no te saque y puedas ver el error
//         }
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     loadData();
//   }, [productId, router, rawId]); // Agregamos rawId a dependencias


















  

//   // 2. Manejar cambio de imagen (Igual que en crear)
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setImagePreview(URL.createObjectURL(file));
//     setUploading(true);

//     try {
//       const res = await uploadImage(file);
//       if (res.success) {
//         setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
//       } else {
//         alert("Error subiendo imagen");
//       }
//     } catch (error) {
//       alert("Error de conexión");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // 3. Enviar Actualización
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);

//     const payload = {
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       stock: parseInt(formData.stock),
//       categoryId: parseInt(formData.categoryId.toString()),
//       // Solo enviamos imagen si cambió o si ya existía
//       images: formData.imageUrl ? [formData.imageUrl] : [] 
//     };

//     const res = await updateProduct(productId, payload);
//     setSaving(false);

//     if (res.success) {
//       alert("✅ Producto actualizado correctamente");
//       router.push("/admin/products");
//       router.refresh();
//     } else {
//       alert("❌ Error: " + res.message);
//     }
//   };

//   if (loadingData) return <div className="p-10 text-center">Cargando datos...</div>;

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex items-center gap-4 mb-8">
//         <Link href="/admin/products" className="text-gray-500 hover:text-black">
//             <ArrowLeft />
//         </Link>
//         <h1 className="text-3xl font-bold">Editar Producto #{productId}</h1>
//       </div>

//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        
//         {/* IMAGEN */}
//         <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
//           {imagePreview ? (
//             <div className="relative w-64 h-64">
//               <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-md" />
//               {uploading && (
//                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold rounded-md">
//                   Subiendo...
//                 </div>
//               )}
//               {/* Botón para cambiar imagen sobre la existente */}
//               <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100">
//                 <ImagePlus size={20} className="text-black" />
//                 <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
//               </label>
//             </div>
//           ) : (
//             <label className="cursor-pointer flex flex-col items-center">
//               <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
//               <span className="text-gray-500">Subir imagen</span>
//               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
//             </label>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
//             <input
//               required
//               className="w-full p-2 border rounded-md"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
//             <select
//               required
//               className="w-full p-2 border rounded-md bg-white"
//               value={formData.categoryId}
//               onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
//             >
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>{cat.name}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
//             <input
//               required
//               type="number"
//               className="w-full p-2 border rounded-md"
//               value={formData.price}
//               onChange={(e) => setFormData({...formData, price: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
//             <input
//               required
//               type="number"
//               className="w-full p-2 border rounded-md"
//               value={formData.stock}
//               onChange={(e) => setFormData({...formData, stock: e.target.value})}
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
//           <textarea
//             className="w-full p-2 border rounded-md h-32"
//             value={formData.description}
//             onChange={(e) => setFormData({...formData, description: e.target.value})}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={saving || uploading}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
//         >
//           {saving ? <Loader2 className="animate-spin" /> : <Save />}
//           Guardar Cambios
//         </button>

//       </form>
//     </div>
//   );
// }







"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProductById, updateProduct } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { uploadImages } from "@/services/uploadService";
import { ImagePlus, Loader2, Save, ArrowLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tProducts = useTranslations("products");
  const rawId = params?.id;
  const productId = Number(rawId);

  // Estados
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estado para imágenes (Array)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  // 1. Cargar Datos
  useEffect(() => {
    if (!productId || isNaN(productId)) return;

    const loadData = async () => {
      try {
        const [productData, categoryRes] = await Promise.all([
          getProductById(productId),
          getCategories()
        ]);

        if (categoryRes.success) setCategories(categoryRes.data);

        if (productData) {
          setFormData({
            name: productData.name,
            description: productData.description || "",
            price: productData.price,
            stock: productData.stock,
            categoryId: productData.categoryId,
          });
          
          // Cargar las imágenes existentes en el estado
          if (productData.images && productData.images.length > 0) {
            setUploadedUrls(productData.images.map((img: any) => img.url));
          }
        } else {
          alert(tProducts("notFound"));
          router.push("/admin/products");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [productId, router]);

  // 2. Manejar Subida Múltiple
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const res = await uploadImages(files); // Usamos la función plural
      if (res.success) {
        const newUrls = res.data.map((img: any) => img.url);
        setUploadedUrls((prev) => [...prev, ...newUrls]);
      } else {
        alert(tCommon("error"));
      }
    } catch (error) {
      alert(tCommon("error"));
    } finally {
      setUploading(false);
      e.target.value = ""; // Limpiar input
    }
  };

  // Función para quitar foto de la lista
  const removeImage = (indexToRemove: number) => {
    setUploadedUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 3. Guardar Cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedUrls.length === 0) return alert(t("minOneImage"));
    
    setSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId.toString()),
      images: uploadedUrls // Enviamos el array completo actualizado
    };

    const res = await updateProduct(productId, payload);
    setSaving(false);

    if (res.success) {
      alert("✅ Producto actualizado correctamente");
      router.push("/admin/products");
      router.refresh();
    } else {
      alert(tCommon("error") + ": " + res.message);
    }
  };

  if (loadingData) return <div className="p-10 text-center">Cargando datos...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-black">
            <ArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold">Editar Producto #{productId}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        
        {/* SECCIÓN IMÁGENES MÚLTIPLES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("productImages")}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            
            {/* Galería */}
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

            {/* Botón Subir */}
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              {uploading ? (
                <Loader2 className="animate-spin text-gray-400" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">{t("addPhotos")}</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange} 
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* RESTO DEL FORMULARIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("name")}</label>
            <input
              required
              className="w-full p-2 border rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("category")}</label>
            <select
              required
              className="w-full p-2 border rounded-md bg-white"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("price")}</label>
            <input
              required
              type="number"
              className="w-full p-2 border rounded-md"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("stock")}</label>
            <input
              required
              type="number"
              className="w-full p-2 border rounded-md"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("description")}</label>
          <textarea
            className="w-full p-2 border rounded-md h-32"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {t("saveChanges")}
        </button>

      </form>
    </div>
  );
}