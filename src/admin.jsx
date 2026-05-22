// Admin Panel — El Papu Store
// =============================
// Privado. Se monta cuando window.location.pathname empieza con /admin.

window.__ADMIN_JSX_LOADED__ = true;

var AdminApp = (function () {
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useCallback = React.useCallback;
  var createContext = React.createContext;
  var useContext = React.useContext;

  // ---------- Mini-router por path ----------

  function getAdminRoute() {
    var p = window.location.pathname.replace(/\/+$/, "");
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

  var AdminCtx = createContext(null);
  function useAdmin() { return useContext(AdminCtx); }

  function AdminProvider(props) {
    var routeState = useState(getAdminRoute());
    var route = routeState[0];
    var setRoute = routeState[1];

    var sessionState = useState(null);
    var session = sessionState[0];
    var setSession = sessionState[1];

    var profileState = useState(null);
    var adminProfile = profileState[0];
    var setAdminProfile = profileState[1];

    var checkingState = useState(true);
    var checking = checkingState[0];
    var setChecking = checkingState[1];

    var errorState = useState("");
    var authError = errorState[0];
    var setAuthError = errorState[1];

    useEffect(function () {
      function onPop() { setRoute(getAdminRoute()); }
      window.addEventListener("popstate", onPop);
      return function () { window.removeEventListener("popstate", onPop); };
    }, []);

    var client = window.getSupabaseClient ? window.getSupabaseClient() : null;

    function validateAdmin(s) {
      setChecking(true);
      return client
        .from("admin_users")
        .select("id, email, full_name, role, is_active, auth_user_id")
        .eq("auth_user_id", s.user.id)
        .eq("is_active", true)
        .maybeSingle()
        .then(function (res) {
          if (res.error) throw res.error;
          if (!res.data) {
            return client.auth.signOut().then(function () {
              setAdminProfile(null);
              setAuthError("Tu usuario no tiene permisos de administrador.");
            });
          } else {
            setAdminProfile(res.data);
            setAuthError("");
          }
        })
        .catch(function (err) {
          setAdminProfile(null);
          setAuthError((err && err.message) || "Error validando admin.");
        })
        .then(function () { setChecking(false); });
    }

    useEffect(function () {
      if (!client) { setChecking(false); return; }
      var cancelled = false;
      client.auth.getSession().then(function (res) {
        if (cancelled) return;
        var s = res.data && res.data.session;
        setSession(s);
        if (s) validateAdmin(s);
        else setChecking(false);
      });
      var subRes = client.auth.onAuthStateChange(function (_event, s) {
        if (cancelled) return;
        setSession(s);
        if (s) validateAdmin(s);
        else { setAdminProfile(null); setChecking(false); }
      });
      return function () {
        cancelled = true;
        if (subRes && subRes.data && subRes.data.subscription) subRes.data.subscription.unsubscribe();
      };
    }, []);

    function login(email, password) {
      if (!client) return Promise.resolve({ error: "Supabase no configurado." });
      setAuthError("");
      return client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
        if (res.error) { setAuthError(res.error.message); return { error: res.error.message }; }
        return { ok: true };
      });
    }

    function logout() {
      if (!client) return;
      client.auth.signOut().then(function () {
        setAdminProfile(null);
        pushAdmin("/admin/login");
      });
    }

    var ctxValue = {
      client: client, route: route, setRoute: setRoute,
      session: session, adminProfile: adminProfile, checking: checking,
      authError: authError, login: login, logout: logout, push: pushAdmin,
    };

    return React.createElement(AdminCtx.Provider, { value: ctxValue }, props.children);
  }

  // ---------- UI primitives ----------

  function Field(props) {
    return (
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-1.5 block">{props.label}</span>
        {props.children}
        {props.hint ? <span className="text-[10px] text-white/30 mt-1 block">{props.hint}</span> : null}
      </label>
    );
  }

  function TextInput(props) {
    var type = props.type || "text";
    var val = props.value == null ? "" : props.value;
    return (
      <input
        type={type}
        value={val}
        placeholder={props.placeholder || ""}
        onChange={function (e) { props.onChange(e.target.value); }}
        className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/30 transition"
      />
    );
  }

  function TextArea(props) {
    var val = props.value == null ? "" : props.value;
    return (
      <textarea
        value={val}
        rows={props.rows || 4}
        placeholder={props.placeholder || ""}
        onChange={function (e) { props.onChange(e.target.value); }}
        className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-3 py-2.5 text-white text-sm placeholder:text-white/30 transition resize-y"
      />
    );
  }

  function Btn(props) {
    var variant = props.variant || "primary";
    var styles = {
      primary: "bg-[#1FE620] text-black hover:shadow-[0_0_20px_rgba(31,230,32,0.5)]",
      outline: "border border-[#1FE620]/40 text-[#1FE620] hover:bg-[#1FE620]/10",
      ghost: "text-white/70 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30",
    };
    var cls = "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed " + styles[variant] + " " + (props.className || "");
    return (
      <button type={props.type || "button"} onClick={props.onClick} disabled={props.disabled} className={cls}>
        {props.children}
      </button>
    );
  }

  function StatusPill(props) {
    var active = props.active;
    var cls = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider " + (active ? "bg-[#1FE620]/15 text-[#1FE620] border border-[#1FE620]/30" : "bg-white/5 text-white/50 border border-white/10");
    return (
      <span className={cls}>
        <span className={"w-1.5 h-1.5 rounded-full " + (active ? "bg-[#1FE620]" : "bg-white/30")}></span>
        {active ? "Activo" : "Inactivo"}
      </span>
    );
  }

  function Modal(props) {
    if (!props.open) return null;
    var widthCls = props.wide ? "max-w-4xl" : "max-w-lg";
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={props.onClose}></div>
        <div className={"relative bg-[#0a0a0a] border border-[#1FE620]/30 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] w-full max-h-[90vh] flex flex-col " + widthCls}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="font-display text-2xl text-white">{props.title}</div>
            <button onClick={props.onClose} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">✕</button>
          </div>
          <div className="px-5 py-5 overflow-y-auto">{props.children}</div>
          {props.footer ? <div className="px-5 py-4 border-t border-white/5 flex justify-end gap-2">{props.footer}</div> : null}
        </div>
      </div>
    );
  }

  // ---------- Login ----------

  function Login() {
    var ctx = useAdmin();
    var emailState = useState("");
    var email = emailState[0];
    var setEmail = emailState[1];
    var passState = useState("");
    var pass = passState[0];
    var setPass = passState[1];
    var submittingState = useState(false);
    var submitting = submittingState[0];
    var setSubmitting = submittingState[1];

    useEffect(function () {
      if (!ctx.checking && ctx.session && ctx.adminProfile) ctx.push("/admin/dashboard");
    }, [ctx.checking, ctx.session, ctx.adminProfile]);

    function onSubmit(e) {
      e.preventDefault();
      setSubmitting(true);
      ctx.login(email, pass).then(function () { setSubmitting(false); });
    }

    var supaOk = window.isSupabaseConfigured && window.isSupabaseConfigured();

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
              <TextInput type="password" value={pass} onChange={setPass} placeholder="password" />
            </Field>
            {ctx.authError ? <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{ctx.authError}</div> : null}
            <Btn type="submit" disabled={submitting || !email || !pass} className="w-full">
              {submitting ? "Ingresando..." : "Ingresar"}
            </Btn>
            {!supaOk ? (
              <div className="text-[10px] text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                Supabase no está configurado todavía. Definí URL/anon key en <code>src/supabase-client.jsx</code> o <code>window.__PAPU_CONFIG__</code>.
              </div>
            ) : null}
          </form>
        </div>
      </div>
    );
  }

  // ---------- Layout (sidebar) ----------

  function Layout(props) {
    var ctx = useAdmin();
    var nav = [
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
            {nav.map(function (n) {
              var isActive = ctx.route === n.id;
              var cls = "w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition " + (isActive ? "bg-[#1FE620]/10 text-[#1FE620] border border-[#1FE620]/30" : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent");
              return (
                <button key={n.id} onClick={function () { ctx.push(n.path); }} className={cls}>
                  <span>{n.icon}</span> {n.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/5">
            <div className="px-3 py-2 text-xs">
              <div className="text-white/40">Sesión</div>
              <div className="text-white truncate">{(ctx.adminProfile && ctx.adminProfile.email) || "—"}</div>
            </div>
            <Btn variant="ghost" onClick={ctx.logout} className="w-full">Cerrar sesión</Btn>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{props.children}</main>
      </div>
    );
  }

  function PageHeader(props) {
    return (
      <div className="flex items-end justify-between flex-wrap gap-3 px-6 sm:px-8 py-6 border-b border-white/5">
        <div>
          <div className="text-[#1FE620] text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Admin</div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">{props.title}</h1>
          {props.subtitle ? <p className="text-white/50 text-sm mt-1">{props.subtitle}</p> : null}
        </div>
        {props.actions ? <div className="flex items-center gap-2">{props.actions}</div> : null}
      </div>
    );
  }

  function Content(props) {
    return <div className="px-6 sm:px-8 py-6">{props.children}</div>;
  }

  // ---------- Dashboard ----------

  function Dashboard() {
    var ctx = useAdmin();
    var client = ctx.client;
    var statsState = useState({ totalProducts: 0, activeProducts: 0, pendingOrders: 0, totalOrders: 0 });
    var stats = statsState[0];
    var setStats = statsState[1];
    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];

    useEffect(function () {
      var cancel = false;
      Promise.all([
        client.from("products").select("*", { count: "exact", head: true }),
        client.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        client.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        client.from("orders").select("*", { count: "exact", head: true }),
      ]).then(function (results) {
        if (cancel) return;
        setStats({
          totalProducts: results[0].count || 0,
          activeProducts: results[1].count || 0,
          pendingOrders: results[2].count || 0,
          totalOrders: results[3].count || 0,
        });
      }).then(function () { if (!cancel) setLoading(false); }, function () { if (!cancel) setLoading(false); });
      return function () { cancel = true; };
    }, [client]);

    var cards = [
      { l: "Total productos", v: stats.totalProducts },
      { l: "Productos activos", v: stats.activeProducts },
      { l: "Pedidos pendientes", v: stats.pendingOrders, accent: true },
      { l: "Total pedidos", v: stats.totalOrders },
    ];

    return (
      <React.Fragment>
        <PageHeader title="Dashboard" subtitle="Resumen de la tienda" />
        <Content>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map(function (c) {
              var border = c.accent ? "border-[#1FE620]/40" : "border-white/5";
              var num = c.accent ? "text-[#1FE620]" : "text-white";
              return (
                <div key={c.l} className={"bg-[#0a0a0a] border rounded-xl p-5 " + border}>
                  <div className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold">{c.l}</div>
                  <div className={"font-display text-4xl mt-2 " + num}>{loading ? "…" : c.v}</div>
                </div>
              );
            })}
          </div>
        </Content>
      </React.Fragment>
    );
  }

  // ---------- Productos ----------

  function Productos() {
    var ctx = useAdmin();
    var client = ctx.client;
    var rowsState = useState([]);
    var rows = rowsState[0];
    var setRows = rowsState[1];
    var catsState = useState([]);
    var cats = catsState[0];
    var setCats = catsState[1];
    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];
    var editingState = useState(null);
    var editing = editingState[0];
    var setEditing = editingState[1];
    var queryState = useState("");
    var query = queryState[0];
    var setQuery = queryState[1];

    function load() {
      setLoading(true);
      return Promise.all([
        client.from("products").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        client.from("categories").select("id, name, slug, is_active").order("display_order", { ascending: true }),
      ]).then(function (results) {
        setRows(results[0].data || []);
        setCats(results[1].data || []);
        setLoading(false);
      });
    }

    useEffect(function () { load(); }, [client]);

    function toggleActive(row) {
      client.from("products").update({ is_active: !row.is_active }).eq("id", row.id).then(load);
    }
    function save(form) {
      var payload = Object.assign({}, form);
      if (typeof payload.features === "string") {
        payload.features = payload.features.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      }
      var p;
      if (editing === "new") p = client.from("products").insert(payload);
      else if (editing && editing.id) p = client.from("products").update(payload).eq("id", editing.id);
      else return;
      p.then(function (res) {
        if (res.error) { alert(res.error.message); return; }
        setEditing(null);
        load();
      });
    }

    var filtered = rows.filter(function (r) {
      if (!query) return true;
      var q = query.toLowerCase();
      return r.name.toLowerCase().indexOf(q) !== -1 || (r.sku || "").toLowerCase().indexOf(q) !== -1;
    });

    return (
      <React.Fragment>
        <PageHeader title="Productos" subtitle={rows.length + " en catálogo"}
          actions={<Btn onClick={function () { setEditing("new"); }}>+ Nuevo producto</Btn>} />
        <Content>
          <div className="mb-4">
            <TextInput value={query} onChange={setQuery} placeholder="Buscar por nombre o SKU..." />
          </div>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_100px_100px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Producto</div><div>Precio</div><div>Stock</div><div>Estado</div><div className="text-right">Acciones</div>
              </div>
              {filtered.map(function (r) {
                return (
                  <div key={r.id} className="grid grid-cols-[1fr_120px_100px_100px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      {r.image_url ? <img src={r.image_url} alt="" className="w-10 h-10 rounded object-cover" /> : null}
                      <div className="min-w-0">
                        <div className="text-white text-sm font-bold truncate">{r.name}</div>
                        <div className="text-white/40 text-xs">{r.sku || r.slug}</div>
                      </div>
                    </div>
                    <div className="text-white text-sm">Gs. {(r.price || 0).toLocaleString("es-PY")}</div>
                    <div className="text-white text-sm">{r.stock || 0}</div>
                    <div><StatusPill active={r.is_active} /></div>
                    <div className="flex justify-end gap-1">
                      <Btn variant="outline" onClick={function () { setEditing(r); }}>Editar</Btn>
                      <Btn variant="ghost" onClick={function () { toggleActive(r); }}>{r.is_active ? "Off" : "On"}</Btn>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 ? <div className="px-4 py-8 text-center text-white/40">Sin resultados.</div> : null}
            </div>
          )}
        </Content>
        {editing ? <ProductEditor product={editing === "new" ? null : editing} cats={cats} onClose={function () { setEditing(null); }} onSave={save} /> : null}
      </React.Fragment>
    );
  }

  function ProductEditor(props) {
    var p = props.product || {};
    var cats = props.cats || [];
    var firstCat = cats[0] || {};
    var isNew = !props.product;
    var fState = useState({
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
    var f = fState[0];
    var setF = fState[1];
    function set(k, v) { setF(Object.assign({}, f, (function () { var o = {}; o[k] = v; return o; })())); }
    function submit() {
      var payload = Object.assign({}, f, {
        price: Number(f.price) || 0,
        compare_at_price: f.compare_at_price === "" ? null : (Number(f.compare_at_price) || null),
        stock: Number(f.stock) || 0,
        display_order: Number(f.display_order) || 0,
        category_id: f.category_id || null,
        badge: f.badge || null,
      });
      props.onSave(payload);
    }

    var footer = (
      <React.Fragment>
        <Btn variant="ghost" onClick={props.onClose}>Cancelar</Btn>
        <Btn onClick={submit}>Guardar</Btn>
      </React.Fragment>
    );

    return (
      <Modal open={true} wide={true} onClose={props.onClose} title={isNew ? "Nuevo producto" : "Editar producto"} footer={footer}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre"><TextInput value={f.name} onChange={function (v) { set("name", v); }} /></Field>
          <Field label="Slug" hint="único, sin espacios"><TextInput value={f.slug} onChange={function (v) { set("slug", v); }} /></Field>
          <Field label="SKU"><TextInput value={f.sku} onChange={function (v) { set("sku", v); }} /></Field>
          <Field label="Categoría">
            <select value={f.category_id || ""} onChange={function (e) { set("category_id", e.target.value); }}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-white text-sm">
              <option value="">— Sin categoría —</option>
              {cats.map(function (c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
            </select>
          </Field>
          <Field label="Precio (Gs.)"><TextInput type="number" value={f.price} onChange={function (v) { set("price", v); }} /></Field>
          <Field label="Precio anterior (opcional)"><TextInput type="number" value={f.compare_at_price} onChange={function (v) { set("compare_at_price", v); }} /></Field>
          <Field label="Stock"><TextInput type="number" value={f.stock} onChange={function (v) { set("stock", v); }} /></Field>
          <Field label="Badge" hint="viral | oferta | nuevo | top">
            <select value={f.badge || ""} onChange={function (e) { set("badge", e.target.value); }}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-white text-sm">
              <option value="">— ninguno —</option>
              <option value="viral">viral</option>
              <option value="oferta">oferta</option>
              <option value="nuevo">nuevo</option>
              <option value="top">top</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="URL de imagen principal"><TextInput value={f.image_url} onChange={function (v) { set("image_url", v); }} placeholder="https://..." /></Field>
          </div>
          <Field label="Color (gradiente Tailwind)"><TextInput value={f.color} onChange={function (v) { set("color", v); }} placeholder="from-emerald-500/20 to-black" /></Field>
          <Field label="Orden"><TextInput type="number" value={f.display_order} onChange={function (v) { set("display_order", v); }} /></Field>
          <div className="sm:col-span-2">
            <Field label="Descripción corta"><TextArea rows={2} value={f.short_description} onChange={function (v) { set("short_description", v); }} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descripción"><TextArea value={f.description} onChange={function (v) { set("description", v); }} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Características (una por línea)"><TextArea value={f.features} onChange={function (v) { set("features", v); }} /></Field>
          </div>
          <div className="sm:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={f.is_active} onChange={function (e) { set("is_active", e.target.checked); }} /> Activo
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={f.is_featured} onChange={function (e) { set("is_featured", e.target.checked); }} /> Destacado
            </label>
          </div>
        </div>
      </Modal>
    );
  }

  // ---------- Categorías ----------

  function Categorias() {
    var ctx = useAdmin();
    var client = ctx.client;
    var rowsState = useState([]);
    var rows = rowsState[0];
    var setRows = rowsState[1];
    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];
    var editingState = useState(null);
    var editing = editingState[0];
    var setEditing = editingState[1];

    function load() {
      setLoading(true);
      return client.from("categories").select("*").order("display_order", { ascending: true }).then(function (res) {
        setRows(res.data || []);
        setLoading(false);
      });
    }
    useEffect(function () { load(); }, [client]);

    function toggle(row) {
      client.from("categories").update({ is_active: !row.is_active }).eq("id", row.id).then(load);
    }
    function save(form) {
      var p;
      if (editing === "new") p = client.from("categories").insert(form);
      else p = client.from("categories").update(form).eq("id", editing.id);
      p.then(function (res) {
        if (res.error) { alert(res.error.message); return; }
        setEditing(null); load();
      });
    }

    return (
      <React.Fragment>
        <PageHeader title="Categorías" subtitle={rows.length + " en total"}
          actions={<Btn onClick={function () { setEditing("new"); }}>+ Nueva categoría</Btn>} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr_100px_100px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Icon</div><div>Nombre</div><div>Slug</div><div>Orden</div><div>Estado</div><div className="text-right">Acciones</div>
              </div>
              {rows.map(function (r) {
                return (
                  <div key={r.id} className="grid grid-cols-[60px_1fr_1fr_100px_100px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0">
                    <div className="text-2xl">{r.icon}</div>
                    <div className="text-white font-bold text-sm">{r.name}</div>
                    <div className="text-white/50 text-xs">{r.slug}</div>
                    <div className="text-white/70 text-sm">{r.display_order}</div>
                    <div><StatusPill active={r.is_active} /></div>
                    <div className="flex justify-end gap-1">
                      <Btn variant="outline" onClick={function () { setEditing(r); }}>Editar</Btn>
                      <Btn variant="ghost" onClick={function () { toggle(r); }}>{r.is_active ? "Off" : "On"}</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Content>
        {editing ? <CategoryEditor cat={editing === "new" ? null : editing} onClose={function () { setEditing(null); }} onSave={save} /> : null}
      </React.Fragment>
    );
  }

  function CategoryEditor(props) {
    var c = props.cat || {};
    var isNew = !props.cat;
    var fState = useState({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      icon: c.icon || "🏷️",
      display_order: c.display_order != null ? c.display_order : 0,
      is_active: c.is_active !== false,
    });
    var f = fState[0];
    var setF = fState[1];
    function set(k, v) { var o = {}; o[k] = v; setF(Object.assign({}, f, o)); }
    function submit() { props.onSave(Object.assign({}, f, { display_order: Number(f.display_order) || 0 })); }
    var footer = (
      <React.Fragment>
        <Btn variant="ghost" onClick={props.onClose}>Cancelar</Btn>
        <Btn onClick={submit}>Guardar</Btn>
      </React.Fragment>
    );
    return (
      <Modal open={true} onClose={props.onClose} title={isNew ? "Nueva categoría" : "Editar categoría"} footer={footer}>
        <div className="space-y-4">
          <Field label="Nombre"><TextInput value={f.name} onChange={function (v) { set("name", v); }} /></Field>
          <Field label="Slug"><TextInput value={f.slug} onChange={function (v) { set("slug", v); }} /></Field>
          <Field label="Icono (emoji)"><TextInput value={f.icon} onChange={function (v) { set("icon", v); }} /></Field>
          <Field label="Descripción"><TextArea rows={2} value={f.description} onChange={function (v) { set("description", v); }} /></Field>
          <Field label="Orden"><TextInput type="number" value={f.display_order} onChange={function (v) { set("display_order", v); }} /></Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.is_active} onChange={function (e) { set("is_active", e.target.checked); }} /> Activa
          </label>
        </div>
      </Modal>
    );
  }

  // ---------- Pedidos ----------

  function Pedidos() {
    var ctx = useAdmin();
    var client = ctx.client;
    var rowsState = useState([]);
    var rows = rowsState[0];
    var setRows = rowsState[1];
    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];
    var selectedState = useState(null);
    var selected = selectedState[0];
    var setSelected = selectedState[1];

    function load() {
      setLoading(true);
      return client.from("orders").select("*").order("created_at", { ascending: false }).then(function (res) {
        setRows(res.data || []);
        setLoading(false);
      });
    }
    useEffect(function () { load(); }, [client]);

    function setStatus(row, status) {
      client.from("orders").update({ status: status }).eq("id", row.id).then(function () {
        load();
        if (selected && selected.id === row.id) setSelected(Object.assign({}, selected, { status: status }));
      });
    }

    var statusColors = {
      pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      confirmed: "text-[#1FE620] bg-[#1FE620]/10 border-[#1FE620]/30",
      shipped: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      delivered: "text-[#1FE620] bg-[#1FE620]/15 border-[#1FE620]/40",
      cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
    };

    return (
      <React.Fragment>
        <PageHeader title="Pedidos" subtitle={rows.length + " pedidos"} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_120px_140px_120px] text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 py-3 border-b border-white/5">
                <div>Código</div><div>Cliente</div><div>Total</div><div>Estado</div><div className="text-right">Detalle</div>
              </div>
              {rows.map(function (r) {
                var statusCls = "inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border " + (statusColors[r.status] || "text-white/60 bg-white/5 border-white/10");
                return (
                  <div key={r.id} className="grid grid-cols-[1fr_1fr_120px_140px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0">
                    <div className="text-white font-bold text-sm">{r.order_code}</div>
                    <div className="text-white/80 text-sm">{r.customer_name} {r.customer_lastname || ""}</div>
                    <div className="text-white text-sm">Gs. {(r.total || 0).toLocaleString("es-PY")}</div>
                    <div><span className={statusCls}>{r.status}</span></div>
                    <div className="flex justify-end"><Btn variant="outline" onClick={function () { setSelected(r); }}>Ver</Btn></div>
                  </div>
                );
              })}
              {rows.length === 0 ? <div className="px-4 py-8 text-center text-white/40">Sin pedidos.</div> : null}
            </div>
          )}
        </Content>
        {selected ? <OrderDetail order={selected} onClose={function () { setSelected(null); }} onStatus={function (s) { setStatus(selected, s); }} /> : null}
      </React.Fragment>
    );
  }

  function OrderDetail(props) {
    var ctx = useAdmin();
    var client = ctx.client;
    var order = props.order;
    var itemsState = useState([]);
    var items = itemsState[0];
    var setItems = itemsState[1];

    useEffect(function () {
      client.from("order_items").select("*").eq("order_id", order.id).then(function (res) {
        setItems(res.data || []);
      });
    }, [client, order.id]);

    var footer = <Btn variant="ghost" onClick={props.onClose}>Cerrar</Btn>;

    return (
      <Modal open={true} wide={true} onClose={props.onClose} title={"Pedido " + order.order_code} footer={footer}>
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
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(function (s) {
                  var btnCls = "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border " + (order.status === s ? "bg-[#1FE620] text-black border-[#1FE620]" : "text-white/60 bg-white/5 border-white/10 hover:border-white/30");
                  return <button key={s} onClick={function () { props.onStatus(s); }} className={btnCls}>{s}</button>;
                })}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-2">Items</div>
            <div className="space-y-2">
              {items.map(function (it) {
                return (
                  <div key={it.id} className="flex items-center justify-between bg-[#0d0d0d] border border-white/5 rounded p-3 text-sm">
                    <div>
                      <div className="text-white">{it.product_name}</div>
                      <div className="text-white/40 text-xs">× {it.quantity} · Gs. {(it.unit_price || 0).toLocaleString("es-PY")}</div>
                    </div>
                    <div className="text-white font-bold">Gs. {(it.total || 0).toLocaleString("es-PY")}</div>
                  </div>
                );
              })}
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
    var ctx = useAdmin();
    var client = ctx.client;
    var rowsState = useState([]);
    var rows = rowsState[0];
    var setRows = rowsState[1];
    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];
    var editingState = useState(null);
    var editing = editingState[0];
    var setEditing = editingState[1];

    function load() {
      setLoading(true);
      return client.from("faqs").select("*").order("display_order", { ascending: true }).then(function (res) {
        setRows(res.data || []);
        setLoading(false);
      });
    }
    useEffect(function () { load(); }, [client]);

    function toggle(r) {
      client.from("faqs").update({ is_active: !r.is_active }).eq("id", r.id).then(load);
    }
    function save(form) {
      var p;
      if (editing === "new") p = client.from("faqs").insert(form);
      else p = client.from("faqs").update(form).eq("id", editing.id);
      p.then(function (res) {
        if (res.error) { alert(res.error.message); return; }
        setEditing(null); load();
      });
    }

    return (
      <React.Fragment>
        <PageHeader title="FAQs" subtitle={rows.length + " preguntas"}
          actions={<Btn onClick={function () { setEditing("new"); }}>+ Nueva FAQ</Btn>} />
        <Content>
          {loading ? <div className="text-white/50">Cargando...</div> : (
            <div className="space-y-2">
              {rows.map(function (r) {
                return (
                  <div key={r.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                    <div className="text-white/40 text-xs w-8">#{r.display_order}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">{r.question}</div>
                      <div className="text-white/60 text-xs mt-1 line-clamp-2">{r.answer}</div>
                    </div>
                    <StatusPill active={r.is_active} />
                    <Btn variant="outline" onClick={function () { setEditing(r); }}>Editar</Btn>
                    <Btn variant="ghost" onClick={function () { toggle(r); }}>{r.is_active ? "Off" : "On"}</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </Content>
        {editing ? <FaqEditor faq={editing === "new" ? null : editing} onClose={function () { setEditing(null); }} onSave={save} /> : null}
      </React.Fragment>
    );
  }

  function FaqEditor(props) {
    var q = props.faq || {};
    var isNew = !props.faq;
    var fState = useState({
      question: q.question || "",
      answer: q.answer || "",
      display_order: q.display_order != null ? q.display_order : 0,
      is_active: q.is_active !== false,
    });
    var f = fState[0];
    var setF = fState[1];
    function set(k, v) { var o = {}; o[k] = v; setF(Object.assign({}, f, o)); }
    function submit() { props.onSave(Object.assign({}, f, { display_order: Number(f.display_order) || 0 })); }
    var footer = (
      <React.Fragment>
        <Btn variant="ghost" onClick={props.onClose}>Cancelar</Btn>
        <Btn onClick={submit}>Guardar</Btn>
      </React.Fragment>
    );
    return (
      <Modal open={true} onClose={props.onClose} title={isNew ? "Nueva FAQ" : "Editar FAQ"} footer={footer}>
        <div className="space-y-4">
          <Field label="Pregunta"><TextInput value={f.question} onChange={function (v) { set("question", v); }} /></Field>
          <Field label="Respuesta"><TextArea value={f.answer} onChange={function (v) { set("answer", v); }} /></Field>
          <Field label="Orden"><TextInput type="number" value={f.display_order} onChange={function (v) { set("display_order", v); }} /></Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.is_active} onChange={function (e) { set("is_active", e.target.checked); }} /> Activa
          </label>
        </div>
      </Modal>
    );
  }

  // ---------- Root ----------

  function Root() {
    var ctx = useAdmin();
    var client = ctx.client;
    var session = ctx.session;
    var adminProfile = ctx.adminProfile;
    var checking = ctx.checking;
    var route = ctx.route;
    var push = ctx.push;

    useEffect(function () {
      if (session && adminProfile && route === "login") push("/admin/dashboard");
    }, [session, adminProfile, route]);

    if (!client) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="font-display text-3xl mb-2">Supabase no configurado</div>
            <p className="text-white/60 text-sm mb-4">
              El panel admin necesita <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code>.
            </p>
            <p className="text-white/40 text-xs">
              Editá <code>src/supabase-client.jsx</code> o definí <code>window.__PAPU_CONFIG__</code>.
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

    var Page = Dashboard;
    if (route === "productos") Page = Productos;
    else if (route === "categorias") Page = Categorias;
    else if (route === "pedidos") Page = Pedidos;
    else if (route === "faqs") Page = Faqs;

    return <Layout><Page /></Layout>;
  }

  function App() {
    return <AdminProvider><Root /></AdminProvider>;
  }

  return { App: App };
})();

window.AdminApp = AdminApp;
window.__ADMIN_JSX_DONE__ = true;
