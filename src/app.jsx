// Main app - El Papu Store
const { useState: useStateApp } = React;

function Router() {
  const { route } = useShop();
  switch (route.name) {
    case "home":      return <HomePage />;
    case "catalogo":  return <CatalogoPage />;
    case "detalle":   return <DetallePage />;
    case "checkout":  return <CheckoutPage />;
    case "success":   return <SuccessPage />;
    case "sobre":     return <SobrePage />;
    case "faq":       return <FAQPage />;
    case "contacto":  return <ContactoPage />;
    case "politicas": return <PoliticasPage />;
    default:          return <HomePage />;
  }
}

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
  if (isAdmin && window.AdminApp && window.AdminApp.App) {
    const AdminRoot = window.AdminApp.App;
    return <AdminRoot />;
  }
  return <PublicApp />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
