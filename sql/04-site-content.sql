-- =====================================================================
-- El Papu Store — Tabla de contenido editable del sitio
-- =====================================================================
-- Correr desde el SQL Editor de Supabase (schema: elpapustore).
-- Guarda textos editables desde el admin (clave -> valor JSON).
-- No destructivo: CREATE TABLE IF NOT EXISTS + seed con ON CONFLICT.
-- =====================================================================

set search_path to elpapustore, public;

-- ---------------------------------------------------------------------
-- 1) Tabla clave/valor
-- ---------------------------------------------------------------------
create table if not exists site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) RLS — lectura pública (anon), escritura solo admin autenticado
-- ---------------------------------------------------------------------
alter table site_content enable row level security;

drop policy if exists site_content_public_read on site_content;
create policy site_content_public_read on site_content
  for select using (true);

drop policy if exists site_content_admin_write on site_content;
create policy site_content_admin_write on site_content
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- 3) Seed inicial: sección "Sobre nosotros"
-- ---------------------------------------------------------------------
insert into site_content (key, value) values
  ('about', jsonb_build_object(
    'title', 'La store con',
    'highlight', 'más estilo',
    'description', 'El Papu Store nace para ofrecer productos urbanos seleccionados, virales y de utilidad real. Buscamos que cada compra sea rápida, simple y con una experiencia visual diferente. Acá encontrás productos seleccionados, ofertas y novedades pensadas para clientes que quieren comprar fácil y con estilo.'
  ))
on conflict (key) do nothing;

-- Verificar
select key, value, updated_at from site_content;
