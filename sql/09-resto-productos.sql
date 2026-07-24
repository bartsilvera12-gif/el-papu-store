-- =====================================================================
-- El Papu Store — Resto del catálogo (P51, P55-P68): 14 productos
-- =====================================================================
-- Cascos de moto, hidrolavadoras, vasos térmicos, aromatizante, palo
-- selfie, cuadro y un soporte. Idempotente (upsert por slug).
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

-- ===== TÉRMICOS =====
('vaso-termico-magang-elpapu-albirroja','Vaso Térmico Magang "El Papu" — Albirroja','PAPU-TER-008',(select id from cat where slug='termicos'),
 'Vaso térmico Magang El Papu diseño camiseta Albirroja de Paraguay, con tapa.',
 'Vaso térmico Magang edición "El Papu" con diseño de la camiseta de la Albirroja (Selección Paraguaya). Acero inoxidable doble pared, mantiene la temperatura por horas, incluye tapa. Ideal para hinchas.',
 jsonb_build_array('Acero inox doble pared','Diseño camiseta Albirroja','Mantiene temperatura','Incluye tapa','Edición El Papu'),
 70000, null, 20, 4, 'viral','/assets/vaso-termico-magang-elpapu-albirroja.webp','from-red-500/25 to-black', true, true, 254),

('vasos-termicos-magang-elpapu-rosa-blanco','Vaso Térmico Magang "El Papu" (Rosa / Blanco)','PAPU-TER-009',(select id from cat where slug='termicos'),
 'Vaso térmico Magang El Papu con tapa y manija, en rosa y blanco.',
 'Vaso térmico Magang edición "El Papu" con tapa deslizante y manija de transporte. Acero inoxidable doble pared que mantiene la temperatura por horas. Disponible en rosa y blanco.',
 jsonb_build_array('Acero inox doble pared','Tapa con manija','Mantiene temperatura','Diseño El Papu','Colores rosa y blanco'),
 90000, null, 18, 4, 'nuevo','/assets/vasos-termicos-magang-elpapu-rosa-blanco.webp','from-pink-500/25 to-black', true, false, 255),

-- ===== ACCESORIOS =====
('aromatizante-solar-auto-helicoptero','Aromatizante Solar para Auto — Helicóptero','PAPU-ACC-007',(select id from cat where slug='accesorios'),
 'Aromatizante solar de auto con helicóptero giratorio + perfume incluido.',
 'Aromatizante decorativo para el tablero del auto con hélice de helicóptero que gira con energía solar. Incluye frasco de perfume (5ml) y gotero para recargar el aroma. Detalle llamativo y funcional.',
 jsonb_build_array('Hélice giratoria solar','Incluye perfume 5ml','Gotero para recargar','Decorativo para tablero','No usa pilas'),
 130000, null, 12, 3, 'nuevo','/assets/aromatizante-solar-auto-helicoptero.webp','from-red-600/25 to-black', true, false, 260),

('luo-palo-selfie-tripode-z508','LUO Palo Selfie + Trípode Estabilizador LU-Z508 (190cm)','PAPU-ACC-008',(select id from cat where slug='accesorios'),
 'Palo selfie y trípode estabilizador extensible hasta 190cm, con control.',
 'Palo selfie 2 en 1 LUO LU-Z508 que se despliega con un clic y funciona como trípode estabilizador. Se extiende hasta 190cm, con cabezal pan-tilt y disparador. Ideal para fotos, videos y transmisiones.',
 jsonb_build_array('Extensible hasta 190cm','2 en 1: selfie + trípode','Apertura one-click','Cabezal pan-tilt','Con disparador'),
 150000, null, 15, 3, 'nuevo','/assets/luo-palo-selfie-tripode-z508.webp','from-teal-600/25 to-black', true, false, 261),

