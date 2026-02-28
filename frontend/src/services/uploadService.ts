import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadImages(files: FileList | File[]) {
  const formData = new FormData();
  formData.append("folder", "products");
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }

  try {
    const res = await apiFetch(`${API_URL}/uploads`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: json.message || json.error || `Error ${res.status}`,
      };
    }

    return json;
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, message: "Connection error" };
  }
}
