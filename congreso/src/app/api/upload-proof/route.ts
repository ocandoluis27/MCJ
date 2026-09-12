import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Try Supabase first
    const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
    
    if (hasSupabaseUrl) {
      const { data, error } = await supabase
        .storage
        .from('comprobantes')
        .upload(`congreso/${fileName}`, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (!error && data) {
        const { data: { publicUrl } } = supabase
          .storage
          .from('comprobantes')
          .getPublicUrl(`congreso/${fileName}`);
          
        return NextResponse.json({ success: true, url: publicUrl });
      }
      console.warn('Supabase upload failed, falling back to local storage', error);
    }

    // Fallback to local storage
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
