-- =====================================================================
-- El Papu Store — Seed inicial de categorías + productos reales
-- =====================================================================
-- Este es un TEMPLATE. Las URLs de Cloudinary se reemplazan corriendo:
--   node scripts/render-seed.mjs
-- que produce sql/02-seed-products.sql listo para ejecutar.
--
-- Stock ficticio y precios de referencia investigados de mercado PY.
-- Editar libremente desde el admin después.
-- =====================================================================

set search_path to elpapustore, public;

begin;

-- ---------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------
insert into categories (slug, name, description, icon, display_order, is_active) values
  ('autos',        'Autos',              'Accesorios y cuidado automotor',          '🚗', 10, true),
  ('motos',        'Motos',              'Cascos, accesorios y deco motera',        '🏍️', 20, true),
  ('vapes',        'Vapes',              'Vapeo descartable y recargables',         '💨', 30, true),
  ('termicos',     'Térmicos',           'Vasos y botellas térmicas branded',       '🥤', 40, true),
  ('deco',         'Decoración',         'Cuadros, placas y deco con onda',         '🖼️', 50, true),
  ('accesorios',   'Accesorios',         'Soportes, cargadores y más',              '⚡', 60, true),
  ('merch',        'Merch El Papu',      'Edición limitada con la marca',           '🔥', 70, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order,
  is_active = true;

-- ---------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------
-- Convención: price = precio final (lo que paga el cliente)
--             compare_at_price = precio "tachado" si hay oferta, sino NULL
-- ---------------------------------------------------------------------

with cat as (
  select slug, id from categories
)
insert into products (
  slug, name, sku, category_id,
  short_description, description, features,
  price, compare_at_price,
  stock, min_stock,
  badge, image_url, color,
  is_active, is_featured, display_order
) values
  -- 1) Vasos térmicos Albirroja FIFA 26 (set 2u)
  ('vasos-termicos-albirroja-fifa26',
   'Vasos Térmicos Albirroja FIFA 26 (set x2)',
   'PAPU-TER-001',
   (select id from cat where slug='termicos'),
   'Set de 2 vasos térmicos edición Mundial 2026 con diseño Albirroja.',
   'Edición especial Mundial 2026 con los colores y franjas de la selección paraguaya. Acero inoxidable doble pared, mantiene la bebida fría por horas. Incluye tapa con sellado. Diseño exclusivo "Albirroja" + "El Papu" con escudo APF.',
   array['Acero inoxidable doble pared','Tapa con sellado anti-derrame','Diseño exclusivo Albirroja FIFA 26','Set de 2 unidades','Capacidad ~500ml'],
   195000, 240000,
   18, 4,
   'edicion limitada', '__URL_vasos-termicos-albirroja-fifa26__', 'from-red-500/20 to-black',
   true, true, 10),

  -- 2) Vasos térmicos Magang El Papu (negro + blanco)
  ('vasos-termicos-magang-elpapu',
   'Vasos Térmicos Magang El Papu (negro + blanco)',
   'PAPU-TER-002',
   (select id from cat where slug='termicos'),
   'Dúo de vasos térmicos Magang branded El Papu, en negro y blanco mate.',
   'Vasos térmicos premium marca Magang con acabado mate y logo metalizado "El Papu". Set de dos colores: negro y blanco. Doble pared al vacío, base con detalle de acero pulido.',
   array['Marca Magang','Acabado mate premium','Logo El Papu metalizado','Set negro + blanco','Doble pared al vacío'],
   220000, 270000,
   14, 3,
   'nuevo', '__URL_vasos-termicos-magang-elpapu__', 'from-zinc-700/40 to-black',
   true, true, 20),

  -- 3) Casco LS2 FF353 Rapid Negro Mate
  ('casco-ls2-ff353-rapid-negro-mate',
   'Casco LS2 FF353 Rapid Negro Mate',
   'PAPU-MOT-001',
   (select id from cat where slug='motos'),
   'Casco integral LS2 FF353 Rapid certificado ECE 22.06, color negro mate.',
   'Casco integral de la prestigiosa marca LS2, modelo FF353 Rapid. Calota en termoplástico HPTT, pantalla de policarbonato con protección UV y antirayas, sistema de ventilación múltiple y interior desmontable lavable. Certificación ECE 22.06.',
   array['Certificación ECE 22.06','Calota HPTT termoplástico','Pantalla con tratamiento UV/antirayas','Ventilación multipunto','Interior desmontable y lavable'],
   950000, 1150000,
   6, 2,
   'top', '__URL_casco-ls2-ff353-rapid-negro-mate__', 'from-neutral-800/50 to-black',
   true, true, 30),

  -- 4) Placa decorativa Brasil "EL PAPU"
  ('placa-decorativa-brasil-elpapu',
   'Placa Decorativa Mercosul Brasil "EL PAPU"',
   'PAPU-DEC-001',
   (select id from cat where slug='deco'),
   'Placa estilo patente Mercosul Brasil personalizada con leyenda EL PAPU.',
   'Placa decorativa en formato Mercosul Brasil con leyenda "EL PAPU". Impresión digital de alta resolución sobre material rígido, lista para colgar o atornillar. Ideal para garage, taller, dormitorio o local.',
   array['Formato Mercosul Brasil','Impresión digital alta resolución','Lista para colgar','Medidas estándar 40x13cm aprox','Edición personalizada El Papu'],
   85000, 110000,
   25, 5,
   'viral', '__URL_placa-decorativa-brasil-elpapu__', 'from-blue-500/20 to-black',
   true, false, 40),

  -- 5) Cuadro políptico moto 3 piezas
  ('cuadro-poliptico-moto-3-piezas',
   'Cuadro Políptico Moto Sunset (3 piezas)',
   'PAPU-DEC-002',
   (select id from cat where slug='deco'),
   'Set de 3 cuadros decorativos modulares con motivo motero al atardecer.',
   'Composición decorativa de 3 piezas (políptico) con foto de motociclista y moto sport al atardecer. Impresión sobre soporte rígido, listo para montar en pared. Crea profundidad y movimiento en cualquier ambiente.',
   array['Set 3 piezas modulares','Impresión digital HD','Soporte rígido listo para colgar','Tema motero sunset','Ideal living, garage o cuarto'],
   250000, 320000,
   8, 2,
   null, '__URL_cuadro-poliptico-moto-3-piezas__', 'from-orange-500/20 to-black',
   true, false, 50),

  -- 6) Cuadro billete 100 USD holográfico + placas
  ('cuadro-billete-100-dolares-placas-elpapu',
   'Combo Deco: Billete 100 USD Holográfico + 2 Placas El Papu',
   'PAPU-DEC-003',
   (select id from cat where slug='deco'),
   'Cuadro decorativo del billete de 100 USD con efecto holográfico + dos placas mini estilo Paraguay y Brasil con leyenda EL PAPU.',
   'Combo de decoración listo para pegar/colgar: cuadro grande del billete de 100 dólares con acabado holográfico que cambia con la luz, más dos placas mini en formato matrícula Paraguay y Brasil personalizadas con leyenda "EL PAPU".',
   array['Cuadro billete 100 USD efecto holográfico','2 placas mini Paraguay y Brasil','Leyenda EL PAPU personalizada','Listo para colgar','Combo decorativo'],
   165000, 210000,
   12, 3,
   'combo', '__URL_cuadro-billete-100-dolares-placas-elpapu__', 'from-yellow-500/20 to-black',
   true, true, 60),

  -- 7) Lanyards El Papu Vol 3 PRO
  ('lanyards-elpapu-vol3-pro',
   'Lanyard El Papu Vol 3 PRO (rojo / negro)',
   'PAPU-MER-001',
   (select id from cat where slug='merch'),
   'Llavero / lanyard de cintura con diseño El Papu Vol 3 PRO en rojo y negro.',
   'Cordón porta-llaves estilo lanyard con clip metálico anti-vueltas, estampado sublimado a todo color con diseño "El Papu Vol 3 PRO". Tela poliéster reforzado, agarre cómodo y resistente al uso diario.',
   array['Poliéster reforzado','Clip metálico anti-vueltas','Estampado sublimado a todo color','Diseño El Papu Vol 3 PRO','Largo estándar ~50cm'],
   30000, null,
   45, 10,
   'merch', '__URL_lanyards-elpapu-vol3-pro__', 'from-red-600/30 to-black',
   true, true, 70),

  -- 8) Vape Life Pod Eco II Candy Ice 10K
  ('vape-life-pod-eco-ii-candy-ice-10k',
   'Vape Life Pod Eco II — Candy Ice 10.000 Puffs',
   'PAPU-VAP-001',
   (select id from cat where slug='vapes'),
   'Vape descartable Life Pod Eco II con cartucho recambiable, sabor Candy Ice, 10.000 puffs.',
   'Kit Life Pod Eco II: batería recargable de larga duración + cartucho descartable de 10.000 puffs sabor Candy Ice. Pantalla LED de batería y líquido. Sistema de cartucho reemplazable para reducir residuos. **Producto para adultos +18. Contiene nicotina.**',
   array['Hasta 10.000 puffs por cartucho','Batería recargable + pantalla LED','Cartucho reemplazable Eco II','Sabor Candy Ice','Solo +18 — contiene nicotina'],
   145000, 180000,
   20, 5,
   'viral', '__URL_vape-life-pod-eco-ii-candy-ice-10k__', 'from-pink-500/20 to-black',
   true, true, 80),

  -- 9) Cuadro plan de ahorro Lisa Simpson "Debo Ahorrar"
  ('cuadro-plan-de-ahorro-lisa-debo-ahorrar',
   'Cuadro Plan de Ahorro 10.000.000 — "Debo Ahorrar" (Lisa)',
   'PAPU-DEC-004',
   (select id from cat where slug='deco'),
   'Cuadro interactivo plan de ahorro con grilla para tachar y meta de 10 millones.',
   'Cuadro motivacional con la icónica Lisa Simpson diciendo "DEBO AHORRAR". Incluye grilla numerada para ir tachando montos a medida que ahorrás, con meta total de Gs. 10.000.000. Soporte rígido, fácil de colgar.',
   array['Grilla para tachar montos','Meta total 10.000.000','Diseño Lisa Simpson Debo Ahorrar','Soporte rígido listo para colgar','Regalo motivacional'],
   95000, 120000,
   22, 5,
   'viral', '__URL_cuadro-plan-de-ahorro-lisa-debo-ahorrar__', 'from-yellow-400/25 to-black',
   true, true, 90),

  -- 10) Kojima Windshield Mount (soporte ventosa parabrisas)
  ('soporte-kojima-windshield-mount-ventosa',
   'Soporte Celular Kojima Windshield Mount — Ventosa TPU',
   'PAPU-ACC-001',
   (select id from cat where slug='accesorios'),
   'Soporte para auto con ventosa de TPU para parabrisas o tablero, agarre seguro.',
   'Soporte vehicular de la marca Kojima (diseño japonés) con base de ventosa TPU de alta adherencia para parabrisas o tablero. Brazo articulado, rotación 360° y agarre seguro para celulares de hasta 7".',
   array['Base ventosa TPU alta adherencia','Brazo articulado','Rotación 360°','Compatible hasta 7"','Diseño Kojima Japan'],
   95000, 120000,
   18, 4,
   null, '__URL_soporte-kojima-windshield-mount-ventosa__', 'from-red-500/20 to-black',
   true, false, 100),

  -- 11) Kojima Cellphone Magnetic Mount
  ('soporte-kojima-cellphone-magnetic-mount',
   'Soporte Magnético Kojima Cellphone Magnetic Mount',
   'PAPU-ACC-002',
   (select id from cat where slug='accesorios'),
   'Soporte magnético Kojima para auto, rotación 360° y placas metálicas incluidas.',
   'Soporte magnético ultra potente de Kojima para celular en el auto. Diseño compacto en forma de "K", base adhesiva 3M, imán de neodimio que aguanta vibraciones y caminos irregulares. Incluye 2 placas metálicas universales.',
   array['Imán de neodimio reforzado','Rotación 360°','Base adhesiva 3M','Incluye 2 placas metálicas','Diseño Kojima Japan'],
   95000, 120000,
   16, 4,
   'top', '__URL_soporte-kojima-cellphone-magnetic-mount__', 'from-red-500/20 to-black',
   true, true, 110),

  -- 12) Vonixx Blend Ceramic & Carnaúba Spray Wax 500ml
  ('vonixx-blend-ceramic-carnauba-spray-wax-500ml',
   'Vonixx Blend — Cera Cerámica & Carnaúba Spray 500ml',
   'PAPU-AUT-001',
   (select id from cat where slug='autos'),
   'Cera líquida híbrida SiO2 + carnaúba en spray, brillo intenso y protección hasta 4 meses.',
   'Vonixx Blend es una cera líquida híbrida que combina SiO2 cerámico con carnaúba T1 pura. Aplica en pintura limpia, brinda brillo profundo, hidrofobicidad extrema y protección que dura hasta 4 meses. Ideal post-lavado o como toque rápido.',
   array['SiO2 + carnaúba T1','Hasta 4 meses de protección','Hidrofobicidad extrema','Aplicación en spray','Apto pintura, plásticos y vidrios'],
   120000, 150000,
   15, 3,
   null, '__URL_vonixx-blend-ceramic-carnauba-spray-wax-500ml__', 'from-blue-500/25 to-black',
   true, false, 120),

  -- 13) Vonixx V-Floc Shampoo 500ml
  ('vonixx-v-floc-shampoo-lava-autos-500ml',
   'Vonixx V-Floc — Shampoo Lava Autos Concentrado 500ml',
   'PAPU-AUT-002',
   (select id from cat where slug='autos'),
   'Shampoo super concentrado pH neutro, dilución hasta 1:400, máxima lubricidad.',
   'Shampoo automotor Vonixx V-Floc super concentrado, fórmula pH neutro que no remueve ceras ni sellantes. Dilución hasta 1:400 (un litro rinde cientos de lavados). Alta lubricidad para evitar micro-rayas. Perfumado.',
   array['pH neutro — no remueve ceras','Dilución hasta 1:400','Alta lubricidad','Espuma densa','Aroma a uva característico'],
   110000, 140000,
   17, 3,
   'top', '__URL_vonixx-v-floc-shampoo-lava-autos-500ml__', 'from-purple-500/25 to-black',
   true, false, 130),

  -- 14) Cargador auto Kojima 30W Dual USB-C
  ('cargador-auto-kojima-30w-dual-usbc-type-cx2',
   'Cargador Auto Kojima 30W Dual USB-C (Type-CX2)',
   'PAPU-ACC-003',
   (select id from cat where slug='accesorios'),
   'Cargador vehicular Kojima 30W con dos puertos USB-C PD, mini y metálico.',
   'Cargador para auto Kojima modelo Type-CX2 con dos puertos USB-C de 30W cada uno (Power Delivery). Carcasa metálica mini, casi embutida en la toma de 12V. Carga rápida para celular, tablet o accesorios.',
   array['2× USB-C 30W PD','Carcasa metálica premium','Diseño mini casi embutido','Carga rápida segura','Compatible 12V/24V'],
   85000, 110000,
   25, 5,
   'oferta', '__URL_cargador-auto-kojima-30w-dual-usbc-type-cx2__', 'from-red-500/20 to-black',
   true, true, 140)

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

-- Verificar
select c.name as categoria, count(p.id) as productos
from categories c
left join products p on p.category_id = c.id
group by c.name
order by c.name;

select count(*) as total_productos from products;
