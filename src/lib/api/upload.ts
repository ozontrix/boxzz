import { supabase } from "./supabase";

/**
 * Upload a file to Supabase Storage and return the public URL
 */
export async function uploadImage(
  file: File,
  bucket: string = "images",
  folder: string = "uploads"
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  } catch (e) {
    console.error("uploadImage error:", e);
    return null;
  }
}

/**
 * Upload a base64 data URL to Supabase Storage
 */
export async function uploadBase64Image(
  base64Data: string,
  bucket: string = "images",
  folder: string = "uploads"
): Promise<string | null> {
  try {
    // Extract the base64 data
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) return null;

    const fileExt = matches[1].toLowerCase() === "jpeg" ? "jpg" : matches[1].toLowerCase();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const buffer = Buffer.from(matches[2], "base64");

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: `image/${fileExt}`,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  } catch (e) {
    console.error("uploadBase64Image error:", e);
    return null;
  }
}