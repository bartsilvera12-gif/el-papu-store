// Shop pages: Catálogo, Detalle, Carrito (page)

const { useState: useStateShop, useMemo: useMemoShop, useRef: useRefShop, useEffect: useEffectShop } = React;

// ----------------------- Dropdown personalizado para ordenar -----------------------

function SortDropdown({ value, onChange }) {
  const options = [
    { v: "relevancia", l: "Relevancia", icon: "sparkles" },
    { v: "precio-asc", l: "Precio: menor a mayor", icon: "arrow-up" },
    { v: "precio-desc", l: "Precio: mayor a menor", icon: "arrow-down" },
    { v: "novedad", l: "Novedad", icon: "bolt" },
  ];
  const current = options.find(o => o.v === value) || options[0];
  const [open, setOpen] = useStateShop(false);
  const ref = useRefShop(null);

  useEffectShop(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`group flex items-center gap-2.5 min-w-[200px] bg-[#0d0d0d] border rounded-md pl-3 pr-2 py-2 text-sm text-white transition-all
          ${open ? "border-[#1FE620] shadow-[0_0_18px_rgba(31,230,32,0.25)]" : "border-white/10 hover:border-[#1FE620]/50"}`}>
        <Icon name={current.icon} className="w-4 h-4 text-[#1FE620]" />
        <span className="flex-1 text-left truncate">{current.l}</span>
        <span className={`w-7 h-7 flex items-center justify-center rounded-md bg-[#1FE620]/10 text-[#1FE620] transition-transform ${open ? "rotate-180" : ""}`}>
          <Icon name="chevron-down" className="w-4 h-4" />
        </span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[260px] bg-[#0a0a0a] border border-[#1FE620]/30 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(31,230,32,0.15)] overflow-hidden z-40 animate-fadeup">
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold">Ordenar por</div>
          <div className="p-1.5">
            {options.map(o => {
              const active = o.v === value;
              return (
                <button key={o.v} type="button" onClick={() => { onChange(o.v); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-all border
                    ${active
                      ? "bg-[#1FE620]/10 border-[#1FE620]/40 text-white"
                      : "border-transparent text-white/75 hover:text-white hover:bg-white/5 hover:border-white/10"}`}>
                  <Icon name={o.icon} className={`w-4 h-4 ${active ? "text-[#1FE620]" : "text-white/50"}`} />
                  <span className="flex-1">{o.l}</span>
                  {active && <Icon name="check" className="w-4 h-4 text-[#1FE620]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------- Catálogo -----------------------

function CatalogoPage() {
  const { PRODUCTS, CATEGORIAS } = window.__PAPU_DATA__;
  const { route, navigate } = useShop();
  const initialFilter = route.params?.filter || "todos";
  const initialCat = route.params?.categoria || "todas";

  const [cat, setCat] = useStateShop(initialCat);
  const [filter, setFilter] = useStateShop(initialFilter);
  const [sort, setSort] = useStateShop("relevancia");
  const [search, setSearch] = useStateShop("");
  const [priceMax, setPriceMax] = useStateShop(60000);
  const [showFilters, setShowFilters] = useStateShop(false);

  const filtered = useMemoShop(() => {
    let arr = [...PRODUCTS];
    if (cat !== "todas") arr = arr.filter(p => p.categoria.toLowerCase() === cat.toLowerCase());
    if (filter === "viral") arr = arr.filter(p => p.is_featured || p.badge === "viral");
    if (filter === "oferta") arr = arr.filter(p => p.precioAnterior);
    if (filter === "nuevo") arr = arr.filter(p => p.badge === "nuevo");
    if (filter === "top") arr = arr.filter(p => p.badge === "top");
    if (search) arr = arr.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
    arr = arr.filter(p => p.precio <= priceMax);
    if (sort === "precio-asc") arr.sort((a, b) => a.precio - b.precio);
    if (sort === "precio-desc") arr.sort((a, b) => b.precio - a.precio);
    if (sort === "novedad") arr.sort((a, b) => (b.badge === "nuevo" ? 1 : 0) - (a.badge === "nuevo" ? 1 : 0));
    return arr;
  }, [cat, filter, sort, search, priceMax]);

  const filtersBar = (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-3">Categoría</div>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => setCat("todas")}
            className={`text-left px-3 py-2 rounded text-sm transition ${cat === "todas" ? "bg-[#1FE620]/10 text-[#1FE620] border border-[#1FE620]/30" : "text-white/70 hover:text-white border border-transparent"}`}>
            Todas
          </button>
          {CATEGORIAS.slice(0, 6).map(c => (
            <button key={c.id} onClick={() => setCat(c.nombre)}
              className={`text-left px-3 py-2 rounded text-sm transition flex items-center gap-2 ${cat === c.nombre ? "bg-[#1FE620]/10 text-[#1FE620] border border-[#1FE620]/30" : "text-white/70 hover:text-white border border-transparent"}`}>
              <span>{c.icon}</span> {c.nombre}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-3">Mostrar</div>
        <div className="flex flex-wrap gap-1.5">
          {[["todos","Todos"],["viral","Virales"],["oferta","Ofertas"],["nuevo","Nuevos"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${filter === k ? "bg-[#1FE620] text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-3">
          <span>Precio máx</span><span className="text-white">{fmt(priceMax)}</span>
        </div>
        <input type="range" min="5000" max="80000" step="1000" value={priceMax}
          onChange={(e) => setPriceMax(+e.target.value)}
          className="w-full accent-[#1FE620]" />
      </div>
    </div>
  );

  return (
    <main data-screen-label="Catalogo" className="pt-24 pb-20 min-h-screen">
      {/* Hero header */}
      <section className="relative pt-8 pb-10 border-b border-white/5">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(31,230,32,0.15), transparent 60%)" }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">El catálogo completo</div>
          <h1 className="font-display text-5xl sm:text-7xl text-white leading-[0.9]">Catálogo completo</h1>
          <p className="text-white/60 mt-3 max-w-2xl">Productos seleccionados, virales y compra rápida. Filtrá, ordená y elegí lo que te rompa.</p>
          <div className="mt-6 flex items-center gap-3 max-w-xl">
            <div className="flex-1 relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-[#0d0d0d] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md pl-11 pr-4 py-3 text-white placeholder:text-white/30" />
            </div>
            <button onClick={() => setShowFilters(true)}
              className="lg:hidden bg-white text-black px-4 py-3 rounded-md font-bold flex items-center gap-2 ring-1 ring-[#1FE620]/50">
              <Icon name="filter" className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block sticky top-24 h-fit bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
          {filtersBar}
        </aside>

        {/* Mobile drawer */}
        <div className={`fixed inset-0 z-[75] lg:hidden transition-opacity ${showFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)}></div>
          <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-[#1FE620]/20 p-5 transition-transform ${showFilters ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex justify-between items-center mb-5">
              <div className="font-display text-2xl text-white">Filtros</div>
              <button onClick={() => setShowFilters(false)} className="text-white"><Icon name="x" /></button>
            </div>
            {filtersBar}
            <GlowButton className="w-full mt-6" onClick={() => setShowFilters(false)}>Aplicar</GlowButton>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="text-white/60 text-sm">{filtered.length} productos</div>
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs uppercase tracking-[0.3em] hidden sm:inline font-bold">Ordenar</span>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-white font-bold text-xl mb-1">Sin resultados</div>
              <div className="text-white/50">Probá con otra categoría o ajustá los filtros.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ----------------------- Detalle de producto -----------------------

function DetallePage() {
  const { PRODUCTS } = window.__PAPU_DATA__;
  const { route, addToCart, navigate } = useShop();
  const product = PRODUCTS.find(p => p.id === route.params?.id) || PRODUCTS[0];
  const [qty, setQty] = useStateShop(1);
  const [activeImg, setActiveImg] = useStateShop(0);

  // Simulate gallery using product image + 3 vecinos en el array.
  // Antes hacíamos product.id % length asumiendo id numérico, pero con
  // datos de Supabase id es UUID string → NaN → crash.
  const productIndex = PRODUCTS.findIndex(p => p.id === product.id);
  const baseIdx = productIndex >= 0 ? productIndex : 0;
  const gallery = [
    product.img,
    (PRODUCTS[(baseIdx + 1) % PRODUCTS.length] || product).img,
    (PRODUCTS[(baseIdx + 2) % PRODUCTS.length] || product).img,
    (PRODUCTS[(baseIdx + 3) % PRODUCTS.length] || product).img,
  ];

  const related = PRODUCTS.filter(p => p.categoria === product.categoria && p.id !== product.id).slice(0, 4);
  const discount = product.precioAnterior ? Math.round((1 - product.precio / product.precioAnterior) * 100) : 0;

  const handleAdd = () => { addToCart(product, qty); };
  const handleBuy = () => { addToCart(product, qty); navigate("checkout"); };

  return (
    <main data-screen-label="Detalle" className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
        <button onClick={() => navigate("home")} className="hover:text-[#1FE620]">Inicio</button>
        <span>/</span>
        <button onClick={() => navigate("catalogo")} className="hover:text-[#1FE620]">Catálogo</button>
        <span>/</span>
        <span className="text-white/70">{product.categoria}</span>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${product.color} border border-white/5`}>
              <img src={gallery[activeImg]} alt={product.nombre}
                className="w-full h-full object-cover transition-opacity duration-300" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && <Badge kind={product.badge}>{product.badge}</Badge>}
                {discount > 0 && <Badge kind="descuento">-{discount}%</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition ${activeImg === i ? "border-[#1FE620] shadow-[0_0_16px_rgba(31,230,32,0.4)]" : "border-white/10 hover:border-white/30 opacity-60 hover:opacity-100"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">{product.categoria}</div>
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-[0.95] tracking-wide mb-3">{product.nombre}</h1>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-[#1FE620] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1FE620] animate-pulse"></span>
                {product.stock} en stock
              </span>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1FE620]/20 rounded-xl p-5 mb-6">
              <div className="flex items-end gap-3 flex-wrap">
                <div className="font-display text-5xl text-white drop-shadow-[0_0_12px_rgba(31,230,32,0.4)]">{fmt(product.precio)}</div>
                {product.precioAnterior && (
                  <>
                    <div className="text-white/40 line-through mb-1">{fmt(product.precioAnterior)}</div>
                    <Badge kind="descuento" className="mb-2">Ahorrás {fmt(product.precioAnterior - product.precio)}</Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-white/70 leading-relaxed mb-6">{product.descripcion}</p>

            <div className="mb-6">
              <div className="text-white/90 font-bold mb-3 text-sm">Características</div>
              <ul className="space-y-2">
                {product.caracteristicas.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                    <Icon name="check" className="w-4 h-4 text-[#1FE620] mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qty + buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center bg-[#0d0d0d] border border-white/10 rounded-md">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 text-white/80 hover:text-[#1FE620]"><Icon name="minus" className="w-4 h-4 mx-auto" /></button>
                <span className="w-12 text-center text-white font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-11 text-white/80 hover:text-[#1FE620]"><Icon name="plus" className="w-4 h-4 mx-auto" /></button>
              </div>
              <GlowButton onClick={handleAdd} className="flex-1 min-w-[200px]">
                <Icon name="cart" className="w-4 h-4" /> Agregar al carrito
              </GlowButton>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <GlowButton variant="outline" onClick={handleBuy} className="flex-1 min-w-[180px]">
                <Icon name="bolt" className="w-4 h-4" /> Comprar ahora
              </GlowButton>
              <GlowButton variant="dark" className="flex-1 min-w-[180px]">
                <Icon name="whatsapp" className="w-4 h-4" /> Por WhatsApp
              </GlowButton>
            </div>

            {/* Trust blocks */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { i: "truck", t: "Envíos disponibles" },
                { i: "chat", t: "Atención rápida" },
                { i: "shield", t: "Compra segura" },
                { i: "box", t: "Stock real" },
              ].map(b => (
                <div key={b.t} className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-md p-3">
                  <Icon name={b.i} className="w-5 h-5 text-[#1FE620]" />
                  <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <SectionHeader eyebrow="Te puede gustar" title="Productos relacionados" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

Object.assign(window, { CatalogoPage, DetallePage });