('soporte-pared-metalico','Soporte de Pared Metálico','PAPU-ACC-009',(select id from cat where slug='accesorios'),
 'Soporte de pared metálico negro, resistente, para montaje fijo.',
 'Soporte de pared en metal con recubrimiento negro mate, robusto y con tornillos de montaje. Diseño minimalista para fijar en pared. (Producto a confirmar detalle/uso exacto.)',
 jsonb_build_array('Metal recubierto en negro','Montaje a pared','Robusto','Diseño minimalista','Tornillos incluidos'),
 80000, null, 10, 2, null,'/assets/soporte-pared-metalico.webp','from-neutral-700/40 to-black', true, false, 262),

-- ===== MOTOS (cascos) =====
('casco-integral-negro-mate','Casco Integral Negro Mate','PAPU-MOT-002',(select id from cat where slug='motos'),
 'Casco integral negro mate con visor y ventilación, uso vial.',
 'Casco integral negro mate con pantalla de policarbonato, sistema de ventilación e interior acolchado. Diseño aerodinámico y cómodo para el uso diario. (Marca a confirmar.)',
 jsonb_build_array('Casco integral','Acabado negro mate','Pantalla policarbonato','Ventilación','Interior acolchado'),
 580000, null, 6, 2, null,'/assets/casco-integral-negro-mate.webp','from-neutral-800/50 to-black', true, false, 270),

('casco-link-negro','Casco LINK Integral Negro','PAPU-MOT-003',(select id from cat where slug='motos'),
 'Casco integral LINK negro con pantalla y ventilación.',
 'Casco integral marca LINK en color negro, con pantalla de policarbonato con tratamiento, sistema de ventilación e interior desmontable. Certificación de seguridad para uso vial.',
 jsonb_build_array('Marca LINK','Casco integral','Pantalla con tratamiento','Ventilación','Interior desmontable'),
 500000, null, 6, 2, null,'/assets/casco-link-negro.webp','from-neutral-800/50 to-black', true, false, 271),

('casco-myhelmets-visor-dorado','Casco MyHelmets Negro Mate — Visor Dorado','PAPU-MOT-004',(select id from cat where slug='motos'),
 'Casco integral MyHelmets negro mate con visor iridium dorado.',
 'Casco integral premium MyHelmets en negro mate con pantalla iridium dorada de alto impacto visual. Sistema de ventilación, interior desmontable lavable y diseño aerodinámico. Tope de gama.',
 jsonb_build_array('Marca MyHelmets','Visor iridium dorado','Negro mate premium','Ventilación aerodinámica','Interior lavable'),
 1350000, null, 4, 2, 'top','/assets/casco-myhelmets-visor-dorado.webp','from-yellow-600/25 to-black', true, true, 272),

('casco-shaft-589-visor-dorado','Casco Shaft 589 Negro Mate — Visor Dorado','PAPU-MOT-005',(select id from cat where slug='motos'),
 'Casco integral Shaft modelo 589 negro mate con visor dorado, certificado ECE.',
 'Casco integral Shaft modelo 589 en negro mate con pantalla iridium dorada, certificación ECE 06. Ventilación multipunto, interior desmontable y lavable. Estilo racing.',
 jsonb_build_array('Marca Shaft modelo 589','Certificación ECE','Visor iridium dorado','Ventilación multipunto','Interior lavable'),
 1080000, null, 4, 2, 'top','/assets/casco-shaft-589-visor-dorado.webp','from-yellow-600/25 to-black', true, true, 273),

('casco-axxis-hawk-rsb','Casco Axxis Hawk RSB Negro Mate','PAPU-MOT-006',(select id from cat where slug='motos'),
 'Casco integral Axxis Hawk RSB racing aerodinámico, listo para Pinlock.',
 'Casco integral Axxis Hawk Shell RSB Racing Aerodynamic en negro mate. Pantalla transparente lista para Pinlock (FogOff), ventilación de alto flujo e interior desmontable. Excelente relación calidad-precio.',
 jsonb_build_array('Axxis Hawk RSB Racing','Listo para Pinlock','Aerodinámico','Ventilación alto flujo','Interior desmontable'),
 790000, null, 5, 2, 'top','/assets/casco-axxis-hawk-rsb.webp','from-neutral-800/50 to-black', true, true, 274),

