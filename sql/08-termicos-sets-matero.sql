-- =====================================================================
-- El Papu Store — Sets materos térmicos Magang "El Papu" (P52-P54)
-- =====================================================================
-- 3 sets completos (termo + mate + bombilla + yerbera + vaso + bolso),
-- categoría termicos. Idempotente (upsert por slug).
-- Imágenes en /assets/<slug>.webp.
-- =====================================================================

set search_path to elpapustore, public;

begin;

with cat as (select slug, id from categories)
insert into products (
  slug, name, sku, category_id,
  short_description, description, features,
  price, compare_at_price, stock, min_stock,
  badge, image_url, color,
  is_active, is_featured, display_order
) values

('set-matero-magang-elpapu-rosa','Set Matero Térmico Magang "El Papu" — Rosa','PAPU-TER-005',(select id from cat where slug='termicos'),
 'Set matero completo Magang El Papu en rosa: termo, mate, bombilla, yerbera, vaso y bolso.',
 'Set matero completo Magang edición "El Papu" en color rosa mate. Incluye termo de acero inoxidable de doble pared (mantiene la temperatura por horas), mate imperial, bombilla de acero, yerbera/porta-yerba, vaso térmico y bolso matero de cuero sintético para llevar todo. Kit ideal para regalo.',
 jsonb_build_array('Termo acero inox doble pared','Mate + bombilla de acero','Yerbera y vaso térmico','Bolso matero de cuero sintético','Edición El Papu color rosa'),
 180000, null, 10, 2, 'nuevo','/assets/set-matero-magang-elpapu-rosa.webp','from-pink-500/25 to-black', true, true, 251),

('set-matero-magang-elpapu-azul','Set Matero Térmico Magang "El Papu" — Azul','PAPU-TER-006',(select id from cat where slug='termicos'),
 'Set matero completo Magang El Papu en azul: termo, mate, bombilla, yerbera, vaso y bolso.',
 'Set matero completo Magang edición "El Papu" en color azul mate. Incluye termo de acero inoxidable de doble pared, mate imperial, bombilla de acero, yerbera/porta-yerba con tapa, vaso térmico y bolso matero. Kit completo para el mate diario o para regalar.',
 jsonb_build_array('Termo acero inox doble pared','Mate + bombilla de acero','Yerbera y vaso térmico','Bolso matero incluido','Edición El Papu color azul'),
 180000, null, 10, 2, 'nuevo','/assets/set-matero-magang-elpapu-azul.webp','from-blue-700/30 to-black', true, true, 252),

('set-matero-magang-elpapu-verde','Set Matero Térmico Magang "El Papu" — Verde','PAPU-TER-007',(select id from cat where slug='termicos'),
 'Set matero completo Magang El Papu en verde: termo, mate, bombilla, yerbera, vaso y bolso.',
 'Set matero completo Magang edición "El Papu" en color verde mate. Incluye termo de acero inoxidable de doble pared, mate imperial, bombilla de acero, yerbera/porta-yerba, vaso térmico y bolso matero de cuero sintético. Presentación premium, ideal para regalo.',
 jsonb_build_array('Termo acero inox doble pared','Mate + bombilla de acero','Yerbera y vaso térmico','Bolso matero de cuero sintético','Edición El Papu color verde'),
 180000, null, 10, 2, 'nuevo','/assets/set-matero-magang-elpapu-verde.webp','from-green-800/30 to-black', true, true, 253)

on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  features = excluded.features,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock = excluded.stock,
  min_stock = excluded.min_stock,
  badge = excluded.badge,
  image_url = excluded.image_url,
  color = excluded.color,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order;

commit;

select name, price, image_url from products
where slug like 'set-matero-magang-elpapu-%' order by display_order;
