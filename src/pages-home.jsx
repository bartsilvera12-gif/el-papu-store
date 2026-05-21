// Home page sections for El Papu Store

const { useState: useStateHome, useEffect: useEffectHome } = React;

function Hero() {
  const { navigate } = useShop();
  const { PRODUCTS } = window.__PAPU_DATA__;
  const featured = PRODUCTS[0]; // Auriculares

  return (
    <section className="relative min-h-[100vh] sm:min-h-[92vh] flex items-center pt-24 pb-12 overflow-hidden">
      {/* BG layers */}
      <div className="absolute inset-0 bg-[#050505]"></div>
      <div className="absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 20% 30%, rgba(31,230,32,0.18), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(0,255,51,0.10), transparent 60%)" }}></div>
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}></div>
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.5'/></svg>\")" }}></div>

      {/* Floating accents */}
      <div className="absolute top-32 right-10 w-72 h-72 bg-[#1FE620]/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#1FE620]/10 rounded-full blur-[120px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 animate-fadeup">
            <h1 className="font-display text-[64px] sm:text-[96px] lg:text-[128px] leading-[0.85] text-white tracking-tight">
              EL PAPU<br />
              <span className="relative inline-block">
                <span className="text-white drop-shadow-[0_0_24px_rgba(31,230,32,0.55)]" style={{ WebkitTextStroke: "2px #1FE620" }}>STORE</span>
                <span className="absolute -inset-1 blur-2xl bg-[#1FE620]/20 -z-10"></span>
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-white font-bold leading-tight max-w-xl">
              Productos urbanos con estilo y compra rápida.
            </p>
            <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed">
              Encontrá productos virales, ofertas y novedades con una experiencia de compra simple, moderna y segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <GlowButton variant="primary" onClick={() => navigate("catalogo")} className="text-base">
                Ver catálogo <Icon name="arrow-right" className="w-4 h-4" />
              </GlowButton>
              <GlowButton variant="outline" className="text-base">
                <Icon name="whatsapp" className="w-4 h-4" /> Comprar por WhatsApp
              </GlowButton>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-6 pt-6 border-t border-white/5">
              {[
                { v: "1.2k+", l: "Productos vendidos" },
                { v: "4.8/5", l: "Calificación" },
                { v: "24/7", l: "WhatsApp" },
              ].map(s => (
                <div key={s.l}>
                  <div className="font-display text-2xl sm:text-3xl text-white">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured product card */}
          <div className="lg:col-span-5 relative">
            <div className="relative animate-float">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#1FE620]/30 to-transparent rounded-2xl blur-2xl"></div>
              <div className="relative bg-[#0a0a0a] border border-[#1FE620]/30 rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(31,230,32,0.3)]">
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <Badge kind="viral">Viral</Badge>
                  <div className="text-white font-display text-3xl drop-shadow-[0_0_12px_#1FE620]">-29%</div>
                </div>
                <div className={`aspect-[5/6] bg-gradient-to-br ${featured.color} relative`}>
                  <img src={featured.img} alt={featured.nombre}
                    className="absolute inset-0 w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  {/* Floating stamp - inside the image so it cannot overlap anything below */}
                  <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-black font-display text-sm flex items-center justify-center rotate-[-12deg] ring-2 ring-[#1FE620] shadow-[0_0_30px_rgba(31,230,32,0.6)] animate-stamp z-20">
                    <div className="text-center leading-tight">
                      HOT<br/>DROP
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-white/5 bg-[#0a0a0a]">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] mb-2">Producto destacado</div>
                  <div className="text-white font-bold text-xl mb-3">{featured.nombre}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-white/40 line-through text-sm">{fmt(featured.precioAnterior)}</div>
                      <div className="font-display text-4xl text-white drop-shadow-[0_0_10px_rgba(31,230,32,0.4)]">{fmt(featured.precio)}</div>
                    </div>
                    <button onClick={() => navigate("detalle", { id: featured.id })}
                      className="bg-white hover:bg-white text-black p-3 rounded-md transition-all ring-1 ring-[#1FE620]/40 hover:ring-[#1FE620] hover:shadow-[0_0_20px_rgba(31,230,32,0.5)]">
                      <Icon name="arrow-right" />
                    </button>
                  </div>
                </div>
              </div>

              {/* (stamp moved inside the image to prevent overlap with marquee/section bottom) */}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 bg-white text-black overflow-hidden border-y border-[#1FE620]/40 shadow-[0_0_30px_rgba(31,230,32,0.25)]">
        <div className="flex animate-marquee whitespace-nowrap py-2.5 font-display text-sm tracking-widest">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex shrink-0">
              {["COMPRÁ CON ESTILO","LO VIRAL LLEGA PRIMERO","STOCK REAL · ATENCIÓN DIRECTA","OFERTAS QUE PEGAN FUERTE","EL CATÁLOGO URBANO","ENVÍOS A TODO EL PAÍS"].map((t,i) => (
                <span key={i} className="flex items-center gap-6 px-6">
                  <span className="text-[#1FE620]">★</span> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Destacados -----------------------

function FeaturedProducts() {
  const { PRODUCTS } = window.__PAPU_DATA__;
  const items = [PRODUCTS[3], PRODUCTS[0], PRODUCTS[2], PRODUCTS[7]];
  const { navigate } = useShop();
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Lo mejor del catálogo"
          title="Productos destacados"
          subtitle="Elegidos para romperla: estilo, utilidad y compra rápida."
          action={
            <button onClick={() => navigate("catalogo")} className="hidden sm:inline-flex items-center gap-2 text-[#1FE620] text-sm font-bold uppercase tracking-wider hover:gap-3 transition-all">
              Ver todos <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          }
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Virales -----------------------

function ViralesSection() {
  const { PRODUCTS } = window.__PAPU_DATA__;
  const virales = PRODUCTS.filter(p => p.badge === "viral").slice(0, 4);
  const { navigate, addToCart } = useShop();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1FE620]/[0.04] to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1FE620]/10 rounded-full blur-[150px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#1FE620] uppercase tracking-[0.3em] text-[11px] font-bold mb-2">
              <Icon name="fire" className="w-4 h-4" /> Trending now
            </div>
            <h2 className="font-display text-5xl sm:text-7xl text-white leading-[0.9]">
              Los más <span className="text-white drop-shadow-[0_0_20px_rgba(31,230,32,0.6)]" style={{ WebkitTextStroke: "1.5px #1FE620" }}>VIRALES</span>
            </h2>
            <p className="text-white/60 mt-3 max-w-xl">Lo que todos están mirando, vos lo podés tener primero.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {virales.map((p, i) => (
            <div key={p.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className="group relative bg-[#0a0a0a] border border-white/5 hover:border-[#1FE620]/60 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(31,230,32,0.2)] hover:-translate-y-1 animate-slideup">
              <button onClick={() => navigate("detalle", { id: p.id })}
                className={`block aspect-[4/5] relative bg-gradient-to-br ${p.color} overflow-hidden w-full`}>
                <img src={p.img} alt={p.nombre}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                {/* shine sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1FE620]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <Badge kind="viral">Viral</Badge>
                </div>
                <div className="absolute top-4 right-4 font-display text-4xl text-white leading-none drop-shadow-[0_0_12px_rgba(31,230,32,0.6)]">
                  #{i + 1}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] mb-1">{p.categoria}</div>
                  <div className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2 leading-tight">{p.nombre}</div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="font-display text-2xl sm:text-3xl text-white">{fmt(p.precio)}</div>
                    <div className="text-white/80 text-[10px] uppercase tracking-wider flex items-center gap-1 group-hover:text-[#1FE620] transition-colors">
                      Ver más <Icon name="arrow-right" className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
              {/* Add to cart bar (revealed on hover desktop) */}
              <button onClick={() => addToCart(p)}
                className="hidden md:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-2 bg-white text-black py-2.5 text-xs font-bold uppercase tracking-wider translate-y-full group-hover:translate-y-0 transition-transform duration-300 ring-1 ring-[#1FE620]/40">
                <Icon name="plus" className="w-4 h-4" /> Agregar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Ofertas (cards in infinite marquee) -----------------------

function OfertasSection() {
  const { PRODUCTS } = window.__PAPU_DATA__;
  const ofertas = PRODUCTS.filter(p => p.precioAnterior);
  const loop = [...ofertas, ...ofertas]; // duplicate for seamless loop
  const { navigate } = useShop();
  const [paused, setPaused] = useStateHome(false);

  return (
    <section className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-br from-[#0B3D13]/40 via-[#0a0a0a] to-[#050505] border border-[#1FE620]/30 rounded-2xl p-5 sm:p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(31,230,32,0.3), transparent 50%)" }}></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1FE620]/15 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-[#1FE620]/10 rounded-full blur-[120px]"></div>

          {/* Header */}
          <div className="relative flex flex-wrap justify-between items-end gap-6 mb-8">
            <div>
              <div className="text-[#1FE620] uppercase tracking-[0.3em] text-[11px] font-bold mb-2 flex items-center gap-2">
                <Icon name="bolt" className="w-4 h-4 animate-pulse" /> Precios que pegan fuerte
                <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 bg-[#1FE620]/10 border border-[#1FE620]/30 rounded text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FE620] animate-pulse"></span> EN VIVO
                </span>
              </div>
              <h2 className="font-display text-5xl sm:text-7xl text-white leading-[0.9]">
                Ofertas <span className="italic text-white drop-shadow-[0_0_18px_rgba(31,230,32,0.5)]" style={{ WebkitTextStroke: "1.5px #1FE620" }}>exclusivas</span>
              </h2>
              <p className="text-white/70 mt-3 max-w-xl">Precios que pegan fuerte. Los productos se mueven solos — pausa al pasar el cursor.</p>
            </div>
            <button onClick={() => navigate("catalogo", { filter: "oferta" })}
              className="hidden md:inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-md font-bold text-sm uppercase tracking-wider ring-1 ring-[#1FE620]/50 hover:ring-[#1FE620] shadow-[0_0_20px_rgba(31,230,32,0.3)] hover:shadow-[0_0_30px_rgba(31,230,32,0.5)] transition">
              Ver todas las ofertas <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>

          {/* Infinite marquee of cards */}
          <div className="relative -mx-5 sm:-mx-8"
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {/* Edge fades */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent"></div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent"></div>

            <div className="overflow-hidden py-2 px-5 sm:px-8">
              <div className={`flex gap-4 sm:gap-5 w-max animate-marquee-cards ${paused ? "[animation-play-state:paused]" : ""}`}>
                {loop.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="w-[230px] sm:w-[270px] shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <GlowButton onClick={() => navigate("catalogo", { filter: "oferta" })} className="w-full">
              Ver todas las ofertas
            </GlowButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------- Nuevos ingresos -----------------------

function NuevosSection() {
  const { PRODUCTS } = window.__PAPU_DATA__;
  const nuevos = PRODUCTS.filter(p => p.badge === "nuevo").slice(0, 4);
  const { navigate, addToCart } = useShop();

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Recién llegados"
          title="Nuevos ingresos"
          subtitle="Lo nuevo ya está acá. Entrá antes que se agote."
          action={
            <button onClick={() => navigate("catalogo", { filter: "nuevo" })} className="hidden sm:inline-flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider hover:text-[#1FE620] transition-colors">
              Ver todos los nuevos <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {nuevos.map((p, i) => (
            <div key={p.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className="group relative bg-[#0a0a0a] border border-white/5 hover:border-[#1FE620]/60 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(31,230,32,0.2)] hover:-translate-y-1 animate-slideup">
              <button onClick={() => navigate("detalle", { id: p.id })}
                className={`block aspect-[4/5] relative bg-gradient-to-br ${p.color} overflow-hidden w-full`}>
                <img src={p.img} alt={p.nombre}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                {/* shine sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1FE620]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <Badge kind="nuevo">Nuevo</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/80 font-bold flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FE620] animate-pulse"></span>
                    {p.stock} stock
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] mb-1">{p.categoria}</div>
                  <div className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2 leading-tight">{p.nombre}</div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="font-display text-2xl sm:text-3xl text-white">{fmt(p.precio)}</div>
                    <div className="text-white/80 text-[10px] uppercase tracking-wider flex items-center gap-1 group-hover:text-[#1FE620] transition-colors">
                      Ver más <Icon name="arrow-right" className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
              {/* Add to cart bar (revealed on hover desktop) */}
              <button onClick={() => addToCart(p)}
                className="hidden md:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-2 bg-white text-black py-2.5 text-xs font-bold uppercase tracking-wider translate-y-full group-hover:translate-y-0 transition-transform duration-300 ring-1 ring-[#1FE620]/40">
                <Icon name="plus" className="w-4 h-4" /> Agregar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Categorías -----------------------

function CategoriasSection() {
  const { CATEGORIAS } = window.__PAPU_DATA__;
  const { navigate } = useShop();

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Explorá por categoría"
          title="Categorías"
          subtitle="Encontrá lo que estás buscando. O dejate sorprender."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIAS.map((c, i) => (
            <button key={c.id} onClick={() => navigate("catalogo")}
              className={`group relative bg-[#0d0d0d] border border-white/5 hover:border-[#1FE620] rounded-xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(31,230,32,0.15)] overflow-hidden ${i === 0 ? "sm:col-span-1 lg:col-span-2 lg:row-span-1" : ""}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#1FE620]/0 to-[#1FE620]/0 group-hover:from-[#1FE620]/10 group-hover:to-transparent transition-all"></div>
              <div className="relative flex flex-col gap-3">
                <div className="text-4xl">{c.icon}</div>
                <div>
                  <div className="font-display text-2xl text-white tracking-wide">{c.nombre}</div>
                  <div className="text-white/50 text-xs mt-1">{c.desc}</div>
                </div>
                <div className="flex items-center gap-1 text-[#1FE620] text-[11px] uppercase tracking-wider font-bold mt-1 opacity-60 group-hover:opacity-100">
                  Ver categoría <Icon name="arrow-right" className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Cómo comprar -----------------------

function ComoComprar() {
  const pasos = [
    { n: "01", t: "Elegís tu producto", d: "Navegá el catálogo y sumá lo que más te guste al carrito.", icon: "tag" },
    { n: "02", t: "Confirmás tu pedido", d: "Cargás tus datos en el checkout o nos escribís por WhatsApp.", icon: "check" },
    { n: "03", t: "Recibís o retirás", d: "Coordinamos envío o punto de retiro. Listo, ya es tuyo.", icon: "truck" },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Así de simple"
          title="Cómo comprar"
          subtitle="Tres pasos y listo. Sin vueltas, sin trabas."
        />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#1FE620]/0 via-[#1FE620]/60 to-[#1FE620]/0"></div>
          {pasos.map((p, i) => (
            <div key={i} className="relative bg-[#0d0d0d] border border-white/5 hover:border-[#1FE620]/40 rounded-xl p-6 transition-all hover:-translate-y-1">
              <div className="relative w-16 h-16 rounded-full bg-black border border-[#1FE620]/40 flex items-center justify-center mb-5 shadow-[0_0_24px_rgba(31,230,32,0.2)]">
                <Icon name={p.icon} className="w-7 h-7 text-[#1FE620]" />
              </div>
              <div className="font-display text-6xl text-[#1FE620]/15 absolute top-4 right-5">{p.n}</div>
              <div className="font-display text-2xl text-white mb-2 tracking-wide">{p.t}</div>
              <div className="text-white/60 text-sm leading-relaxed">{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- Beneficios -----------------------

function Beneficios() {
  const items = [
    { i: "bolt", t: "Compra rápida", d: "Checkout simple, sin vueltas." },
    { i: "whatsapp", t: "Atención por WhatsApp", d: "Respuestas rápidas y directas." },
    { i: "box", t: "Stock actualizado", d: "Lo que ves es lo que hay." },
    { i: "sparkles", t: "Productos seleccionados", d: "Curados por nosotros." },
    { i: "tag", t: "Ofertas exclusivas", d: "Precios que rompen." },
    { i: "shield", t: "Pensado para celular", d: "Mobile first, siempre." },
  ];
  return (
    <section className="py-16 sm:py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(31,230,32,0.5) 1px, transparent 1px)", backgroundSize: "100% 40px" }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Por qué comprar acá"
          title="Beneficios"
          subtitle="Compra rápida, segura y con estilo."
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((b, i) => (
            <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-[#1FE620]/40 transition-all group">
              <div className="w-11 h-11 rounded-md bg-[#1FE620]/10 border border-[#1FE620]/30 text-[#1FE620] flex items-center justify-center mb-3 group-hover:bg-[#1FE620] group-hover:text-black transition-all">
                <Icon name={b.i} className="w-5 h-5" />
              </div>
              <div className="text-white font-bold">{b.t}</div>
              <div className="text-white/50 text-sm mt-0.5">{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------- CTA final -----------------------

function CTAFinal() {
  const { navigate } = useShop();
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B3D13]/30 to-transparent"></div>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(31,230,32,0.25), transparent 60%)" }}></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1FE620]/40 bg-[#1FE620]/5 text-[#1FE620] text-[11px] font-bold uppercase tracking-[0.3em] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1FE620] animate-pulse"></span> La tienda urbana
        </div>
        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white leading-[0.9] mb-5">
          ¿Listo para comprar<br />con <span className="text-white drop-shadow-[0_0_30px_rgba(31,230,32,0.65)]" style={{ WebkitTextStroke: "2px #1FE620" }}>estilo?</span>
        </h2>
        <p className="text-white/70 text-lg sm:text-xl mb-8">Entrá, elegí y comprá. Así de simple.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GlowButton onClick={() => navigate("catalogo")} className="text-base">
            Entrar al catálogo <Icon name="arrow-right" className="w-4 h-4" />
          </GlowButton>
          <GlowButton variant="outline" className="text-base">
            <Icon name="whatsapp" className="w-4 h-4" /> Consultar por WhatsApp
          </GlowButton>
        </div>
      </div>
    </section>
  );
}

// ----------------------- Home composer -----------------------

function HomePage() {
  return (
    <main data-screen-label="Home">
      <Hero />
      <FeaturedProducts />
      <ViralesSection />
      <OfertasSection />
      <NuevosSection />
      <CategoriasSection />
      <ComoComprar />
      <Beneficios />
      <CTAFinal />
    </main>
  );
}

Object.assign(window, { HomePage });
