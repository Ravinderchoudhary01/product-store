// import {NextResponse} from 'next/server';import {createClient} from '@/lib/supabase/server';import {createAdminClient} from '@/lib/supabase/admin';
// export async function POST(req:Request){const {data:{user}}=await (await createClient()).auth.getUser();if(!user||user.email!==process.env.ADMIN_EMAIL)return NextResponse.json({error:'Unauthorized'},{status:401});const form=await req.formData();const file=form.get('file');if(!(file instanceof File))return NextResponse.json({error:'File required'},{status:400});if(file.size>100*1024*1024)return NextResponse.json({error:'Maximum file size is 100MB'},{status:400});const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');const path=`products/${Date.now()}-${safe}`;const {error}=await createAdminClient().storage.from('digital-products').upload(path,await file.arrayBuffer(),{contentType:file.type||'application/octet-stream',upsert:false});if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({path})}


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const form = await req.formData();

  const file = form.get('file');
  const type = form.get('type') || 'digital';

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'File required' },
      { status: 400 }
    );
  }

  const db = createAdminClient();

  // ---------------------------------------
  // THUMBNAIL UPLOAD
  // ---------------------------------------
  if (type === 'thumbnail') {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Thumbnail must be JPG, PNG or WebP',
        },
        { status: 400 }
      );
    }

    // 10 MB max for thumbnail
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'Maximum thumbnail size is 10MB',
        },
        { status: 400 }
      );
    }

    const safe = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '-'
    );

    const path = `thumbnails/${Date.now()}-${safe}`;

    const { error } = await db.storage
      .from('product-thumbnails')
      .upload(
        path,
        await file.arrayBuffer(),
        {
          contentType: file.type,
          upsert: false,
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { data: publicUrl } = db.storage
      .from('product-thumbnails')
      .getPublicUrl(path);

    return NextResponse.json({
      path,
      url: publicUrl.publicUrl,
    });
  }

  // ---------------------------------------
  // EXISTING DIGITAL FILE UPLOAD
  // ---------------------------------------

  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json(
      {
        error: 'Maximum file size is 100MB',
      },
      { status: 400 }
    );
  }

  const safe = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    '-'
  );

  const path = `products/${Date.now()}-${safe}`;

  const { error } = await db.storage
    .from('digital-products')
    .upload(
      path,
      await file.arrayBuffer(),
      {
        contentType:
          file.type || 'application/octet-stream',
        upsert: false,
      }
    );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ path });
}