-- =====================================================================
-- El Papu Store — Limpieza de datos de muestra
-- =====================================================================
-- Correr este script desde el SQL editor de Supabase (con permisos suficientes).
-- Schema: elpapustore
--
-- IMPORTANTE: si ya existen pedidos reales en `orders`, los order_items
-- mantendrán product_name como snapshot, pero product_id queda NULL al
-- borrar productos. Si NO querés perder pedidos existentes, dejar tal cual.
-- Si querés vaciar también pedidos, descomentar el bloque marcado.
-- =====================================================================

set search_path to elpapustore, public;

begin;

-- 1) Romper FK opcional product_id -> products (no borra pedidos, solo deja huérfanas las líneas)
update order_items set product_id = null where product_id is not null;

-- 2) Borrar productos, categorías y FAQs de muestra
delete from products;
delete from categories;
delete from faqs;

-- ----------------------------------------------------------------------
-- OPCIONAL: borrar también todos los pedidos. Descomentar si querés
-- arrancar 100% desde cero. Esto NO se puede deshacer.
-- ----------------------------------------------------------------------
-- delete from order_items;
-- delete from orders;

commit;

-- Verificar
select 'products' as tabla, count(*) as filas from products
union all select 'categories', count(*) from categories
union all select 'faqs', count(*) from faqs
union all select 'orders', count(*) from orders
union all select 'order_items', count(*) from order_items;
