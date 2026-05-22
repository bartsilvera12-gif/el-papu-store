// Admin Panel — El Papu Store
// =============================
// Privado. No referenciado desde el sitio público. Se monta cuando
// window.location.pathname empieza con /admin (ver app.jsx).
//
// Usa Supabase Auth (email/password). Valida que el usuario autenticado
// exista en elpapustore.admin_users (is_active=true) — sino, signOut.

// Centinela: si Babel compila este archivo y JS lo ejecuta, esto se setea.
window.__ADMIN_JSX_LOADED__ = true;

const AdminApp = (function () {
  const { useState, useEffect, useMemo, useCallback, createContext, useContext } = React;

  // ---------- Mini-router por path (/admin/login, /admin, /admin/productos, ...) ----------

  function getAdminRoute() {
    const p = window.location.pathname.replace(/\/+$/, "");
    if (p === "/admin" || p === "/admin/dashboard") return "dashboard";
    if (p === "/admin/login") return "login";
    if (p === "/admin/productos") return "productos";
    if (p === "/admin/categorias") return "categorias";
    if (p === "/admin/pedidos") return "pedidos";
    if (p === "/admin/faqs") return "faqs";
    return "dashboard";
  }
  function pushAdmin(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // ---------- Auth context ----------

  const AdminCtx = createContext(null);
  const useAdmin = () => useContext(AdminCtx);

  function AdminProvider({ children }) {
    const [route, setRoute] = useState(getAdminRoute());
    const [session, setSession] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [checking, setChecking] = useState(true);
    const [authError, setAuthError] = useState("");

    useEffect(() => {
      const onPop = () => setRoute(getAdminRoute());
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }, []);

    const client = window.getSupabaseClient && window.getSupabaseClient();

    // Bootstrap: si hay sesión, validar que sea admin
    useEffect(() => {
      if (!client) { setChecking(false); return; }
      let cancelled = false;
      (async () => {
        const { data: { session: s } } = await client.auth.getSession();
        if (cancelled) return;
        setSession(s);
        if (s) await validateAdmin(s);
        else setChecking(false);
      })();
      const { data: sub } = client.auth.onAuthStateChange(async (_event, s) => {
        if (cancelled) return;
        setSession(s);
        if (s) await validateAdmin(s);
        else { setAdminProfile(null); setChecking(false); }
      });
      return () => { cancelled = true; sub && sub.subscription && sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function validateAdmin(s) {
      setChecking(true);
      try {
        const { data, error } = await client
          .from("admin_users")
          .select("id, email, full_name, role, is_active, auth_user_id")
          .eq("auth_user_id", s.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          await client.auth.signOut();
          setAdminProfile(null);
          setAuthError("Tu usuario no tiene permisos de administrador.");
        } else {
          setAdminProfile(data);
          setAuthError("");
        }
      } catch (err) {
        setAdminProfile(null);
        setAuthError(err.message || "Error validando admin.");
      } finally {
        setChecking(false);
      }
    }

    async function login(email, password) {
      if (!client) return { error: "Supabase no configurado." };
      setAuthError("");
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) { setAuthError(error.message); return { error: error.message }; }
      // onAuthStateChange dispara validateAdmin
      return { ok: true };
    }

    async function logout() {
      if (!client) return;
      await client.auth.signOut();
      setAdminProfile(null);
      pushAdmin("/admin/login");
    }

    return (
      <AdminCtx.Provider value={{
        client, route, setRoute, session, adminProfile, checking, authError, login, logout, push: pushAdmin,
      }}>
        {children}
      </AdminCtx.Provider>
    );
  }

  // ---------- UI primitives ----------

  function Field({ label, children, hint }) {
    return (
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-1.5 block">{label}</span>
        {children}
        {hint && <span className="text-[10px] text-white/30 mt-1 block">{hint}</span>}
      </label>
    );
  }
  function TextInput({ value, onChange, type = "text", placeholder = "", ...rest }) {
    return (
      <input type={type} value={value == null ? "" : value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/30 transition"
        {...rest} />
    );
  }
  function TextArea({ value, onChange, rows = 4, placeholder = "" }) {
    return (
      <textarea value={value == null ? "" : value} placeholder={placeholder} rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/30 transition resize-y" />
    );
  }
  function Btn({ children, variant = "primary", onClick, type = "button", disabled, className = "" }) {
    const styles = {
      primary: "bg-[#1FE620] text-black hover:shadow-[0_0_20px_rgba(31,230,32,0.5)]",
      outline: "border border-[#1FE620]/40 text-[#1FE620] hover:bg-[#1FE620]/10",
      ghost: "text-white/70 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30",
    };
    return (
      <button type={type} onClick={onClick} disabled={disabled}
        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>
        {children}
      </button>
    );
  }
  function StatusPill({ active }) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${active ? "bg-[#1FE620]/15 text-[#1FE620] border border-[#1FE620]/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#1FE620]" : "bg-white/30"}`}></span>
        {active ? "Activo" : "Inactivo"}
      </span>
    );
  }
  function Modal({ open, onClose, title, children, footer, wide }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
        <div className={`relative bg-[#0a0a0a] border border-[#1FE620]/30 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[90vh] flex flex-col`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="font-display text-2xl text-white">{title}</div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">✕</button>
          </div>
          <div className="px-5 py-5 overflow-y-auto">{children}</div>
          {footer && <div className="px-5 py-4 border-t border-white/5 flex justify-end gap-2">{footer}</div>}
        </div>
      </div>
    );
  }

  // ---------- Login ----------

  function Login() {
    const { login, authError, session, adminProfile, checking, push } = useAdmin();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (!checking && session && adminProfile) push("/admin/dashboard");
    }, [checking, session, adminProfile, push]);

    const onSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      await login(email, pass);
      setSubmitting(false);
    };

    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="font-display text-4xl tracking-wide">EL PAPU</div>
            <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold">Admin</div>
          </div>
          <form onSubmit={onSubmit} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 space-y-4">
            <Field label="Email">
              <TextInput type="email" value={email} onChange={setEmail} placeholder="admin@elpapustore.com" />
            </Field>
            <Field label="Contraseña">
              <TextInput type="password" value={pass} onChange={setPass} placeholder="••••••••" />
            </Field>
            {authError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{authError}</div>}
            <Btn type="submit" disabled={submitting || !email || !pass} className="w-full">
              {submitting ? "Ingresando..." : "Ingresar"}
            </Btn>
            {!(window.isSupabaseConfigured && window.isSupabaseConfigured()) && (
              <div className="text-[10px] text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                Supabase no está configurado todavía. Definí URL/anon key en <code>src/supabase-client.jsx</code> o <code>window.__PAPU_CONFIG__</code>.
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ---------- Layout (sidebar) ----------

  function Layout({ children }) {
    const { adminProfile, logout, route, push } = useAdmin();
    const nav = [
      { id: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
      { id: "productos", label: "Productos", path: "/admin/productos", icon: "📦" },
      { id: "categorias", label: "Categorías", path: "/admin/categorias", icon: "🏷️" },
      { id: "pedidos", label: "Pedidos", path: "/admin/pedidos", icon: "🛒" },
      { id: "faqs", label: "FAQs", path: "/admin/faqs", icon: "❓" },
    ];
    return (
      <div className="min-h-screen bg-[#050505] text-white flex">
        <aside className="w-60 shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
          <div className="p-5 border-b border-white/5">
            <div className="font-display text-2xl tracking-wide">EL PAPU</div>
            <div className="text-[#1FE620] text-[10px] uppercase tracking-[0.3em] font-bold">Admin</div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {nav.map(n => (
              <button key={n.id} onClick={() => push(n.path)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition
                  ${route === n.id ? "bg-[#1FE620]/10 text-[#1FE620] border border-[#1FE620]/30" : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                <span>{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-white/5">
            <div className="px-3 py-2 text-xs">
              <div className="text-white/40">Sesión</div>
              <div className="text-white truncate">{(adminProfile && adminProfile.email) || "—"}</div>
            </div>
            <Btn variant="ghost" onClick={logout} className="w-full">Cerrar sesión</Btn>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    );
  }

  function PageHeader({ title, subtitle, actions }) {
    return (
      <div className="flex items-end justify-between flex-wrap gap-3 px-6 sm:px-8 py-6 border-b border-white/5">
        <div>
          <div className="text-[#1FE620] text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Admin</div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">{title}</h1>
          {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }

  function Content({ children }) {
    return <div className="px-6 sm:px-8 py-6">{children}</div>;
  }

  // ---------- Dashboard ----------

  function Dashboard() {
    const { client } = useAdmin();
    const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, pendingOrders: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancel = false;
      (async () => {
        try {
          const [tp, ap, po, to] = await Promise.all([
            client.from("products").select("*", { count: "exact", head: true }),
            client.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
            client.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
            client.from("orders").select("*", { count: "exact", head: true }),
          ]);
          if (cancel) return;
          setStats({
            totalProducts: tp.count || 0,
            activeProducts: ap.count || 0,
            pendingOrders: po.count || 0,
            totalOrders: to.count || 0,
          });
        } finally { if (!cancel) setLoading(false); }
      })();
      return () => { cancel = true; };
    }, [client]);

    const cards = [
      { l: "Total productos", v: stats.totalProducts },
      { l: "Productos activos", v: stats.activeProducts },
      { l: "Pedidos pendientes", v: stats.pendingOrders, accent: true },
      { l: "Total pedidos", v: stats.totalOrders },
    ];

    return (
      <>
        <PageHeader title="Dashboard" subtitle="Resumen de la tienda" />
        <Content>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map(c => (
              <div key={c.l} className={`bg-[#0a0a0a] border rounded-xl p-5 ${c.accent ? "border-[#1FE620]/40" : "border-white/5"}`}>
                <div className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold">{c.l}</div>
                <div className={`font-display text-4xl mt-2 ${c.accent ? "text-[#1FE620]" : "text-white"}`}>{loading ? "…" : c.v}</div>
              </div>
            ))}
          </div>
        </Content>
      </>
    );
  }

  // ---------- Productos ----------

  function Productos() {
    const { client } = useAdmin();
    const [rows, setRows] = useState([]);
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // product row o "new"
    const [query, setQuery] = useState("");

    const load = useCallback(async () => {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        client.from("products").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        client.from("categories").select("id, name, slug, is_active").order("display_order", { ascending: true }),
      ]);
      setRows(pRes.data || []);
      setCats(cRes.data || []);
      setLoading(false);
    }, [client]);

    useEffect(() => { load(); }, [load]);

    const toggleActive = async (row) => {
      await client.from("products").update({ is_active: !row.is_active }).eq("id", row.id);
      load();
    };
    const save = async (form) => {
      const payload = { ...form };
      if (typeof payload.features === "string") {
        payload.features = payload.features.split("\n").map(s => s.trim()).filter(Boolean);
      }
      if (editing === "new") {
        const { error } = await client.from("products").insert(payload);
        if (error) { alert(error.message); return; }
      } else if (editing && editing.id) {
        const { error } = await client.from("products").update(payload).eq("id", editing.id);
        if (error) { alert(error.message); return; }
      }
      setEditing(null);
      load();
    };

    const filtered = rows.filter(r => !query || r.name.toLowerCase().includes(query.toLowerCase()) || (r.sku || "").toLowerCase().includes(query.toLowerCase()));

    return (
      <>
        <PageHeader title="Productos" subtitle={`${rows.length} en catálogo`}
          actions={<Btn onClick={() => setEditing("new")}>+ Nuevo producto</Btn>} />
        <Content>
          <div className="mb-4">
            <TextInput value={query} onChange={setQuery} placeholder="Buscar por nombre o SKU..." />
          </div>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_100px_100px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Producto</div><div>Precio</div><div>Stock</div><div>Estado</div><div className="text-right">Acciones</div>
              </div>
              {filtered.map(r => (
                <div key={r.id} className="grid grid-cols-[1fr_120px_100px_100px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    {r.image_url && <img src={r.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div className="min-w-0">
                      <div className="text-white text-sm font-bold truncate">{r.name}</div>
                      <div className="text-white/40 text-xs">{r.sku || r.slug}</div>
                    </div>
                  </div>
                  <div className="text-white text-sm">Gs. {(r.price || 0).toLocaleString("es-PY")}</div>
                  <div className="text-white text-sm">{r.stock || 0}</div>
                  <div><StatusPill active={r.is_active} /></div>
                  <div className="flex justify-end gap-1">
                    <Btn variant="outline" onClick={() => setEditing(r)}>Editar</Btn>
                    <Btn variant="ghost" onClick={() => toggleActive(r)}>{r.is_active ? "Off" : "On"}</Btn>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="px-4 py-8 text-center text-white/40">Sin resultados.</div>}
            </div>
          )}
        </Content>
        {editing && <ProductEditor product={editing === "new" ? null : editing} cats={cats} onClose={() => setEditing(null)} onSave={save} />}
      </>
    );
  }

  function ProductEditor({ product, cats, onClose, onSave }) {
    const isNew = !product;
    const p = product || {};
    const firstCat = cats[0] || {};
    const [f, setF] = useState({
      name: p.name || "",
      slug: p.slug || "",
      sku: p.sku || "",
      category_id: p.category_id || firstCat.id || "",
      short_description: p.short_description || "",
      description: p.description || "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
      price: p.price != null ? p.price : 0,
      compare_at_price: p.compare_at_price != null ? p.compare_at_price : "",
      stock: p.stock != null ? p.stock : 0,
      badge: p.badge || "",
      image_url: p.image_url || "",
      color: p.color || "from-emerald-500/20 to-black",
      is_active: p.is_active !== false,
      is_featured: p.is_featured === true,
      display_order: p.display_order != null ? p.display_order : 0,
    });
    const set = (k, v) => setF(s => ({ ...s, [k]: v }));
    const submit = () => {
      const payload = {
        ...f,
        price: Number(f.price) || 0,
        compare_at_price: f.compare_at_price === "" ? null : (Number(f.compare_at_price) || null),
        stock: Number(f.stock) || 0,
        display_order: Number(f.display_order) || 0,
        category_id: f.category_id || null,
        badge: f.badge || null,
      };
      onSave(payload);
    };
    return (
      <Modal open wide onClose={onClose} title={isNew ? "Nuevo producto" : "Editar producto"}
        footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={submit}>Guardar</Btn></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre"><TextInput value={f.name} onChange={v => set("name", v)} /></Field>
          <Field label="Slug" hint="único, sin espacios"><TextInput value={f.slug} onChange={v => set("slug", v)} /></Field>
          <Field label="SKU"><TextInput value={f.sku} onChange={v => set("sku", v)} /></Field>
          <Field label="Categoría">
            <select value={f.category_id || ""} onChange={(e) => set("category_id", e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-white text-sm">
              <option value="">— Sin categoría —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Precio (Gs.)"><TextInput type="number" value={f.price} onChange={v => set("price", v)} /></Field>
          <Field label="Precio anterior (opcional)"><TextInput type="number" value={f.compare_at_price} onChange={v => set("compare_at_price", v)} /></Field>
          <Field label="Stock"><TextInput type="number" value={f.stock} onChange={v => set("stock", v)} /></Field>
          <Field label="Badge" hint="viral | oferta | nuevo | top">
            <select value={f.badge || ""} onChange={(e) => set("badge", e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-white text-sm">
              <option value="">— ninguno —</option>
              <option value="viral">viral</option>
              <option value="oferta">oferta</option>
              <option value="nuevo">nuevo</option>
              <option value="top">top</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="URL de imagen principal"><TextInput value={f.image_url} onChange={v => set("image_url", v)} placeholder="https://..." /></Field>
          </div>
          <Field label="Color (gradiente Tailwind)"><TextInput value={f.color} onChange={v => set("color", v)} placeholder="from-emerald-500/20 to-black" /></Field>
          <Field label="Orden de visualización"><TextInput type="number" value={f.display_order} onChange={v => set("display_order", v)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Descripción corta"><TextArea rows={2} value={f.short_description} onChange={v => set("short_description", v)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descripción"><TextArea value={f.description} onChange={v => set("description", v)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Características (una por línea)"><TextArea value={f.features} onChange={v => set("features", v)} placeholder="Bluetooth 5.3\nHasta 40h de batería\n..." /></Field>
          </div>
          <div className="sm:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Activo
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destacado
            </label>
          </div>
        </div>
      </Modal>
    );
  }

  // ---------- Categorías ----------

  function Categorias() {
    const { client } = useAdmin();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
      setLoading(true);
      const { data } = await client.from("categories").select("*").order("display_order", { ascending: true });
      setRows(data || []);
      setLoading(false);
    }, [client]);

    useEffect(() => { load(); }, [load]);

    const toggle = async (row) => {
      await client.from("categories").update({ is_active: !row.is_active }).eq("id", row.id);
      load();
    };
    const save = async (form) => {
      if (editing === "new") {
        const { error } = await client.from("categories").insert(form);
        if (error) { alert(error.message); return; }
      } else {
        const { error } = await client.from("categories").update(form).eq("id", editing.id);
        if (error) { alert(error.message); return; }
      }
      setEditing(null); load();
    };

    return (
      <>
        <PageHeader title="Categorías" subtitle={`${rows.length} en total`}
          actions={<Btn onClick={() => setEditing("new")}>+ Nueva categoría</Btn>} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr_100px_100px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Icon</div><div>Nombre</div><div>Slug</div><div>Orden</div><div>Estado</div><div className="text-right">Acciones</div>
              </div>
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-[60px_1fr_1fr_100px_100px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0">
                  <div className="text-2xl">{r.icon}</div>
                  <div className="text-white font-bold text-sm">{r.name}</div>
                  <div className="text-white/50 text-xs">{r.slug}</div>
                  <div className="text-white/70 text-sm">{r.display_order}</div>
                  <div><StatusPill active={r.is_active} /></div>
                  <div className="flex justify-end gap-1">
                    <Btn variant="outline" onClick={() => setEditing(r)}>Editar</Btn>
                    <Btn variant="ghost" onClick={() => toggle(r)}>{r.is_active ? "Off" : "On"}</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Content>
        {editing && <CategoryEditor cat={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
      </>
    );
  }

  function CategoryEditor({ cat, onClose, onSave }) {
    const isNew = !cat;
    const c = cat || {};
    const [f, setF] = useState({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      icon: c.icon || "🏷️",
      display_order: c.display_order != null ? c.display_order : 0,
      is_active: c.is_active !== false,
    });
    const set = (k, v) => setF(s => ({ ...s, [k]: v }));
    const submit = () => onSave({ ...f, display_order: Number(f.display_order) || 0 });
    return (
      <Modal open onClose={onClose} title={isNew ? "Nueva categoría" : "Editar categoría"}
        footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={submit}>Guardar</Btn></>}>
        <div className="space-y-4">
          <Field label="Nombre"><TextInput value={f.name} onChange={v => set("name", v)} /></Field>
          <Field label="Slug"><TextInput value={f.slug} onChange={v => set("slug", v)} /></Field>
          <Field label="Icono (emoji)"><TextInput value={f.icon} onChange={v => set("icon", v)} /></Field>
          <Field label="Descripción"><TextArea rows={2} value={f.description} onChange={v => set("description", v)} /></Field>
          <Field label="Orden"><TextInput type="number" value={f.display_order} onChange={v => set("display_order", v)} /></Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Activa
          </label>
        </div>
      </Modal>
    );
  }

  // ---------- Pedidos ----------

  function Pedidos() {
    const { client } = useAdmin();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const load = useCallback(async () => {
      setLoading(true);
      const { data } = await client.from("orders").select("*").order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    }, [client]);

    useEffect(() => { load(); }, [load]);

    const setStatus = async (row, status) => {
      await client.from("orders").update({ status }).eq("id", row.id);
      load();
      if (selected && selected.id === row.id) setSelected({ ...selected, status });
    };

    const statusColors = {
      pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      confirmed: "text-[#1FE620] bg-[#1FE620]/10 border-[#1FE620]/30",
      shipped: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      delivered: "text-[#1FE620] bg-[#1FE620]/15 border-[#1FE620]/40",
      cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
    };

    return (
      <>
        <PageHeader title="Pedidos" subtitle={`${rows.length} pedidos`} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_120px_140px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Código</div><div>Cliente</div><div>Total</div><div>Estado</div><div className="text-right">Detalle</div>
              </div>
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-[1fr_1fr_120px_140px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0">
                  <div className="text-white font-bold text-sm">{r.order_code}</div>
                  <div className="text-white/80 text-sm">{r.customer_name} {r.customer_lastname || ""}</div>
                  <div className="text-white text-sm">Gs. {(r.total || 0).toLocaleString("es-PY")}</div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[r.status] || "text-white/60 bg-white/5 border-white/10"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex justify-end"><Btn variant="outline" onClick={() => setSelected(r)}>Ver</Btn></div>
                </div>
              ))}
              {rows.length === 0 && <div className="px-4 py-8 text-center text-white/40">Sin pedidos.</div>}
            </div>
          )}
        </Content>
        {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} onStatus={(s) => setStatus(selected, s)} />}
      </>
    );
  }

  function OrderDetail({ order, onClose, onStatus }) {
    const { client } = useAdmin();
    const [items, setItems] = useState([]);
    useEffect(() => {
      (async () => {
        const { data } = await client.from("order_items").select("*").eq("order_id", order.id);
        setItems(data || []);
      })();
    }, [client, order.id]);

    return (
      <Modal open wide onClose={onClose} title={`Pedido ${order.order_code}`}
        footer={<Btn variant="ghost" onClick={onClose}>Cerrar</Btn>}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-1">Cliente</div>
              <div className="text-white text-sm">{order.customer_name} {order.customer_lastname || ""}</div>
              <div className="text-white/60 text-xs">{order.customer_phone || "—"} · {order.customer_email || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-1">Envío</div>
              <div className="text-white text-sm">{order.delivery_method || "—"}</div>
              <div className="text-white/60 text-xs">{[order.address, order.city, order.reference].filter(Boolean).join(" · ") || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-1">Pago</div>
              <div className="text-white text-sm">{order.payment_method || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-1">Estado actual</div>
              <div className="flex flex-wrap gap-1.5">
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
                  <button key={s} onClick={() => onStatus(s)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${order.status === s ? "bg-[#1FE620] text-black border-[#1FE620]" : "text-white/60 bg-white/5 border-white/10 hover:border-white/30"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-2">Items</div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex items-center justify-between bg-[#0d0d0d] border border-white/5 rounded p-3 text-sm">
                  <div>
                    <div className="text-white">{it.product_name}</div>
                    <div className="text-white/40 text-xs">× {it.quantity} · Gs. {(it.unit_price || 0).toLocaleString("es-PY")}</div>
                  </div>
                  <div className="text-white font-bold">Gs. {(it.total || 0).toLocaleString("es-PY")}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span>Gs. {(order.subtotal || 0).toLocaleString("es-PY")}</span></div>
              <div className="flex justify-between text-white/60"><span>Envío</span><span>Gs. {(order.shipping_amount || 0).toLocaleString("es-PY")}</span></div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5"><span>Total</span><span>Gs. {(order.total || 0).toLocaleString("es-PY")}</span></div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ---------- FAQs ----------

  function Faqs() {
    const { client } = useAdmin();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
      setLoading(true);
      const { data } = await client.from("faqs").select("*").order("display_order", { ascending: true });
      setRows(data || []);
      setLoading(false);
    }, [client]);

    useEffect(() => { load(); }, [load]);

    const toggle = async (r) => { await client.from("faqs").update({ is_active: !r.is_active }).eq("id", r.id); load(); };
    const save = async (form) => {
      if (editing === "new") {
        const { error } = await client.from("faqs").insert(form);
        if (error) { alert(error.message); return; }
      } else {
        const { error } = await client.from("faqs").update(form).eq("id", editing.id);
        if (error) { alert(error.message); return; }
      }
      setEditing(null); load();
    };

    return (
      <>
        <PageHeader title="FAQs" subtitle={`${rows.length} preguntas`}
          actions={<Btn onClick={() => setEditing("new")}>+ Nueva FAQ</Btn>} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                  <div className="text-white/40 text-xs w-8">#{r.display_order}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm">{r.question}</div>
                    <div className="text-white/60 text-xs mt-1 line-clamp-2">{r.answer}</div>
                  </div>
                  <StatusPill active={r.is_active} />
                  <Btn variant="outline" onClick={() => setEditing(r)}>Editar</Btn>
                  <Btn variant="ghost" onClick={() => toggle(r)}>{r.is_active ? "Off" : "On"}</Btn>
                </div>
              ))}
            </div>
          )}
        </Content>
        {editing && <FaqEditor faq={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
      </>
    );
  }

  function FaqEditor({ faq, onClose, onSave }) {
    const isNew = !faq;
    const q = faq || {};
    const [f, setF] = useState({
      question: q.question || "",
      answer: q.answer || "",
      display_order: q.display_order != null ? q.display_order : 0,
      is_active: q.is_active !== false,
    });
    const set = (k, v) => setF(s => ({ ...s, [k]: v }));
    return (
      <Modal open onClose={onClose} title={isNew ? "Nueva FAQ" : "Editar FAQ"}
        footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={() => onSave({ ...f, display_order: Number(f.display_order) || 0 })}>Guardar</Btn></>}>
        <div className="space-y-4">
          <Field label="Pregunta"><TextInput value={f.question} onChange={v => set("question", v)} /></Field>
          <Field label="Respuesta"><TextArea value={f.answer} onChange={v => set("answer", v)} /></Field>
          <Field label="Orden"><TextInput type="number" value={f.display_order} onChange={v => set("display_order", v)} /></Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Activa
          </label>
        </div>
      </Modal>
    );
  }

  // ---------- Root ----------

  function Root() {
    const { client, session, adminProfile, checking, route, push } = useAdmin();

    // Hook siempre arriba — si la sesión es válida y la ruta es /admin/login, redirigir
    useEffect(() => {
      if (session && adminProfile && route === "login") push("/admin/dashboard");
    }, [session, adminProfile, route, push]);

    if (!client) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="font-display text-3xl mb-2">Supabase no configurado</div>
            <p className="text-white/60 text-sm mb-4">
              El panel admin necesita una <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> válidas.
            </p>
            <p className="text-white/40 text-xs">
              Editá <code>src/supabase-client.jsx</code> o definí <code>window.__PAPU_CONFIG__</code> antes de cargarlo.
            </p>
          </div>
        </div>
      );
    }

    if (checking) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
          <div className="text-white/50 text-sm uppercase tracking-[0.3em]">Verificando sesión...</div>
        </div>
      );
    }

    if (!session || !adminProfile) return <Login />;

    let Page = Dashboard;
    if (route === "productos") Page = Productos;
    else if (route === "categorias") Page = Categorias;
    else if (route === "pedidos") Page = Pedidos;
    else if (route === "faqs") Page = Faqs;

    return <Layout><Page /></Layout>;
  }

  function App() {
    return (
      <AdminProvider>
        <Root />
      </AdminProvider>
    );
  }

  return { App };
})();

window.AdminApp = AdminApp;
window.__ADMIN_JSX_DONE__ = true;
