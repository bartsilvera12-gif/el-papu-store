// Cliente Supabase del backend (service_role)
// =====================================================================
// IMPORTANTE: NUNCA exportar este cliente al frontend. Tiene service_role
// que bypassa RLS. Solo se usa dentro del server Node.
// =====================================================================

import { createClient } from "@supabase/supabase-js";

const URL_ = process.env.SUPABASE_URL || "";
const KEY_ = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SCHEMA = process.env.SUPABASE_SCHEMA || "elpapustore";

let _client = null;

export function isConfigured() {
  return Boolean(URL_ && KEY_);
}

export function getClient() {
  if (_client) return _client;
  if (!isConfigured()) {
    throw new Error("Supabase backend no configurado: faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY");
  }
  _client = createClient(URL_, KEY_, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
