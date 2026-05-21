// Core reusable components for El Papu Store

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ----------------------- Utils & Context -----------------------

const fmt = (n) => "$" + n.toLocaleString("es-AR");

const ShopContext = createContext(null);
const useShop = () => useContext(ShopContext);

function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [route, setRoute] = useState({ name: "home", params: {} });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimer = useRef(null);

  const navigate = (name, params = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  };

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    showToast(`${product.nombre} agregado al carrito`);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.precio, 0);

  return (
    <ShopContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
      cartOpen, setCartOpen,
      route, navigate,
      searchOpen, setSearchOpen,
      searchTerm, setSearchTerm,
      toast, showToast,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

// ----------------------- Badges -----------------------

function Badge({ kind, children, className = "" }) {
  const map = {
    viral:  "bg-white text-black ring-1 ring-[#1FE620]/60 shadow-[0_0_10px_rgba(31,230,32,0.4)]",
    nuevo:  "bg-white text-black",
    oferta: "bg-black text-white border border-[#1FE620]",
    top:    "bg-white text-black ring-1 ring-[#1FE620]",
    descuento: "bg-white text-black",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${map[kind] || map.viral} ${className}`}>
      {kind === "viral" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1FE620] animate-pulse shadow-[0_0_6px_#1FE620]"></span>}
      {children || kind}
    </span>
  );
}

// ----------------------- Glow Button -----------------------

function GlowButton({ children, variant = "primary", className = "", ...props }) {
  const base = "relative inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm px-6 py-3.5 transition-all duration-300 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-white text-black hover:bg-white shadow-[0_0_24px_rgba(31,230,32,0.35)] hover:shadow-[0_0_44px_rgba(31,230,32,0.6)] active:scale-[0.98] ring-1 ring-[#1FE620]/40 hover:ring-[#1FE620]",
    outline: "bg-transparent text-white border border-[#1FE620]/60 hover:border-[#1FE620] hover:bg-[#1FE620]/10 hover:shadow-[0_0_24px_rgba(31,230,32,0.3)]",
    ghost: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
    dark: "bg-[#111] text-white border border-white/10 hover:border-[#1FE620]/60 hover:text-white hover:shadow-[0_0_18px_rgba(31,230,32,0.25)]",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ----------------------- Logo -----------------------

function Logo({ size = "md", onClick }) {
  const sizes = { sm: "h-9", md: "h-11", lg: "h-16" };
  return (
    <button onClick={onClick} className="flex items-center gap-2 group select-none cursor-pointer">
      <div className={`${sizes[size]} aspect-square overflow-hidden rounded-md ring-1 ring-[#1FE620]/40 group-hover:ring-[#1FE620] group-hover:shadow-[0_0_20px_rgba(31,230,32,0.5)] transition-all`}>
        <img src="assets/logo.png" alt="El Papu Store" className="w-full h-full object-cover" />
      </div>
      <div className="leading-none hidden sm:block">
        <div className="font-display text-xl tracking-wider text-white">EL PAPU</div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620]">store</div>
      </div>
    </button>
  );
}

// ----------------------- Navbar -----------------------

function Navbar() {
  const { cartCount, setCartOpen, navigate, route, setSearchOpen } = useShop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "home", label: "Inicio" },
    { id: "catalogo", label: "Catálogo" },
    { id: "virales", label: "Virales", params: { filter: "viral" } },
    { id: "ofertas", label: "Ofertas", params: { filter: "oferta" } },
    { id: "sobre", label: "Sobre nosotros" },
    { id: "contacto", label: "Contacto" },
  ];

  const go = (l) => {
    if (l.id === "virales" || l.id === "ofertas") navigate("catalogo", l.params);
    else if (l.id === "contacto") {
      const footer = document.getElementById("site-footer");
      if (footer) footer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    else navigate(l.id);
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-[#1FE620]/15" : "bg-gradient-to-b from-black/70 to-transparent backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Logo size="md" onClick={() => navigate("home")} />

          <nav className="hidden lg:flex items-center gap-7">
            {links.map(l => (
              <button key={l.id} onClick={() => go(l)}
                className={`text-sm font-medium uppercase tracking-wider transition-colors relative
                  ${route.name === l.id ? "text-[#1FE620]" : "text-white/80 hover:text-white"}`}>
                {l.label}
                {route.name === l.id && <span className="absolute -bottom-2 left-0 right-0 h-px bg-[#1FE620] shadow-[0_0_8px_#1FE620]"></span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar"
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-[#1FE620] hover:bg-white/5 rounded-md transition-colors">
              <Icon name="search" />
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Carrito"
              className="relative w-10 h-10 flex items-center justify-center text-white/80 hover:text-[#1FE620] hover:bg-white/5 rounded-md transition-colors">
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center ring-1 ring-[#1FE620] shadow-[0_0_10px_rgba(31,230,32,0.6)]">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate("catalogo")}
              className="hidden md:inline-flex ml-2 items-center gap-1.5 bg-white text-black px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider ring-1 ring-[#1FE620]/40 hover:ring-[#1FE620] shadow-[0_0_16px_rgba(31,230,32,0.3)] hover:shadow-[0_0_24px_rgba(31,230,32,0.55)] transition-all">
              Comprar ahora <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setMobileOpen(true)} aria-label="Menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white">
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-[#1FE620]/20 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
            <Logo size="sm" onClick={() => { navigate("home"); setMobileOpen(false); }} />
            <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-[#1FE620]">
              <Icon name="x" />
            </button>
          </div>
          <nav className="p-5 flex flex-col gap-1">
            {links.map((l, i) => (
              <button key={l.id} onClick={() => go(l)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`group text-left px-4 py-4 rounded-md font-bold uppercase tracking-wider border border-white/5 hover:border-[#1FE620]/40 hover:bg-[#1FE620]/5 transition-all flex items-center justify-between
                  ${route.name === l.id ? "text-[#1FE620] bg-[#1FE620]/5 border-[#1FE620]/30" : "text-white"}`}>
                <span>{l.label}</span>
                <Icon name="arrow-right" className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            <button onClick={() => { navigate("catalogo"); setMobileOpen(false); }}
              className="mt-3 bg-white text-black px-4 py-4 rounded-md font-bold uppercase tracking-wider ring-1 ring-[#1FE620]/50 shadow-[0_0_20px_rgba(31,230,32,0.35)]">
              Comprar ahora →
            </button>
            <a href="#whatsapp" className="mt-2 flex items-center justify-center gap-2 border border-[#1FE620]/40 text-[#1FE620] px-4 py-4 rounded-md font-bold uppercase tracking-wider">
              <Icon name="whatsapp" className="w-4 h-4" /> WhatsApp
            </a>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-xs text-white/40 border-t border-white/5">
            El Papu Store — productos urbanos.
          </div>
        </div>
      </div>
    </>
  );
}

// ----------------------- Icons -----------------------

function Icon({ name, className = "w-5 h-5" }) {
  const props = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    cart: <><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="10" cy="21" r="1.2" /><circle cx="17" cy="21" r="1.2" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
    "arrow-right": <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    "arrow-left": <><path d="M19 12H5M11 5l-7 7 7 7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    star: <><path d="m12 2 3 7 7.5.6-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4-5.7-5L9 9z" fill="currentColor" stroke="none" /></>,
    heart: <><path d="M12 21s-7-4.5-9.5-9C.9 8.7 2.6 5 6 5c2 0 3.4 1.1 4.3 2.5C11.3 6.1 12.7 5 14.7 5c3.4 0 5.1 3.7 3.5 7-2.5 4.5-9.5 9-9.5 9z" /></>,
    whatsapp: <><path d="M20.5 12a8.5 8.5 0 1 0-15.4 5L4 21l4.1-1.1A8.5 8.5 0 0 0 20.5 12z" /><path d="M8.5 9.5c0-.6.4-1 1-1h.6c.3 0 .6.2.7.5l.7 1.7c.1.3 0 .6-.2.8l-.6.5c.5 1 1.3 1.8 2.3 2.3l.5-.6c.2-.2.5-.3.8-.2l1.7.7c.3.1.5.4.5.7v.6c0 .6-.4 1-1 1A6.7 6.7 0 0 1 8.5 9.5z" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></>,
    facebook: <><path d="M14 8h3V5h-3a4 4 0 0 0-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 0 1 1-1z" /></>,
    truck: <><rect x="2" y="7" width="13" height="10" rx="1" /><path d="M15 10h4l3 3v4h-7" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
    shield: <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></>,
    bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" /></>,
    box: <><path d="m3.3 7 8.7 5 8.7-5M12 12v10M3.3 7v10L12 22l8.7-5V7L12 2 3.3 7z" /></>,
    tag: <><path d="M3 12V3h9l9 9-9 9-9-9z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></>,
    fire: <><path d="M12 22c4 0 7-3 7-7 0-4-3-5-3-8 0 2-2 3-4 3 1-3-1-6-3-7 0 5-4 7-4 12 0 4 3 7 7 7z" /></>,
    "chevron-down": <><path d="m6 9 6 6 6-6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4" /></>,
    sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5 8 16M16 8l2.5-2.5" /></>,
    headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><rect x="3" y="14" width="4" height="7" rx="1" /><rect x="17" y="14" width="4" height="7" rx="1" /></>,
    gamepad: <><rect x="2" y="7" width="20" height="10" rx="3" /><circle cx="16" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="14" r="1.2" fill="currentColor" /><path d="M6 12h4M8 10v4" /></>,
    home: <><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

// ----------------------- Section Header -----------------------

function SectionHeader({ eyebrow, title, subtitle, action, align = "left" }) {
  return (
    <div className={`mb-8 sm:mb-10 flex flex-col gap-2 ${align === "center" ? "items-center text-center" : ""}`}>
      {eyebrow && (
        <div className="flex items-center gap-2 text-[#1FE620] uppercase tracking-[0.3em] text-[11px] font-bold">
          <span className="inline-block w-6 h-px bg-[#1FE620]"></span>
          {eyebrow}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between w-full gap-4">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-[0.95]">{title}</h2>
        {action}
      </div>
      {subtitle && <p className="text-white/60 max-w-2xl text-base sm:text-lg">{subtitle}</p>}
    </div>
  );
}

// ----------------------- Product Card -----------------------

function ProductCard({ product, rank }) {
  const { addToCart, navigate } = useShop();
  const discount = product.precioAnterior ? Math.round((1 - product.precio / product.precioAnterior) * 100) : 0;

  return (
    <div className="group relative bg-[#0d0d0d] border border-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#1FE620]/60 hover:shadow-[0_0_36px_rgba(31,230,32,0.18)] hover:-translate-y-1 flex flex-col">
      <button onClick={() => navigate("detalle", { id: product.id })}
        className={`relative aspect-square overflow-hidden bg-gradient-to-br ${product.color}`}>
        <img src={product.img} alt={product.nombre}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 mix-blend-luminosity group-hover:mix-blend-normal opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {product.badge && <Badge kind={product.badge}>{product.badge}</Badge>}
            {discount > 0 && <Badge kind="descuento">-{discount}%</Badge>}
          </div>
          {rank && (
            <div className="font-display text-4xl text-white leading-none drop-shadow-[0_0_12px_rgba(31,230,32,0.6)]">
              #{rank}
            </div>
          )}
        </div>
        {/* Quick actions visible on hover (desktop) */}
        <div className="absolute bottom-3 left-3 right-3 hidden md:flex opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="flex-1 text-center bg-black/70 backdrop-blur-sm border border-[#1FE620]/40 text-white text-xs font-bold uppercase tracking-wider py-2 rounded">
            Ver detalle
          </div>
        </div>
      </button>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#1FE620]/80 font-bold">{product.categoria}</div>
        <button onClick={() => navigate("detalle", { id: product.id })} className="text-left">
          <h3 className="text-white font-bold text-base sm:text-[17px] leading-tight group-hover:text-white transition-colors line-clamp-2 min-h-[2.5em]">
            {product.nombre}
          </h3>
        </button>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-0.5 text-[#1FE620]">
            {[...Array(5)].map((_, i) => <Icon key={i} name="star" className={`w-3 h-3 ${i < Math.floor(product.rating) ? "" : "opacity-25"}`} />)}
          </div>
          <span className="text-white/40">({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {product.precioAnterior && (
              <div className="text-white/40 line-through text-xs">{fmt(product.precioAnterior)}</div>
            )}
            <div className="text-white font-display text-2xl tracking-wide">
              {fmt(product.precio)}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            aria-label="Agregar"
            className="w-11 h-11 shrink-0 bg-white hover:bg-white text-black rounded-md flex items-center justify-center transition-all ring-1 ring-[#1FE620]/40 hover:ring-[#1FE620] hover:shadow-[0_0_20px_rgba(31,230,32,0.5)] active:scale-95">
            <Icon name="plus" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------- Cart Drawer -----------------------

function CartDrawer() {
  const { cartOpen, setCartOpen, cart, cartTotal, updateQty, removeFromCart, navigate, clearCart } = useShop();

  return (
    <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
      <aside className={`absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-[#0a0a0a] border-l border-[#1FE620]/20 flex flex-col transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620]">Tu carrito</div>
            <h3 className="font-display text-2xl text-white">{cart.length} {cart.length === 1 ? "producto" : "productos"}</h3>
          </div>
          <button onClick={() => setCartOpen(false)} className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-[#1FE620]">
            <Icon name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
              <div className="w-20 h-20 rounded-full border border-[#1FE620]/40 flex items-center justify-center text-[#1FE620]">
                <Icon name="cart" className="w-9 h-9" />
              </div>
              <div>
                <div className="font-display text-2xl text-white mb-1">Tu carrito está vacío</div>
                <div className="text-white/50 text-sm">Agregá productos y volvé acá.</div>
              </div>
              <GlowButton variant="primary" onClick={() => { setCartOpen(false); navigate("catalogo"); }}>
                Ver catálogo
              </GlowButton>
            </div>
          )}

          {cart.map(item => (
            <div key={item.id} className="flex gap-3 bg-[#111] border border-white/5 rounded-lg p-3 hover:border-[#1FE620]/30 transition">
              <img src={item.img} alt="" className="w-20 h-20 rounded-md object-cover bg-black" />
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-wider text-[#1FE620]">{item.categoria}</div>
                <div className="text-white font-bold text-sm line-clamp-2 leading-tight">{item.nombre}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center bg-black/40 border border-white/10 rounded">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 text-white/70 hover:text-[#1FE620]"><Icon name="minus" className="w-3 h-3 mx-auto" /></button>
                    <span className="w-6 text-center text-sm text-white font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 text-white/70 hover:text-[#1FE620]"><Icon name="plus" className="w-3 h-3 mx-auto" /></button>
                  </div>
                  <div className="text-white font-display text-lg">{fmt(item.precio * item.qty)}</div>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 shrink-0 text-white/40 hover:text-[#1FE620]"><Icon name="x" className="w-4 h-4 mx-auto" /></button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a]">
            <div className="flex justify-between items-center mb-1 text-sm text-white/60">
              <span>Subtotal</span><span>{fmt(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-sm">Total</span>
              <span className="font-display text-3xl text-white drop-shadow-[0_0_10px_rgba(31,230,32,0.4)]">{fmt(cartTotal)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <GlowButton onClick={() => { setCartOpen(false); navigate("checkout"); }} className="w-full">
                Finalizar compra <Icon name="arrow-right" className="w-4 h-4" />
              </GlowButton>
              <button onClick={() => { setCartOpen(false); navigate("catalogo"); }} className="text-white/60 text-xs uppercase tracking-wider py-2 hover:text-[#1FE620]">
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ----------------------- Search Overlay -----------------------

function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchTerm, setSearchTerm, navigate } = useShop();
  const { PRODUCTS } = window.__PAPU_DATA__;
  const results = searchTerm
    ? PRODUCTS.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];
  const ref = useRef(null);
  useEffect(() => { if (searchOpen) setTimeout(() => ref.current?.focus(), 100); }, [searchOpen]);

  return (
    <div className={`fixed inset-0 z-[80] transition-all duration-300 ${searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSearchOpen(false)}></div>
      <div className="relative max-w-2xl mx-auto pt-24 px-4">
        <div className="bg-[#0a0a0a] border border-[#1FE620]/30 rounded-xl shadow-[0_0_60px_rgba(31,230,32,0.15)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Icon name="search" className="w-5 h-5 text-[#1FE620]" />
            <input ref={ref} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscá productos, categorías, virales..."
              className="flex-1 bg-transparent outline-none text-white text-lg placeholder:text-white/30" />
            <button onClick={() => setSearchOpen(false)} className="text-white/40 hover:text-white"><Icon name="x" /></button>
          </div>
          {results.length > 0 && (
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {results.map(p => (
                <button key={p.id} onClick={() => { setSearchOpen(false); navigate("detalle", { id: p.id }); }}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#1FE620]/10 text-left">
                  <img src={p.img} className="w-12 h-12 rounded object-cover" alt="" />
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">{p.nombre}</div>
                    <div className="text-white/50 text-xs">{p.categoria}</div>
                  </div>
                  <div className="text-white font-display">{fmt(p.precio)}</div>
                </button>
              ))}
            </div>
          )}
          {searchTerm && results.length === 0 && (
            <div className="p-8 text-center text-white/50">Sin resultados para "{searchTerm}"</div>
          )}
          {!searchTerm && (
            <div className="p-5 text-xs text-white/40 uppercase tracking-wider">
              Sugerencias: auriculares, gamer, viral, smartwatch
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------- Footer -----------------------

function Footer() {
  const { navigate } = useShop();
  return (
    <footer id="site-footer" className="bg-[#050505] border-t border-[#1FE620]/15 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1FE620] to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo size="md" onClick={() => navigate("home")} />
            <p className="text-white/50 text-sm mt-4 leading-relaxed">
              El Papu Store — productos urbanos, virales y compra rápida.
            </p>
            <div className="flex gap-2 mt-5">
              {["whatsapp","instagram","facebook"].map(n => (
                <a key={n} href="#" className="w-10 h-10 rounded-md border border-white/10 hover:border-[#1FE620] hover:text-[#1FE620] text-white/70 flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(31,230,32,0.3)]">
                  <Icon name={n} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[#1FE620] uppercase text-xs font-bold tracking-[0.3em] mb-4">Tienda</div>
            <ul className="space-y-2.5 text-sm">
              {[["home","Inicio"],["catalogo","Catálogo"],["catalogo","Virales"],["catalogo","Ofertas"],["sobre","Sobre nosotros"],["contacto","Contacto"]].map(([r,l],i) => (
                <li key={i}><button onClick={() => {
                  if (r === "contacto") {
                    document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else navigate(r);
                }} className="text-white/60 hover:text-[#1FE620]">{l}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[#1FE620] uppercase text-xs font-bold tracking-[0.3em] mb-4">Categorías</div>
            <ul className="space-y-2.5 text-sm">
              {["Tecnología","Gaming","Accesorios","Moda","Tendencias","Hogar"].map(c => (
                <li key={c}><button onClick={() => navigate("catalogo")} className="text-white/60 hover:text-[#1FE620]">{c}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[#1FE620] uppercase text-xs font-bold tracking-[0.3em] mb-4">Ayuda</div>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => navigate("faq")} className="text-white/60 hover:text-[#1FE620]">Preguntas frecuentes</button></li>
              <li><button onClick={() => navigate("politicas")} className="text-white/60 hover:text-[#1FE620]">Políticas</button></li>
              <li><button onClick={() => document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="text-white/60 hover:text-[#1FE620]">Contacto</button></li>
              <li><a href="#" className="text-white/60 hover:text-[#1FE620]">WhatsApp</a></li>
            </ul>
            <div className="mt-5 text-xs text-white/40">
              Lun a Sáb · 10 a 20hs<br />Atención por WhatsApp 24/7
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
          <div>© 2026 El Papu Store. Todos los derechos reservados.</div>
          <div>Hecho con dedicación · v1.0</div>
        </div>
      </div>
    </footer>
  );
}

// ----------------------- Toast -----------------------

function Toast({ show, message }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="bg-white text-black font-bold text-sm px-5 py-3 rounded-md ring-1 ring-[#1FE620] shadow-[0_0_30px_rgba(31,230,32,0.5)] flex items-center gap-2">
        <Icon name="check" className="w-4 h-4" />{message}
      </div>
    </div>
  );
}

Object.assign(window, {
  ShopProvider, useShop, fmt,
  Badge, GlowButton, Logo, Navbar, Icon, SectionHeader, ProductCard,
  CartDrawer, SearchOverlay, Footer, Toast,
});
