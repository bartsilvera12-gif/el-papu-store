-- =====================================================================
-- El Papu Store — Schema para integración PagoPar
-- =====================================================================
-- Correr este script desde el SQL Editor de Supabase (con permisos
-- suficientes). Schema: elpapustore.
--
-- TODO no destructivo: solo ADD COLUMN / CREATE TABLE IF NOT EXISTS.
-- No borra columnas ni datos existentes.
-- =====================================================================

set search_path to elpapustore, public;

-- ---------------------------------------------------------------------
-- 1) Columnas PagoPar en `orders`
-- ---------------------------------------------------------------------
alter table orders
  add column if not exists pagopar_hash text,
  add column if not exists pagopar_id_pedido_comercio text,
  add column if not exists pagopar_numero_pedido text,
  add column if not exists pagopar_comprobante text,
  add column if not exists pagopar_forma_pago text,
  add column if not exists pagopar_forma_pago_id text,
  add column if not exists pagopar_fecha_pago timestamptz,
  add column if not exists pagopar_monto_pagado integer,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_provider text;

-- payment_status valores válidos:
--   pending | paid | cancelled | failed
-- (separado de `status` que sigue siendo el fulfillment: pending/confirmed/shipped/delivered/cancelled)

alter table orders
  drop constraint if exists orders_payment_status_check;
alter table orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'cancelled', 'failed'));

-- Índice para lookup rápido por hash (webhook entrante)
create unique index if not exists orders_pagopar_hash_uniq
  on orders (pagopar_hash) where pagopar_hash is not null;

-- Índice para evitar duplicados de id_pedido_comercio
create unique index if not exists orders_pagopar_id_pedido_comercio_uniq
  on orders (pagopar_id_pedido_comercio) where pagopar_id_pedido_comercio is not null;

-- ---------------------------------------------------------------------
-- 2) Tabla de auditoría de webhooks
-- ---------------------------------------------------------------------
-- Guarda TODOS los webhooks recibidos (válidos e inválidos) para debug
-- y trazabilidad. No se borra nunca.
create table if not exists pagopar_webhooks (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  hash_pedido text,
  order_id uuid references orders(id) on delete set null,
  token_valid boolean not null default false,
  pagado boolean,
  cancelado boolean,
  payload jsonb not null,
  remote_ip text,
  user_agent text,
  processed boolean not null default false,
  process_error text
);

create index if not exists pagopar_webhooks_hash_idx
  on pagopar_webhooks (hash_pedido);
create index if not exists pagopar_webhooks_order_id_idx
  on pagopar_webhooks (order_id);
create index if not exists pagopar_webhooks_received_at_idx
  on pagopar_webhooks (received_at desc);

-- ---------------------------------------------------------------------
-- 3) RLS — bloquear lectura/escritura desde anon. Solo backend (service_role)
-- ---------------------------------------------------------------------
alter table pagopar_webhooks enable row level security;
-- Sin policies = anon no puede ni leer ni escribir.
-- service_role bypassa RLS automáticamente.

-- Verificar
select column_name, data_type
from information_schema.columns
where table_schema = 'elpapustore'
  and table_name = 'orders'
  and column_name like 'pagopar_%' or column_name like 'payment_%'
order by ordinal_position;

select 'pagopar_webhooks' as tabla, count(*) as filas from pagopar_webhooks;
