-- =====================================================================
-- El Papu Store — Carga de catálogo (50 productos)
-- =====================================================================
-- Productos identificados desde las fotos del catálogo (zip drive).
-- Cada foto = 1 producto. Idempotente: upsert por slug (se puede correr
-- varias veces). Editá libremente stock/precio/descripción en el admin.
--
-- Categorías usadas: autos, deco, accesorios, termicos + NUEVA: gorras
--
-- Duplicados que se ACTUALIZAN (imagen + precio) en vez de duplicar:
--   P3  -> vonixx-blend-ceramic-carnauba-spray-wax-500ml
--   P18 -> vonixx-v-floc-shampoo-lava-autos-500ml
--   P39 -> soporte-kojima-windshield-mount-ventosa
--   P40 -> cargador-auto-kojima-30w-dual-usbc-type-cx2
--   P42 -> soporte-kojima-cellphone-magnetic-mount
--
-- IMÁGENES: se sirven desde /assets/<slug>.webp (archivos en assets/, ya
-- optimizados a WebP ~1000px). Funcionan en local y en producción una vez
-- desplegado el repo. Si más adelante se quiere migrar a Cloudinary, están
-- los originales en tmp-images/ y el script scripts/upload-catalogo-cloudinary.mjs.
-- =====================================================================

set search_path to elpapustore, public;

begin;

