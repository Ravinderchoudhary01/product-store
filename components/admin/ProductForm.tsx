// 'use client';
// import {useState} from 'react';import type {Product} from '@/types/product';
// export default function ProductForm({initial}:{initial?:Partial<Product>}){const [form,setForm]=useState({title:initial?.title||'',slug:initial?.slug||'',short_description:initial?.short_description||'',description:initial?.description||'',price:String(initial?.price||''),thumbnail_url:initial?.thumbnail_url||'',preview_url:initial?.preview_url||'',file_path:initial?.file_path||'',status:initial?.status||'draft'});const [file,setFile]=useState<File|null>(null);
// const [thumbnailFile, setThumbnailFile] =
//   useState<File | null>(null);

// const [msg,setMsg]=useState('');const [saving,setSaving]=useState(false);const update=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));const submit=async(e:any)=>{e.preventDefault();setSaving(true);setMsg('');try{let filePath=form.file_path;if(file){const fd=new FormData();fd.append('file',file);const ur=await fetch('/api/admin/upload',{method:'POST',body:fd});const ud=await ur.json();if(!ur.ok)throw new Error(ud.error);filePath=ud.path}const payload={...form,price:Number(form.price),file_path:filePath};const url=initial?.id?`/api/admin/products/${initial.id}`:'/api/admin/products';const r=await fetch(url,{method:initial?.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error);setMsg('Saved successfully.');if(!initial?.id)window.location.href='/admin/products';}catch(e:any){setMsg(e.message)}finally{setSaving(false)}};return <form className="admin-card admin-form" onSubmit={submit}>{[['title','Product name'],['slug','URL slug'],['short_description','Short description'],['thumbnail_url','Thumbnail URL'],['preview_url','Preview URL']].map(([k,l])=><label key={k} className="label">{l}<input className="input" value={(form as any)[k]} onChange={e=>update(k,e.target.value)} required={['title','slug','short_description'].includes(k)}/></label>)}<label className="label">Description<textarea className="textarea" value={form.description} onChange={e=>update('description',e.target.value)} required/></label><label className="label">Price (INR)<input className="input" type="number" min="1" value={form.price} onChange={e=>update('price',e.target.value)} required/></label><label className="label">Digital file (PDF/ZIP/etc.)<input className="input" type="file" onChange={e=>setFile(e.target.files?.[0]||null)} accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"/>{form.file_path&&<small className="muted">Current: {form.file_path}</small>}</label><label className="label">Or enter existing private file path<input className="input" value={form.file_path} onChange={e=>update('file_path',e.target.value)} required={!file}/></label><label className="label">Status<select className="select" value={form.status} onChange={e=>update('status',e.target.value)}><option value="draft">Draft</option><option value="active">Active</option></select></label>{msg&&<div className={msg==='Saved successfully.'?'success':'error'}>{msg}</div>}<div className="form-actions"><button className="btn warm" disabled={saving}>{saving?'Saving…':'Save product →'}</button><a className="btn secondary" href="/admin/products">Cancel</a></div></form>}

// this logic accept the file upload working fine 
// 'use client';

// import { useState } from 'react';
// import type { Product } from '@/types/product';

// export default function ProductForm({
//   initial,
// }: {
//   initial?: Partial<Product>;
// }) {
//   const [form, setForm] = useState({
//     title: initial?.title || '',
//     slug: initial?.slug || '',
//     short_description: initial?.short_description || '',
//     description: initial?.description || '',
//     price: String(initial?.price || ''),
//     thumbnail_url: initial?.thumbnail_url || '',
//     preview_url: initial?.preview_url || '',
//     file_path: initial?.file_path || '',
//     status: initial?.status || 'draft',
//   });

//   const [file, setFile] = useState<File | null>(null);

//   const [thumbnailFile, setThumbnailFile] =
//     useState<File | null>(null);

//   const [msg, setMsg] = useState('');
//   const [saving, setSaving] = useState(false);

//   const update = (k: string, v: string) =>
//     setForm((f) => ({
//       ...f,
//       [k]: v,
//     }));

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setSaving(true);
//     setMsg('');

