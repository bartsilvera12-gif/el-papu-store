// Cliente Supabase para El Papu Store
// =====================================
// Cómo configurar las credenciales (sin .env porque es SPA estática):
//
//   1) Editá las constantes SUPABASE_URL y SUPABASE_ANON_KEY más abajo, o
//   2) Antes de cargar este script, definí window.__PAPU_CONFIG__ = {
//        SUPABASE_URL: "https://xxxx.supabase.co",
//        SUPABASE_ANON_KEY: "ey..."
//      }
//
// IMPORTANTE: solo pegues la ANON KEY (la pública). NUNCA la service_role.

const SUPABASE_URL = ""; // ej "https://xxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = ""; // anon key (pública)

const cfg = (window.__PAPU_CONFIG__ || {});
const URL_ = cfg.SUPABASE_URL || SUPABASE_URL;
const KEY_ = cfg.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const SCHEMA = "elpapustore";

let _client = null;

function isSupabaseConfigured() {
  return Boolean(URL_ && KEY_ && window.supabase && typeof window.supabase.createClient === "function");
}

function getSupabaseClient() {
  if (_client) return _client;
  if (!isSupabaseConfigured()) return null;
  _client = window.supabase.createClient(URL_, KEY_, {
    db: { schema: SCHEMA },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "papu.auth",
    },
  });
  return _client;
}

// Hook para que los componentes re-rendericen cuando store-api cargue datos
// desde Supabase y muten __PAPU_DATA__ in-place.
function usePapuData() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const handler = () => force(v => v + 1);
    window.addEventListener("papu:data-loaded", handler);
    return () => window.removeEventListener("papu:data-loaded", handler);
  }, []);
  return window.__PAPU_DATA__ || { PRODUCTS: [], CATEGORIAS: [], FAQS: [] };
}

Object.assign(window, {
  getSupabaseClient,
  isSupabaseConfigured,
  usePapuData,
  __PAPU_SUPABASE_SCHEMA__: SCHEMA,
});