-- ---------------------------------------------------------------------
-- Categoría nueva: Gorras
-- ---------------------------------------------------------------------
insert into categories (slug, name, description, icon, display_order, is_active) values
  ('gorras', 'Gorras', 'Gorras trucker y snapback con onda', '🧢', 80, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order,
  is_active = true;

-- ---------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------
with cat as (select slug, id from categories)
insert into products (
  slug, name, sku, category_id,
  short_description, description, features,
  price, compare_at_price, stock, min_stock,
  badge, image_url, color,
  is_active, is_featured, display_order
) values

-- ============ AUTOS — químicos de detailing ============
('foam-sprayer-manual-2l','Foam Sprayer Manual 2 Litros','PAPU-AUT-003',(select id from cat where slug='autos'),
 'Pulverizador manual de 2 L a presión para espuma densa de lavado.',
 'Foam sprayer de accionamiento manual con tanque de 2 litros. Bombeás con la palanca para acumular presión y liberás una espuma densa, ideal para prelavado (snow foam), APC o desengrasantes. No requiere compresor.',
 jsonb_build_array('Tanque de 2 litros','Presión manual — sin compresor','Boquilla regulable','Válvula de alivio de presión','Ideal snow foam / APC'),
 100000, null, 12, 3, 'nuevo','/assets/foam-sprayer-manual-2l.webp','from-sky-500/25 to-black', true, true, 201),

('vonixx-acidus-fast','Vonixx Acidus Fast — Limpiador Ácido','PAPU-AUT-004',(select id from cat where slug='autos'),
 'Limpiador ácido de acción rápida para llantas y suciedad pesada.',
 'Limpiador ácido de acción rápida para remover suciedad pesada, polvo de freno incrustado y residuos ferrosos de llantas y superficies resistentes. Concentrado, usar con guantes y enjuagar abundantemente.',
 jsonb_build_array('Limpiador ácido de acción rápida','Ideal llantas y polvo de freno','Alto poder desincrustante','Concentrado','Uso profesional con EPP'),
 40000, null, 20, 4, 'nuevo','/assets/vonixx-acidus-fast.webp','from-emerald-500/25 to-black', true, false, 202),

('vonixx-blend-ceramic-carnauba-spray-wax-500ml','Vonixx Blend — Cera Cerámica & Carnaúba Spray 500ml','PAPU-AUT-001',(select id from cat where slug='autos'),
 'Cera líquida híbrida SiO2 + carnaúba en spray, brillo intenso.',
 'Cera líquida híbrida que combina SiO2 cerámico con carnaúba T1 pura. Brillo profundo, hidrofobicidad extrema y protección hasta 4 meses. Ideal post-lavado o toque rápido.',
 jsonb_build_array('SiO2 + carnaúba T1','Hasta 4 meses de protección','Hidrofobicidad extrema','Aplicación en spray','Apto pintura, plásticos y vidrios'),
 80000, null, 15, 3, null,'/assets/vonixx-blend-ceramic-carnauba-spray-wax-500ml.webp','from-blue-500/25 to-black', true, false, 203),

('vonixx-sio2-pro','Vonixx SiO2-Pro — Sellador Cerámico','PAPU-AUT-005',(select id from cat where slug='autos'),
 'Sellante cerámico SiO2 con brillo espejo y larga duración.',
 'Sellador cerámico a base de SiO2 que forma una capa protectora de alta durabilidad. Brillo tipo espejo, hidrofobicidad extrema y protección UV. Aplicación en spray sobre pintura limpia.',
 jsonb_build_array('Base SiO2 cerámico','Brillo tipo espejo','Hidrofobicidad extrema','Larga duración','Aplicación en spray'),
 80000, null, 15, 3, 'top','/assets/vonixx-sio2-pro.webp','from-indigo-500/25 to-black', true, true, 204),

('vonixx-blend-black-edition','Vonixx Blend Black Edition — Cera para Autos Oscuros','PAPU-AUT-006',(select id from cat where slug='autos'),
 'Cera híbrida en spray para autos negros y oscuros, efecto wet look.',
 'Versión de la cera híbrida Blend para colores oscuros. Intensifica la profundidad del negro con efecto wet look, aporta hidrofobicidad y protección de varias semanas. Aplicación rápida en spray.',
 jsonb_build_array('Para autos negros/oscuros','Efecto wet look','SiO2 + carnaúba','Hidrofobicidad','Aplicación en spray'),
 80000, null, 14, 3, 'nuevo','/assets/vonixx-blend-black-edition.webp','from-zinc-800/50 to-black', true, true, 205),

('vonixx-tok-final','Vonixx Tok Final — Toque Final / Quick Detailer','PAPU-AUT-007',(select id from cat where slug='autos'),
 'Spray de toque final que realza el brillo y remueve polvo leve.',
 'Quick detailer para el acabado luego del lavado o entre lavados. Remueve polvo leve y marcas de agua, potencia el brillo y realza la protección existente. Se aplica en seco o húmedo con microfibra.',
 jsonb_build_array('Quick detailer','Realza brillo al instante','Remueve polvo y marcas leves','Uso seco o húmedo','Mantenimiento entre lavados'),
 50000, null, 18, 4, null,'/assets/vonixx-tok-final.webp','from-cyan-500/25 to-black', true, false, 206),

('vintex-limpiador-multiaccion','Vintex Limpiador Multiacción','PAPU-AUT-008',(select id from cat where slug='autos'),
 'Limpiador multiuso para interior y exterior del vehículo.',
 'Limpiador multiacción para la limpieza general del vehículo: tapizados, plásticos, alfombras, tablero y más. Remueve grasa, polvo y manchas. Se diluye según el nivel de suciedad.',
 jsonb_build_array('Limpiador multiuso','Interior y exterior','Remueve grasa y manchas','Concentrado','Versátil'),
 30000, null, 22, 5, 'oferta','/assets/vintex-limpiador-multiaccion.webp','from-lime-500/25 to-black', true, false, 207),

('vonixx-glazy-limpiavidrios-4en1','Vonixx Glazy — Limpiavidrios 4 en 1','PAPU-AUT-009',(select id from cat where slug='autos'),
 'Limpiavidrios 4 en 1: limpia, brilla, repele agua y sin marcas.',
 'Limpiavidrios multifunción 4 en 1: limpia la grasa del vidrio, aporta brillo, deja efecto repelente al agua para mejor visibilidad y no deja marcas. Para parabrisas, ventanillas y espejos.',
 jsonb_build_array('Función 4 en 1','Sin marcas ni halos','Efecto repelente al agua','Brillo y transparencia','Parabrisas, ventanillas y espejos'),
 50000, null, 20, 4, 'viral','/assets/vonixx-glazy-limpiavidrios-4en1.webp','from-teal-500/25 to-black', true, true, 208),

('vonixx-sintra-multi','Vonixx Sintra Multi — Aromatizante','PAPU-AUT-010',(select id from cat where slug='autos'),
 'Aromatizante automotor de fragancia agradable y duradera.',
 'Aromatizante para el interior del auto con fragancia envolvente y de larga duración. Neutraliza olores y deja un aroma fresco. Se puede aplicar en tapizados o difundir en el ambiente.',
 jsonb_build_array('Larga duración','Neutraliza olores','Fragancia fresca','Para tapizados y ambiente','Rinde bastante'),
 50000, null, 20, 4, 'nuevo','/assets/vonixx-sintra-multi.webp','from-fuchsia-500/25 to-black', true, false, 209),

('vonixx-v-eco-fast','Vonixx V-Eco Fast — Lava Autos en Seco','PAPU-AUT-011',(select id from cat where slug='autos'),
 'Lava autos en seco de acción rápida: limpia y da brillo con poca agua.',
 'Lava autos en seco (waterless) de acción rápida. Encapsula la suciedad para removerla con microfibra sin manguera, cuidando la pintura y ahorrando agua. Deja brillo y protección leve.',
 jsonb_build_array('Lava autos en seco','Ahorra agua','Encapsula la suciedad','Deja brillo','Acción rápida'),
 45000, null, 18, 4, 'nuevo','/assets/vonixx-v-eco-fast.webp','from-green-500/25 to-black', true, false, 210),

('vintex-renova-plasticos','Vintex Renova Plásticos','PAPU-AUT-012',(select id from cat where slug='autos'),
 'Renovador que revive plásticos y gomas opacadas.',
 'Restaura los plásticos, gomas y molduras opacadas o descoloridas del vehículo, devolviéndoles color y aspecto de nuevo. Aporta protección contra el resecamiento y los rayos UV.',
 jsonb_build_array('Renueva plásticos y gomas','Devuelve color','Protección UV','Interior y exterior','Acabado renovado'),
 40000, null, 20, 4, 'oferta','/assets/vintex-renova-plasticos.webp','from-amber-500/25 to-black', true, false, 211),

('vonixx-v-mol-lava-autos-desengrasante','Vonixx V-Mol — Lava Autos Desengrasante','PAPU-AUT-013',(select id from cat where slug='autos'),
 'Shampoo desengrasante de alto poder para suciedad pesada.',
 'Lava autos desengrasante de alto poder para remover grasa, barro, aceite y suciedad pesada. Ideal para el primer lavado de autos muy sucios, chasis, motores y llantas. Concentrado.',
 jsonb_build_array('Shampoo desengrasante','Remueve grasa, barro y aceite','Suciedad pesada','Concentrado','Chasis, motor y llantas'),
 35000, null, 20, 4, null,'/assets/vonixx-v-mol-lava-autos-desengrasante.webp','from-orange-600/25 to-black', true, false, 212),

('vintex-lava-autos-shampoo-500ml','Vintex Lava Autos — Shampoo Automotivo pH Neutro 500ml','PAPU-AUT-014',(select id from cat where slug='autos'),
 'Shampoo automotor pH neutro, súper concentrado, alta lubricidad.',
 'Detergente automotor Vintex de uso general, pH neutro que no remueve ceras ni sellantes. Súper concentrado (rinde muchísimo diluido) y de alta lubricidad para evitar micro-rayas. 500ml.',
 jsonb_build_array('pH neutro — no remueve ceras','Súper concentrado','Alta lubricidad','Espuma abundante','500ml'),
 25000, null, 22, 5, 'oferta','/assets/vintex-lava-autos-shampoo-500ml.webp','from-yellow-500/25 to-black', true, false, 213),

('vonixx-carnauba-hybrid-wax-240ml','Vonixx Carnaúba Hybrid Wax 240ml','PAPU-AUT-015',(select id from cat where slug='autos'),
 'Cera en pasta híbrida de carnaúba, rinde hasta 60 aplicaciones.',
 'Cera en pasta híbrida a base de carnaúba que aporta brillo profundo, protección e hidrofobicidad a la pintura. Fácil de aplicar y remover; un pote de 240ml rinde hasta 60 aplicaciones.',
 jsonb_build_array('Cera híbrida de carnaúba','Hasta 60 aplicaciones','Brillo profundo','Hidrofobicidad','Fácil de aplicar y remover'),
 100000, null, 12, 3, 'top','/assets/vonixx-carnauba-hybrid-wax-240ml.webp','from-yellow-600/25 to-black', true, true, 214),

('vonixx-izer-removedor-ferroso-500ml','Vonixx Izer — Removedor Ferroso / Descontaminante 500ml','PAPU-AUT-016',(select id from cat where slug='autos'),
 'Removedor de contaminación ferrosa (iron & fallout) para pintura y llantas.',
 'Descontaminante ferroso que reacciona con las partículas de metal incrustadas en la pintura y llantas, disolviéndolas (efecto sangrado violeta) para removerlas de forma segura. Odor reducido.',
 jsonb_build_array('Removedor ferroso / fallout','Efecto sangrado violeta','Limpieza segura de la pintura','Ideal llantas','Odor reducido'),
 60000, null, 15, 3, 'top','/assets/vonixx-izer-removedor-ferroso-500ml.webp','from-purple-500/25 to-black', true, true, 215),

('vonixx-higicouro-limpiador-cuero-500ml','Vonixx Higicouro — Limpiador de Cuero 500ml','PAPU-AUT-017',(select id from cat where slug='autos'),
 'Limpiador de cuero que limpia sin agredir tapizados y volantes.',
 'Limpiador específico para cuero que remueve la suciedad de tapizados, volantes y superficies de cuero sin agredir el material. Ideal usarlo antes del acondicionador Hidracouro. 500ml.',
 jsonb_build_array('Limpiador de cuero','No agrede el material','Tapizados y volantes','Usar antes del acondicionador','500ml'),
 40000, null, 16, 3, null,'/assets/vonixx-higicouro-limpiador-cuero-500ml.webp','from-orange-500/25 to-black', true, false, 216),

('vonixx-hidracouro-acondicionador-cuero-500ml','Vonixx Hidracouro — Acondicionador de Cuero 500ml','PAPU-AUT-018',(select id from cat where slug='autos'),
 'Acondicionador que hidrata y protege el cuero evitando el resecamiento.',
 'Acondicionador para cuero que hidrata y protege, previniendo el resecamiento y las grietas. Deja el cuero suave con acabado natural. Ideal después de limpiar con Higicouro. 500ml.',
 jsonb_build_array('Acondicionador de cuero','Hidrata y protege','Previene resecamiento','Acabado natural','500ml'),
 60000, null, 15, 3, null,'/assets/vonixx-hidracouro-acondicionador-cuero-500ml.webp','from-amber-600/25 to-black', true, false, 217),

('vonixx-v-floc-shampoo-lava-autos-500ml','Vonixx V-Floc — Shampoo Lava Autos Concentrado 500ml','PAPU-AUT-002',(select id from cat where slug='autos'),
 'Shampoo súper concentrado pH neutro, dilución hasta 1:400.',
 'Shampoo automotor súper concentrado, pH neutro que no remueve ceras ni sellantes. Dilución hasta 1:400 (rinde cientos de lavados). Alta lubricidad para evitar micro-rayas.',
 jsonb_build_array('pH neutro','Dilución hasta 1:400','Alta lubricidad','Espuma densa','Aroma característico'),
 40000, null, 17, 3, 'top','/assets/vonixx-v-floc-shampoo-lava-autos-500ml.webp','from-purple-500/25 to-black', true, false, 218),

('vonixx-intense-renovador-plasticos-internos-500ml','Vonixx Intense — Renovador de Plásticos Internos 500ml','PAPU-AUT-019',(select id from cat where slug='autos'),
 'Finalizador de plásticos internos con toque seco y protección UV.',
 'Renovador de plásticos internos (finalizador) que devuelve el aspecto de nuevo al tablero y molduras, con acabado de toque seco (no grasoso) y protección UV. 500ml.',
 jsonb_build_array('Renueva plásticos internos','Toque seco — no grasoso','Protección UV','Tablero y molduras','500ml'),
 60000, null, 15, 3, null,'/assets/vonixx-intense-renovador-plasticos-internos-500ml.webp','from-neutral-700/40 to-black', true, false, 219),

('vonixx-restaurax-restaurador-plasticos-500ml','Vonixx Restaurax — Restaurador de Plásticos 500ml','PAPU-AUT-020',(select id from cat where slug='autos'),
 'Restaurador de plásticos externos e internos con protección UV.',
 'Restaurador que devuelve el color y la profundidad a los plásticos opacados, para uso interno y externo. Aporta protección UV y acabado renovado duradero. 500ml.',
 jsonb_build_array('Restaura plásticos','Uso interno y externo','Protección UV','Devuelve color','500ml'),
 85000, null, 14, 3, null,'/assets/vonixx-restaurax-restaurador-plasticos-500ml.webp','from-violet-500/25 to-black', true, false, 220),

('vonixx-shiny-revitalizador-neumaticos-500ml','Vonixx Shiny — Revitalizador de Neumáticos 500ml','PAPU-AUT-021',(select id from cat where slug='autos'),
 'Revitalizador de neumáticos con brillo intenso y duradero.',
 'Finalizador que revitaliza los neumáticos devolviéndoles el color negro profundo con brillo intenso y duradero. Protege la goma. Se puede aplicar con aplicador para el nivel de brillo deseado.',
 jsonb_build_array('Revitaliza neumáticos','Brillo intenso y duradero','Negro profundo','Protege la goma','500ml'),
 90000, null, 15, 3, 'top','/assets/vonixx-shiny-revitalizador-neumaticos-500ml.webp','from-red-500/25 to-black', true, true, 221),

('vonixx-strike-removedor-piche-cola-500ml','Vonixx Strike — Removedor de Piche y Cola 500ml','PAPU-AUT-022',(select id from cat where slug='autos'),
 'Removedor de alquitrán, piche y adhesivos a base de aceites naturales.',
 'Removedor de piche, alquitrán, cola y adhesivos, formulado a base de aceites naturales, biodegradable y seguro para la pintura. Ablanda y remueve los residuos difíciles. 500ml.',
 jsonb_build_array('Remueve piche y alquitrán','Remueve cola y adhesivos','Base de aceites naturales','Biodegradable y seguro','500ml'),
 90000, null, 14, 3, 'top','/assets/vonixx-strike-removedor-piche-cola-500ml.webp','from-orange-500/25 to-black', true, true, 222),

('vonixx-prizm-restaurador-vidrios-500ml','Vonixx Prizm — Restaurador de Vidrios 500ml','PAPU-AUT-023',(select id from cat where slug='autos'),
 'Restaurador de vidrios y acrílicos que remueve manchas y opacidad.',
 'Restaurador profesional de vidrios que remueve manchas de agua, incrustaciones y opacidad, dejando el vidrio transparente. Apto vidrios y acrílicos. Producto de uso profesional. 500ml.',
 jsonb_build_array('Restaura vidrios y acrílicos','Remueve manchas de agua','Devuelve transparencia','Uso profesional','500ml'),
 60000, null, 12, 3, null,'/assets/vonixx-prizm-restaurador-vidrios-500ml.webp','from-green-600/25 to-black', true, false, 223),

('zafiro-detergente-industrial-500ml','Zafiro Detergente Industrial — Limpieza Profunda 500ml','PAPU-AUT-033',(select id from cat where slug='autos'),
 'Detergente industrial para limpieza profunda de chasis, motores y llantas.',
 'Detergente industrial de limpieza profunda para diferentes superficies: chasis, ruedas, motores, carenados y aluminio. Se aplica, se deja actuar 2-5 minutos y se enjuaga. Hecho en Paraguay. 500ml.',
 jsonb_build_array('Limpieza profunda','Chasis, motores y llantas','Multiples superficies','Biodegradable','Hecho en Paraguay'),
 30000, null, 20, 4, 'oferta','/assets/zafiro-detergente-industrial-500ml.webp','from-yellow-500/25 to-black', true, false, 243),

-- ============ AUTOS — herramientas / microfibras ============
('maxshine-cepillo-heavy-duty-llantas-alfombras','MaxShine Cepillo Heavy-Duty para Llantas y Alfombras','PAPU-AUT-024',(select id from cat where slug='autos'),
 'Cepillo resistente para limpieza pesada de llantas y alfombras.',
 'Cepillo de detailing MaxShine de cerdas resistentes y mango ergonómico, ideal para la limpieza pesada de llantas, alfombras y tapizados. Aguanta químicos agresivos.',
 jsonb_build_array('Cerdas resistentes','Mango ergonómico','Llantas y alfombras','Limpieza pesada','Marca MaxShine'),
 45000, null, 15, 3, null,'/assets/maxshine-cepillo-heavy-duty-llantas-alfombras.webp','from-red-600/25 to-black', true, false, 224),

('pano-microfibra-multiuso-rollo','Paño de Microfibra Multiuso — Rollo Completo','PAPU-AUT-025',(select id from cat where slug='autos'),
 'Rollo completo de paños de microfibra multiuso perforados.',
 'Rollo de paños de microfibra multiuso, perforados para separar por unidad. Absorbentes y suaves, ideales para limpieza, secado y aplicación de productos. Presentación rollo completo (mejor precio por unidad).',
 jsonb_build_array('Rollo completo','Perforados por unidad','Microfibra absorbente','No raya','Multiuso'),
 120000, null, 8, 2, null,'/assets/pano-microfibra-multiuso-rollo.webp','from-yellow-400/25 to-black', true, false, 225),

('pano-microfibra-multiuso-unidad','Paño de Microfibra Multiuso — Por Unidad','PAPU-AUT-026',(select id from cat where slug='autos'),
 'Paño de microfibra multiuso, venta por unidad.',
 'Paño de microfibra multiuso suave y absorbente, ideal para limpieza, secado y aplicación de productos de detailing. Venta por unidad (también disponible el rollo completo).',
 jsonb_build_array('Microfibra suave','Absorbente','No raya','Multiuso','Venta por unidad'),
 25000, null, 40, 8, null,'/assets/pano-microfibra-multiuso-unidad.webp','from-yellow-400/25 to-black', true, false, 226),

('detailpro-guante-microfibra-doble-cara','Detail Pro Guante de Microfibra Doble Cara (Wash Mitt)','PAPU-AUT-027',(select id from cat where slug='autos'),
 'Guante de lavado de microfibra doble cara, no raya la pintura.',
 'Guante de lavado (wash mitt) Detail Pro de microfibra ultra suave, doble cara con dos texturas. Levanta la suciedad sin rayar la pintura, lavable a máquina y de ajuste cómodo.',
 jsonb_build_array('Microfibra ultra suave','Doble cara / 2 texturas','No raya la pintura','Lavable a máquina','Ajuste cómodo'),
 35000, null, 20, 4, null,'/assets/detailpro-guante-microfibra-doble-cara.webp','from-yellow-500/25 to-black', true, false, 227),

('detailpro-yellow-flash-toalla-secado-40x60','Detail Pro Yellow Flash — Toalla de Secado 600GSM 40x60','PAPU-AUT-028',(select id from cat where slug='autos'),
 'Toalla de secado twisted loop 600GSM, 40x60cm, súper absorbente.',
 'Toalla de secado Detail Pro Yellow Flash de tejido twisted loop 600GSM, 40x60cm. Súper absorbente, secado rápido, libre de pelusas y sin rayar. Ideal para secar el auto tras el lavado.',
 jsonb_build_array('Twisted loop 600GSM','40x60cm','Súper absorbente','Secado rápido','Libre de pelusas'),
 35000, null, 18, 4, null,'/assets/detailpro-yellow-flash-toalla-secado-40x60.webp','from-yellow-500/25 to-black', true, false, 228),

('aplicador-espuma-con-agarre','Aplicador de Espuma con Agarre','PAPU-AUT-029',(select id from cat where slug='autos'),
 'Aplicador de espuma con agarre para ceras y sellantes.',
 'Aplicador de espuma con base de agarre ergonómico, ideal para aplicar ceras, sellantes y acondicionadores de forma pareja. Reutilizable y lavable.',
 jsonb_build_array('Base con agarre','Aplicación pareja','Para ceras y sellantes','Reutilizable','Lavable'),
 8000, null, 50, 10, null,'/assets/aplicador-espuma-con-agarre.webp','from-neutral-700/40 to-black', true, false, 229),

('pincel-detailing','Pincel de Detailing','PAPU-AUT-030',(select id from cat where slug='autos'),
 'Pincel de detailing para limpieza de detalles y zonas difíciles.',
 'Pincel de detailing con cerdas suaves y mango cómodo, para limpiar rejillas, botones, logos, ranuras y zonas de difícil acceso sin dañar las superficies.',
 jsonb_build_array('Cerdas suaves','Zonas difíciles','Rejillas y ranuras','No daña superficies','Mango cómodo'),
 20000, null, 30, 6, null,'/assets/pincel-detailing.webp','from-yellow-500/25 to-black', true, false, 230),

('aplicador-microfibra-circular','Aplicador de Microfibra Circular','PAPU-AUT-031',(select id from cat where slug='autos'),
 'Aplicador circular de microfibra para productos y ceras.',
 'Aplicador circular de microfibra, suave y flexible, ideal para aplicar ceras, sellantes, acondicionadores y renovadores de plástico de forma uniforme. Reutilizable.',
 jsonb_build_array('Microfibra circular','Aplicación uniforme','Para ceras y renovadores','Suave y flexible','Reutilizable'),
 5000, null, 60, 12, null,'/assets/aplicador-microfibra-circular.webp','from-yellow-400/25 to-black', true, false, 231),

('detailpro-red-flash-ultra-toalla-secado-60x90','Detail Pro Red Flash Ultra — Toalla de Secado 60x90','PAPU-AUT-032',(select id from cat where slug='autos'),
 'Toalla de secado twisted loop 60x90cm, ultra absorbente.',
 'Toalla de secado Detail Pro Red Flash Ultra de tejido twisted loop, 60x90cm. Ultra absorbente y de secado rápido, remueve el agua sin rayar. Ideal para secar todo el auto de una pasada.',
 jsonb_build_array('Twisted loop','60x90cm','Ultra absorbente','Secado rápido','No raya'),
 70000, null, 12, 3, 'top','/assets/detailpro-red-flash-ultra-toalla-secado-60x90.webp','from-red-600/25 to-black', true, false, 232),

-- ============ DECO — cuadros ============
('cuadro-ahorra-maldito-insecto-vegeta','Cuadro Plan de Ahorro "Ahorra Maldito Insecto" (Vegeta) — 20M','PAPU-DEC-005',(select id from cat where slug='deco'),
 'Cuadro con grilla de ahorro y frase Ahorra Maldito Insecto (Vegeta), meta 20M.',
 'Cuadro motivacional con Vegeta y la frase "Ahorra Maldito Insecto", junto a una grilla de plan de ahorro para ir tachando montos hasta la meta de Gs. 20.000.000. Soporte rígido listo para colgar.',
 jsonb_build_array('Diseño Vegeta','Frase Ahorra Maldito Insecto','Grilla plan de ahorro','Meta 20.000.000','Listo para colgar'),
 40000, null, 18, 4, 'viral','/assets/cuadro-ahorra-maldito-insecto-vegeta.webp','from-blue-600/25 to-black', true, true, 233),

('cuadro-aprobado-por-chayanne','Cuadro Plan de Ahorro "Aprobado por Chayanne" — 20M','PAPU-DEC-006',(select id from cat where slug='deco'),
 'Cuadro con grilla de ahorro y sello Aprobado por Chayanne, meta 20M.',
 'Cuadro decorativo con el sello "Aprobado por Chayanne" estilo logo, junto a una grilla de plan de ahorro para tachar montos hasta la meta de Gs. 20.000.000. Soporte rígido listo para colgar.',
 jsonb_build_array('Diseño Aprobado por Chayanne','Grilla plan de ahorro','Meta 20.000.000','Soporte rígido','Listo para colgar'),
 40000, null, 18, 4, 'viral','/assets/cuadro-aprobado-por-chayanne.webp','from-neutral-800/50 to-black', true, true, 234),

('cuadro-un-buen-sayayin-sabe-ahorrar-goku','Cuadro Plan de Ahorro "Un Buen Sayayin Sabe Ahorrar" (Goku) — 10M','PAPU-DEC-007',(select id from cat where slug='deco'),
 'Cuadro con grilla de ahorro y frase Un Buen Sayayin Sabe Ahorrar (Goku), meta 10M.',
 'Cuadro motivacional con Goku Super Saiyan y la frase "Un Buen Sayayin Sabe Ahorrar", con grilla de plan de ahorro para tachar montos hasta la meta de Gs. 10.000.000. Listo para colgar.',
 jsonb_build_array('Diseño Goku Super Saiyan','Frase motivacional','Grilla plan de ahorro','Meta 10.000.000','Listo para colgar'),
 40000, null, 18, 4, 'viral','/assets/cuadro-un-buen-sayayin-sabe-ahorrar-goku.webp','from-orange-500/25 to-black', true, true, 235),

('cuadro-decorativo-brasil-no-paramos','Cuadro Decorativo "Hasta Llegar a Brasil No Paramos"','PAPU-DEC-008',(select id from cat where slug='deco'),
 'Cuadro decorativo motivacional temática Brasil / Mundial.',
 'Cuadro decorativo con la frase "Hasta Llegar a Brasil No Paramos" y motivos de la temática Mundial/Brasil. Impresión sobre soporte rígido, listo para colgar. (También disponible en otros diseños de la línea.)',
 jsonb_build_array('Frase Brasil No Paramos','Temática Mundial','Impresión HD','Soporte rígido','Listo para colgar'),
 40000, null, 15, 3, null,'/assets/cuadro-decorativo-brasil-no-paramos.webp','from-orange-500/25 to-black', true, false, 236),

('cuadro-decorativo-no-toques-mi-plata','Cuadro Decorativo "No Toques Mi Plata"','PAPU-DEC-009',(select id from cat where slug='deco'),
 'Cuadro decorativo con frase No Toques Mi Plata (Furia / Intensamente).',
 'Cuadro decorativo con el personaje Furia (Intensamente) y la frase "No Toques Mi Plata". Impresión sobre soporte rígido, listo para colgar. (También disponible en otros diseños de la línea.)',
 jsonb_build_array('Frase No Toques Mi Plata','Diseño Furia','Impresión HD','Soporte rígido','Listo para colgar'),
 40000, null, 15, 3, 'viral','/assets/cuadro-decorativo-no-toques-mi-plata.webp','from-red-600/25 to-black', true, false, 237),

('cuadro-poliptico-5-piezas-personalizado','Cuadro Políptico 5 Piezas Personalizado','PAPU-DEC-010',(select id from cat where slug='deco'),
 'Cuadro políptico de 5 piezas personalizable con tu logo o diseño.',
 'Composición decorativa de 5 piezas (políptico) personalizable con logo, marca o diseño a elección. Impresión de alta resolución sobre soporte rígido, crea un impacto premium en la pared.',
 jsonb_build_array('Set 5 piezas (políptico)','Personalizable','Impresión alta resolución','Soporte rígido','Impacto premium'),
 120000, null, 6, 2, null,'/assets/cuadro-poliptico-5-piezas-personalizado.webp','from-yellow-600/25 to-black', true, false, 245),

-- ============ ACCESORIOS ============
('scorcher-soporte-celular-moto','Scorcher Soporte de Celular para Moto','PAPU-ACC-004',(select id from cat where slug='accesorios'),
 'Soporte de celular para manubrio de moto/bici, agarre antivibración.',
 'Soporte de celular Scorcher para manubrio de moto, bici o scooter. Agarre seguro con bloqueo de una tecla, antideslizante y resistente a las vibraciones. Compatible con celulares de 5.1 a 6.8 pulgadas.',
 jsonb_build_array('Para manubrio moto/bici','Bloqueo de una tecla','Antivibración / antideslizante','Compatible 5.1 a 6.8"','Material plástico/metal/silicona'),
 150000, null, 10, 2, 'top','/assets/scorcher-soporte-celular-moto.webp','from-neutral-800/50 to-black', true, true, 238),

('soporte-kojima-windshield-mount-ventosa','Soporte Celular Kojima Windshield Mount — Ventosa TPU','PAPU-ACC-001',(select id from cat where slug='accesorios'),
 'Soporte con ventosa de TPU para parabrisas o tablero, agarre seguro.',
 'Soporte vehicular Kojima (diseño japonés) con ventosa TPU de alta adherencia para parabrisas o tablero. Brazo articulado, rotación 360° y agarre seguro. 100% seguro para el conductor.',
 jsonb_build_array('Ventosa TPU alta adherencia','Brazo articulado','Rotación 360°','Diseño Kojima Japan','Seguro para el conductor'),
 120000, null, 18, 4, null,'/assets/soporte-kojima-windshield-mount-ventosa.webp','from-red-500/20 to-black', true, false, 239),

('cargador-auto-kojima-30w-dual-usbc-type-cx2','Cargador Auto Kojima 30W Dual USB-C (Type-CX2)','PAPU-ACC-003',(select id from cat where slug='accesorios'),
 'Cargador vehicular Kojima 30W con dos puertos USB-C PD, metálico mini.',
 'Cargador para auto Kojima Type-CX2 con dos puertos USB-C de 30W (Power Delivery). Carcasa metálica mini, casi embutida en la toma de 12V. Carga rápida para celular, tablet o accesorios.',
 jsonb_build_array('2x USB-C 30W PD','Carcasa metálica premium','Diseño mini','Carga rápida segura','Compatible 12V/24V'),
 65000, null, 25, 5, 'oferta','/assets/cargador-auto-kojima-30w-dual-usbc-type-cx2.webp','from-red-500/20 to-black', true, true, 240),

('scorcher-cable-carga-usb-ac-cp-1m','Scorcher Cable de Carga Rápida USB-A/C a C/P 1M','PAPU-ACC-005',(select id from cat where slug='accesorios'),
 'Cable de carga rápida 4 en 1, malla de nylon y carcasa metálica, 1m.',
 'Cable de carga rápida Scorcher multifunción USB-A/C a USB-C/Lightning (4 en 1), 1 metro. Malla de nylon trenzado antienredos y carcasa metálica resistente. Compatible con la mayoría de dispositivos.',
 jsonb_build_array('4 en 1 (A/C a C/P)','Carga rápida','Nylon trenzado antienredos','Carcasa metálica','1 metro'),
 30000, null, 30, 6, null,'/assets/scorcher-cable-carga-usb-ac-cp-1m.webp','from-neutral-800/50 to-black', true, false, 241),

('soporte-kojima-cellphone-magnetic-mount','Soporte Magnético Kojima Cellphone Magnetic Mount','PAPU-ACC-002',(select id from cat where slug='accesorios'),
 'Soporte magnético Kojima para auto, rotación 360° y placas incluidas.',
 'Soporte magnético ultra potente Kojima para celular en el auto. Diseño compacto en forma de "K", base adhesiva 3M e imán de neodimio que aguanta vibraciones. Incluye placas metálicas.',
 jsonb_build_array('Imán de neodimio reforzado','Rotación 360°','Base adhesiva 3M','Incluye placas metálicas','Diseño Kojima Japan'),
 80000, null, 16, 4, 'top','/assets/soporte-kojima-cellphone-magnetic-mount.webp','from-red-500/20 to-black', true, true, 242),

('areon-gel-aromatizante-car-home','Areon Gel — Aromatizante Car & Home','PAPU-ACC-006',(select id from cat where slug='accesorios'),
 'Aromatizante en gel Areon para auto y hogar, fragancias premium.',
 'Aromatizante en gel Areon Quality Perfumes para auto y hogar. Fragancia intensa y de larga duración con difusión gradual. Disponible en varias fragancias (Bubble Gum, Black Crystal, Wish).',
 jsonb_build_array('Aromatizante en gel','Fragancia premium Areon','Larga duración','Auto y hogar','Varias fragancias'),
 40000, null, 24, 5, 'nuevo','/assets/areon-gel-aromatizante-car-home.webp','from-pink-500/25 to-black', true, false, 244),

-- ============ GORRAS (categoría nueva) ============
('gorra-mevo-trucker-paraguay','Gorra MEVO Trucker Paraguay','PAPU-GOR-001',(select id from cat where slug='gorras'),
 'Gorra trucker MEVO con parche Paraguay y diseño premium.',
 'Gorra trucker de la marca MEVO con frente estructurado, parche bordado (edición Paraguay / caballo) y malla trasera transpirable. Cierre ajustable snapback, calce cómodo y estilo urbano.',
 jsonb_build_array('Marca MEVO','Trucker con malla transpirable','Parche bordado premium','Cierre ajustable','Estilo urbano'),
 85000, null, 12, 3, 'nuevo','/assets/gorra-mevo-trucker-paraguay.webp','from-orange-700/30 to-black', true, true, 246),

('gorra-mevo-store-destapador-visera','Gorra MEVO Store con Destapador en Visera','PAPU-GOR-002',(select id from cat where slug='gorras'),
 'Gorra MEVO Store con destapador metálico integrado en la visera.',
 'Gorra trucker MEVO Store con detalle premium: destapador metálico integrado en la visera de cuero sintético. Frente con parche, malla trasera y cierre ajustable. Pieza distintiva y funcional.',
 jsonb_build_array('Destapador en la visera','Visera de cuero sintético','Parche MEVO Store','Malla transpirable','Cierre ajustable'),
 110000, null, 10, 2, 'top','/assets/gorra-mevo-store-destapador-visera.webp','from-amber-800/30 to-black', true, true, 247),

('gorra-mevo-premium-trucker','Gorra MEVO Premium Trucker','PAPU-GOR-003',(select id from cat where slug='gorras'),
 'Gorra MEVO Premium trucker con acabados de cuero y parche bordado.',
 'Gorra trucker MEVO Premium con frente texturado, visera de cuero sintético y parche bordado. Malla trasera transpirable y cierre ajustable. Acabados premium para un look distinguido.',
 jsonb_build_array('Línea MEVO Premium','Visera de cuero sintético','Parche bordado','Malla transpirable','Cierre ajustable'),
 85000, null, 12, 3, 'nuevo','/assets/gorra-mevo-premium-trucker.webp','from-neutral-700/40 to-black', true, false, 248),

-- ============ TERMICOS — vasos ============
('vaso-termico-magang-elpapu-rosa-negro','Vaso Térmico Magang "El Papu" (Rosa / Negro)','PAPU-TER-003',(select id from cat where slug='termicos'),
 'Vaso térmico Magang branded El Papu, acero inox doble pared, con tapa.',
 'Vaso térmico Magang edición "El Papu" en acero inoxidable de doble pared, mantiene la temperatura por horas. Incluye tapa deslizante. Diseño con el logo El Papu. Disponible en rosa y negro.',
 jsonb_build_array('Acero inoxidable doble pared','Mantiene temperatura','Tapa deslizante','Diseño El Papu','Colores rosa y negro'),
 40000, null, 20, 4, 'nuevo','/assets/vaso-termico-magang-elpapu-rosa-negro.webp','from-pink-500/25 to-black', true, true, 249),

('vaso-termico-magang-elpapu-blanco-acero','Vaso Térmico Magang "El Papu" (Blanco / Acero)','PAPU-TER-004',(select id from cat where slug='termicos'),
 'Vaso térmico Magang branded El Papu, acabado blanco y acero inox.',
 'Vaso térmico Magang edición "El Papu" en acero inoxidable de doble pared con acabado blanco mate o acero pulido. Mantiene la temperatura por horas e incluye tapa deslizante.',
 jsonb_build_array('Acero inoxidable doble pared','Mantiene temperatura','Tapa deslizante','Diseño El Papu','Acabado blanco / acero'),
 40000, null, 20, 4, 'nuevo','/assets/vaso-termico-magang-elpapu-blanco-acero.webp','from-zinc-400/20 to-black', true, true, 250)

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
from categories c left join products p on p.category_id = c.id
group by c.name order by c.name;

select count(*) as total_productos from products;