//     try {
//       let filePath = form.file_path;
//       let thumbnailUrl = form.thumbnail_url;

//       // ==========================================
//       // 1. UPLOAD PRODUCT THUMBNAIL
//       // ==========================================

//       if (thumbnailFile) {
//         const thumbnailForm = new FormData();

//         thumbnailForm.append(
//           'file',
//           thumbnailFile
//         );

//         thumbnailForm.append(
//           'type',
//           'thumbnail'
//         );

//         const thumbnailResponse = await fetch(
//           '/api/admin/upload',
//           {
//             method: 'POST',
//             body: thumbnailForm,
//           }
//         );

//         const thumbnailData =
//           await thumbnailResponse.json();

//         if (!thumbnailResponse.ok) {
//           throw new Error(
//             thumbnailData.error ||
//               'Thumbnail upload failed'
//           );
//         }

//         thumbnailUrl = thumbnailData.url;
//       }

//       // ==========================================
//       // 2. UPLOAD DIGITAL PRODUCT FILE
//       // ==========================================

//       if (file) {
//         const fd = new FormData();

//         fd.append('file', file);

//         const uploadResponse = await fetch(
//           '/api/admin/upload',
//           {
//             method: 'POST',
//             body: fd,
//           }
//         );

//         const uploadData =
//           await uploadResponse.json();

//         if (!uploadResponse.ok) {
//           throw new Error(
//             uploadData.error ||
//               'File upload failed'
//           );
//         }

//         filePath = uploadData.path;
//       }

//       // ==========================================
//       // 3. SAVE PRODUCT
//       // ==========================================

//       const payload = {
//         ...form,

//         thumbnail_url: thumbnailUrl,

//         file_path: filePath,

//         price: Number(form.price),
//       };

//       const url = initial?.id
//         ? `/api/admin/products/${initial.id}`
//         : '/api/admin/products';

//       const response = await fetch(url, {
//         method: initial?.id
//           ? 'PUT'
//           : 'POST',

//         headers: {
//           'Content-Type': 'application/json',
//         },

//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.error ||
//             'Unable to save product'
//         );
//       }

//       setMsg('Saved successfully.');

//       if (!initial?.id) {
//         window.location.href =
//           '/admin/products';
//       }
//     } catch (error: any) {
//       setMsg(
//         error.message ||
//           'Something went wrong'
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <form
//       className="admin-card admin-form"
//       onSubmit={submit}
//     >
//       {/* ==========================================
//           BASIC PRODUCT INFORMATION
//       ========================================== */}

//       {[
//         ['title', 'Product name'],
//         ['slug', 'URL slug'],
//         [
//           'short_description',
//           'Short description',
//         ],
//         ['preview_url', 'Preview URL'],
//       ].map(([k, l]) => (
//         <label
//           key={k}
//           className="label"
//         >
//           {l}

//           <input
//             className="input"
//             value={(form as any)[k]}
//             onChange={(e) =>
//               update(k, e.target.value)
//             }
//             required={[
//               'title',
//               'slug',
//               'short_description',
//             ].includes(k)}
//           />
//         </label>
//       ))}

//       {/* ==========================================
//           DESCRIPTION
//       ========================================== */}

//       <label className="label">
//         Description

//         <textarea
//           className="textarea"
//           value={form.description}
//           onChange={(e) =>
//             update(
//               'description',
//               e.target.value
//             )
//           }
//           required
//         />
//       </label>

//       {/* ==========================================
//           PRICE
//       ========================================== */}

//       <label className="label">
//         Price (INR)

//         <input
//           className="input"
//           type="number"
//           min="1"
//           value={form.price}
//           onChange={(e) =>
//             update(
//               'price',
//               e.target.value
//             )
//           }
//           required
//         />
//       </label>

//       {/* ==========================================
//           PRODUCT THUMBNAIL
//       ========================================== */}

//       <label className="label">
//         Product Thumbnail

//         <input
//           className="input"
//           type="file"
//           accept="image/jpeg,image/png,image/webp"
//           onChange={(e) =>
//             setThumbnailFile(
//               e.target.files?.[0] || null
//             )
//           }
//         />

