-- Optional starter product. Replace file_path after uploading your file.
insert into public.products (title,slug,short_description,description,price,file_path,status)
values ('Demo Digital Guide','demo-digital-guide','A demo product for testing the store.','Replace this demo content with your own product description. Upload the real file to Supabase Storage and update file_path from the admin panel.',499,'products/demo.pdf','draft')
on conflict (slug) do nothing;