('casco-ls2-visor-rojo','Casco LS2 Negro Mate — Visor Rojo Iridium','PAPU-MOT-007',(select id from cat where slug='motos'),
 'Casco integral LS2 negro mate con visor iridium rojo.',
 'Casco integral LS2 en negro mate con pantalla iridium roja de alto impacto. Calota resistente, ventilación e interior acolchado desmontable. Marca reconocida a nivel mundial.',
 jsonb_build_array('Marca LS2','Visor iridium rojo','Negro mate','Ventilación','Interior desmontable'),
 870000, null, 5, 2, null,'/assets/casco-ls2-visor-rojo.webp','from-red-600/25 to-black', true, false, 275),

-- ===== DECORACIÓN =====
('cuadro-freezer-dragon-ball','Cuadro Decorativo Freezer (Dragon Ball)','PAPU-DEC-011',(select id from cat where slug='deco'),
 'Cuadro decorativo de Freezer (Dragon Ball) impresión HD sobre soporte rígido.',
 'Cuadro decorativo con Freezer de Dragon Ball, impresión digital de alta resolución con acabado brillante sobre soporte rígido, listo para colgar. Ideal para gamers, otakus y fans del anime.',
 jsonb_build_array('Diseño Freezer (Dragon Ball)','Impresión HD brillante','Soporte rígido','Listo para colgar','Tema anime'),
 50000, null, 15, 3, 'viral','/assets/cuadro-freezer-dragon-ball.webp','from-purple-600/25 to-black', true, false, 280),

-- ===== AUTOS (hidrolavadoras) =====
('kojima-hydromax-1800w-hidrolavadora','Kojima HydroMax 1800W — Hidrolavadora Alta Presión','PAPU-AUT-034',(select id from cat where slug='autos'),
 'Hidrolavadora Kojima HydroMax 1800W, 140 bar, con lanza de espuma y accesorios.',
 'Hidrolavadora de alta presión Kojima HydroMax 1800W, hasta 140 bar y 7 L/min. Incluye lanza espumadora, manguera, pistola y boquilla regulable (chorro abanico o directo). Ideal para lavar autos, motos y patios.',
 jsonb_build_array('1800W — 140 bar','Hasta 7 L/min','Lanza espumadora incluida','Boquilla regulable','Autos, motos y patios'),
 790000, null, 6, 2, 'top','/assets/kojima-hydromax-1800w-hidrolavadora.webp','from-red-600/25 to-black', true, true, 290),

('kojima-hydropro-2000w-hidrolavadora','Kojima HydroPro 2000W — Hidrolavadora Profesional','PAPU-AUT-035',(select id from cat where slug='autos'),
 'Hidrolavadora profesional Kojima HydroPro 2000W, 160 bar, motor de inducción.',
 'Hidrolavadora profesional Kojima HydroPro 2000W con motor de inducción, hasta 160 bar y 7 L/min. Incluye lanza espumadora, boquillas de colores, manguera y pistola. Máximo poder para uso intensivo.',
 jsonb_build_array('2000W — 160 bar','Motor de inducción','Hasta 7 L/min','Lanza espumadora + boquillas','Uso profesional intensivo'),
 1300000, null, 4, 2, 'top','/assets/kojima-hydropro-2000w-hidrolavadora.webp','from-red-700/25 to-black', true, true, 291)

on conflict (slug) do update set
  name = excluded.name, category_id = excluded.category_id,
  short_description = excluded.short_description, description = excluded.description,
  features = excluded.features, price = excluded.price, compare_at_price = excluded.compare_at_price,
  stock = excluded.stock, min_stock = excluded.min_stock, badge = excluded.badge,
  image_url = excluded.image_url, color = excluded.color,
  is_active = excluded.is_active, is_featured = excluded.is_featured, display_order = excluded.display_order;

commit;

select c.name as categoria, count(p.id) as productos
from categories c left join products p on p.category_id = c.id
group by c.name order by c.name;
select count(*) as total from products;
