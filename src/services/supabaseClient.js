import { createClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

const supabaseUrl = 'https://fslxzhiujzgfbcdmdbef.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbHh6aGl1anpnZmJjZG1kYmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTk1OTMsImV4cCI6MjA3ODUzNTU5M30.At6U4s1XyUD9Vxpzru9Oi4ump3vTRyF2QbjhMEq5oHY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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