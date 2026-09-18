create extension if not exists pgcrypto;

create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text unique not null,
 short_description text not null,
 description text not null,
 price numeric(12,2) not null check (price > 0),
 thumbnail_url text,
 preview_url text,
 file_path text not null,
 status text not null default 'draft' check (status in ('active','draft')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 product_id uuid references public.products(id) on delete set null,
 customer_name text not null,
 customer_email text not null,
 amount numeric(12,2) not null,
 razorpay_order_id text unique,
 razorpay_payment_id text,
 payment_status text not null default 'created' check (payment_status in ('created','paid','failed','refunded')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.download_tokens (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 token text unique not null,
 expires_at timestamptz not null,
 download_count integer not null default 0,
 created_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists orders_status_idx on public.orders(payment_status);
create index if not exists download_tokens_token_idx on public.download_tokens(token);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.download_tokens enable row level security;

create policy "public can view active products" on public.products for select using (status = 'active');

-- All writes and private reads are performed server-side with the service role.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('digital-products','digital-products',false,104857600,null)
on conflict (id) do nothing;
