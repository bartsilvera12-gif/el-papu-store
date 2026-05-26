// Main app - El Papu Store
const { useState: useStateApp } = React;

// Captura errores globales para diagnosticar bugs de Babel/runtime sin abrir DevTools.
window.__PAPU_ERRORS__ = window.__PAPU_ERRORS__ || [];
window.addEventListener("error", (e) => {
  try {
    window.__PAPU_ERRORS__.push({
      msg: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack ? String(e.error.stack).split("\n").slice(0, 5).join("\n") : "",
    });
  } catch (_) {}
});

function Router() {
  const { route } = useShop();
  switch (route.name) {
    case "home":            return <HomePage />;
    case "catalogo":        return <CatalogoPage />;
    case "detalle":         return <DetallePage />;
    case "checkout":        return <CheckoutPage />;
    case "success":         return <SuccessPage />;
    case "sobre":           return <SobrePage />;
    case "faq":             return <FAQPage />;
    case "contacto":        return <ContactoPage />;
    case "politicas":       return <PoliticasPage />;
    case "pagopar-result":  return <PagoparResultPage />;
    default:                return <HomePage />;
  }
}

// Detecta la ruta inicial del SPA desde window.location.pathname para que el
// deep-linking funcione (entrar directo a /catalogo, refresh en /sobre, etc.).
(function detectInitialRoute() {
  const path = window.location.pathname || "/";

  const pg = path.match(/^\/pagopar\/resultado\/([^/?#]+)/);
  if (pg) {
    window.__PAPU_PG_HASH__ = decodeURIComponent(pg[1]);
    window.__PAPU_INITIAL_ROUTE__ = "pagopar-result";
    return;
  }

  const prod = path.match(/^\/producto\/([^/?#]+)/);
  if (prod) {
    window.__PAPU_INITIAL_ROUTE__ = "detalle";
    window.__PAPU_INITIAL_PARAMS__ = { id: decodeURIComponent(prod[1]) };
    return;
  }

  const simple = {
    "/": "home",
    "/catalogo": "catalogo",
    "/checkout": "checkout",
    "/success": "success",
    "/sobre": "sobre",
    "/faq": "faq",
    "/contacto": "contacto",
    "/politicas": "politicas",
  };
  if (simple[path]) window.__PAPU_INITIAL_ROUTE__ = simple[path];
})();

function ToastHost() {
  const { toast } = useShop();
  return <Toast show={toast.show} message={toast.message} />;
}

function PublicApp() {
  return (
    <ShopProvider>
      <div className="bg-[#050505] text-white min-h-screen">
        <Navbar />
        <Router />
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <ToastHost />
        {/* Floating WA */}
        <a href="#" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center ring-2 ring-[#1FE620] shadow-[0_0_30px_rgba(31,230,32,0.5)] hover:scale-105 hover:shadow-[0_0_40px_rgba(31,230,32,0.75)] transition-all animate-float">
          <Icon name="whatsapp" className="w-7 h-7" />
        </a>
      </div>
    </ShopProvider>
  );
}

// Montar admin o público según la ruta. El admin NO aparece en el sitio público;
// solo se accede entrando directamente por URL /admin/* (con vercel.json sirviendo
// el index.html para esas rutas).
function App() {
  const path = window.location.pathname || "/";
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  // Babel standalone compila los scripts <script type="text/babel"> de forma
  // asíncrona, por lo que window.AdminApp puede no existir cuando esto corre.
  // Reintentamos cada 50ms hasta encontrarlo (o ~3s timeout).
  const [adminReady, setAdminReady] = useStateApp(Boolean(window.AdminApp && window.AdminApp.App));
  const [showError, setShowError] = useStateApp(false);

  React.useEffect(() => {
    if (!isAdmin || adminReady) return;
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      if (window.AdminApp && window.AdminApp.App) { setAdminReady(true); clearInterval(t); }
      else if (tries > 60) { clearInterval(t); setShowError(true); } // ~3s
    }, 50);
    return () => clearInterval(t);
  }, [isAdmin, adminReady]);

  if (isAdmin) {
    if (adminReady && window.AdminApp && window.AdminApp.App) {
      const AdminRoot = window.AdminApp.App;
      return <AdminRoot />;
    }
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {!showError ? (
            <div className="text-white/40 text-sm uppercase tracking-[0.3em]">Cargando admin...</div>
          ) : (
            <div className="text-left">
              <div className="font-display text-3xl mb-3 text-red-400 text-center">Error cargando admin</div>
              <p className="text-white/60 text-sm mb-3 text-center">
                El script <code>/src/admin.jsx</code> no se montó.
              </p>
              <p className="text-white/40 text-xs font-mono text-center mb-3">
                AdminApp={String(typeof window.AdminApp)} · loaded={String(Boolean(window.__ADMIN_JSX_LOADED__))} · done={String(Boolean(window.__ADMIN_JSX_DONE__))}
              </p>
              <div className="bg-black/50 border border-red-500/30 rounded p-3 text-[11px] font-mono text-red-300 max-h-72 overflow-auto">
                {window.__PAPU_ERRORS__ && window.__PAPU_ERRORS__.length > 0 ? (
                  window.__PAPU_ERRORS__.map((er, i) => (
                    <div key={i} className="mb-2 pb-2 border-b border-red-500/10">
                      <div className="text-red-400 font-bold">{er.msg}</div>
                      <div className="text-white/40">{er.filename}:{er.lineno}:{er.colno}</div>
                      {er.stack && <pre className="text-white/30 whitespace-pre-wrap">{er.stack}</pre>}
                    </div>
                  ))
                ) : (
                  <div className="text-white/40">No se capturaron errores globales. Mirá DevTools → Console.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return <PublicApp />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
