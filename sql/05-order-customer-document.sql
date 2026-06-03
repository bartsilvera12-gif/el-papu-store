-- =====================================================================
-- El Papu Store — Documento del cliente en `orders`
-- =====================================================================
-- Correr desde el SQL Editor de Supabase (schema elpapustore).
-- No destructivo: solo ADD COLUMN IF NOT EXISTS.
--
-- El checkout ya captura y valida la cédula/RUC (form.documento) y la
-- envía a PagoPar, pero hasta ahora no se guardaba en el pedido. Esta
-- columna permite mostrarla en el panel admin (sección "Cliente").
-- =====================================================================

set search_path to elpapustore, public;

alter table orders
  add column if not exists customer_document text;

-- Verificar
select column_name, data_type
from information_schema.columns
where table_schema = 'elpapustore'
  and table_name = 'orders'
  and column_name = 'customer_document';