//         {thumbnailFile && (
//           <small className="muted">
//             Selected: {thumbnailFile.name}
//           </small>
//         )}

//         {form.thumbnail_url &&
//           !thumbnailFile && (
//             <small className="muted">
//               Current thumbnail is already uploaded.
//             </small>
//           )}
//       </label>

//       {/* ==========================================
//           DIGITAL PRODUCT FILE
//       ========================================== */}

//       <label className="label">
//         Digital file (PDF/ZIP/etc.)

//         <input
//           className="input"
//           type="file"
//           onChange={(e) =>
//             setFile(
//               e.target.files?.[0] || null
//             )
//           }
//           accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
//         />

//         {form.file_path && (
//           <small className="muted">
//             Current: {form.file_path}
//           </small>
//         )}
//       </label>

//       {/* ==========================================
//           EXISTING PRIVATE FILE PATH
//       ========================================== */}

//       <label className="label">
//         Or enter existing private file path

//         <input
//           className="input"
//           value={form.file_path}
//           onChange={(e) =>
//             update(
//               'file_path',
//               e.target.value
//             )
//           }
//           required={!file}
//         />
//       </label>

//       {/* ==========================================
//           STATUS
//       ========================================== */}

//       <label className="label">
//         Status

//         <select
//           className="select"
//           value={form.status}
//           onChange={(e) =>
//             update(
//               'status',
//               e.target.value
//             )
//           }
//         >
//           <option value="draft">
//             Draft
//           </option>

//           <option value="active">
//             Active
//           </option>
//         </select>
//       </label>

//       {/* ==========================================
//           MESSAGE
//       ========================================== */}

//       {msg && (
//         <div
//           className={
//             msg === 'Saved successfully.'
//               ? 'success'
//               : 'error'
//           }
//         >
//           {msg}
//         </div>
//       )}

//       {/* ==========================================
//           ACTIONS
//       ========================================== */}

//       <div className="form-actions">
//         <button
//           className="btn warm"
//           disabled={saving}
//         >
//           {saving
//             ? 'Saving…'
//             : 'Save product →'}
//         </button>

//         <a
//           className="btn secondary"
//           href="/admin/products"
//         >
//           Cancel
//         </a>
//       </div>
//     </form>
//   );
// }

// this logic to add the google drive link instead of file upload
'use client';

import { useState } from 'react';
import type { Product } from '@/types/product';

