import { File } from 'expo-file-system';
import { supabase } from './supabaseClient';

export async function uploadImageToSupabase(uri: string, path: string): Promise<string> {
  const file = new File(uri);
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from('imagens')
    .upload(path, uint8Array, { upsert: true, contentType: 'image/jpeg' });

  if (error) throw error;

  // Retorna a URL pública da imagem
  return supabase.storage.from('imagens').getPublicUrl(path).data.publicUrl;
}