export default function ProductForm({
  initial,
}: {
  initial?: Partial<Product>;
}) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    short_description:
      initial?.short_description || '',
    description: initial?.description || '',
    price: String(initial?.price || ''),
    thumbnail_url:
      initial?.thumbnail_url || '',
    preview_url:
      initial?.preview_url || '',
    file_path:
      initial?.file_path || '',
    status:
      initial?.status || 'draft',
  });

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (
    k: string,
    v: string
  ) =>
    setForm((f) => ({
      ...f,
      [k]: v,
    }));

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaving(true);
    setMsg('');

    try {
      let thumbnailUrl =
        form.thumbnail_url;

      // ==========================================
      // 1. UPLOAD PRODUCT THUMBNAIL
      // ==========================================

      if (thumbnailFile) {
        const thumbnailForm =
          new FormData();

        thumbnailForm.append(
          'file',
          thumbnailFile
        );

        thumbnailForm.append(
          'type',
          'thumbnail'
        );

        const thumbnailResponse =
          await fetch(
            '/api/admin/upload',
            {
              method: 'POST',
              body: thumbnailForm,
            }
          );

        const thumbnailData =
          await thumbnailResponse.json();

        if (!thumbnailResponse.ok) {
          throw new Error(
            thumbnailData.error ||
              'Thumbnail upload failed'
          );
        }

        thumbnailUrl =
          thumbnailData.url;
      }

      // ==========================================
      // 2. VALIDATE GOOGLE DRIVE URL
      // ==========================================

      const driveUrl =
        form.file_path.trim();

      if (!driveUrl) {
        throw new Error(
          'Google Drive download link is required'
        );
      }

      if (
        !driveUrl.includes(
          'drive.google.com'
        )
      ) {
        throw new Error(
          'Please enter a valid Google Drive link'
        );
      }

      // ==========================================
      // 3. SAVE PRODUCT
      // ==========================================

      const payload = {
        ...form,

        thumbnail_url:
          thumbnailUrl,

        // Store Google Drive URL
        file_path:
          driveUrl,

        price:
          Number(form.price),
      };

      const url = initial?.id
        ? `/api/admin/products/${initial.id}`
        : '/api/admin/products';

      const response =
        await fetch(url, {
          method: initial?.id
            ? 'PUT'
            : 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload
          ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to save product'
        );
      }

      setMsg(
        'Saved successfully.'
      );

      if (!initial?.id) {
        window.location.href =
          '/admin/products';
      }
    } catch (error: any) {
      setMsg(
        error.message ||
          'Something went wrong'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="admin-card admin-form"
      onSubmit={submit}
    >
      {/* ==========================================
          BASIC INFORMATION
      ========================================== */}

      {[
        ['title', 'Product name'],
        ['slug', 'URL slug'],
        [
          'short_description',
          'Short description',
        ],
        [
          'preview_url',
          'Preview URL',
        ],
      ].map(([k, l]) => (
        <label
          key={k}
          className="label"
        >
          {l}

          <input
            className="input"
            value={(form as any)[k]}
            onChange={(e) =>
              update(
                k,
                e.target.value
              )
            }
            required={[
              'title',
              'slug',
              'short_description',
            ].includes(k)}
          />
        </label>
      ))}

      {/* ==========================================
          DESCRIPTION
      ========================================== */}

      <label className="label">
        Description

        <textarea
          className="textarea"
          value={form.description}
          onChange={(e) =>
            update(
              'description',
              e.target.value
            )
          }
          required
        />
      </label>

      {/* ==========================================
          PRICE
      ========================================== */}

      <label className="label">
        Price (INR)

        <input
          className="input"
          type="number"
          min="1"
          value={form.price}
          onChange={(e) =>
            update(
              'price',
              e.target.value
            )
          }
          required
        />
      </label>

      {/* ==========================================
          PRODUCT THUMBNAIL
      ========================================== */}

      <label className="label">
        Product Thumbnail

        <input
          className="input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            setThumbnailFile(
              e.target.files?.[0] ||
                null
            )
          }
        />

        {thumbnailFile && (
          <small className="muted">
            Selected:{' '}
            {thumbnailFile.name}
          </small>
        )}

        {form.thumbnail_url &&
          !thumbnailFile && (
            <small className="muted">
              Current thumbnail is
              already uploaded.
            </small>
          )}
      </label>

      {/* ==========================================
          GOOGLE DRIVE FILE
      ========================================== */}

      <label className="label">
        Google Drive Download Link

        <input
          className="input"
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          value={form.file_path}
          onChange={(e) =>
            update(
              'file_path',
              e.target.value
            )
          }
          required
        />

        {form.file_path && (
          <small className="muted">
            This Google Drive link will
            be provided after successful
            payment.
          </small>
        )}
      </label>

      {/* ==========================================
          STATUS
      ========================================== */}

      <label className="label">
        Status

        <select
          className="select"
          value={form.status}
          onChange={(e) =>
            update(
              'status',
              e.target.value
            )
          }
        >
          <option value="draft">
            Draft
          </option>

          <option value="active">
            Active
          </option>
        </select>
      </label>

      {/* ==========================================
          MESSAGE
      ========================================== */}

      {msg && (
        <div
          className={
            msg ===
            'Saved successfully.'
              ? 'success'
              : 'error'
          }
        >
          {msg}
        </div>
      )}

      {/* ==========================================
          ACTIONS
      ========================================== */}

      <div className="form-actions">
        <button
          className="btn warm"
          disabled={saving}
        >
          {saving
            ? 'Saving…'
            : 'Save product →'}
        </button>

        <a
          className="btn secondary"
          href="/admin/products"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}