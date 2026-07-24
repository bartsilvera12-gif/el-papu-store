// Ejecuta contra Postgres el archivo SQL indicado, o una consulta de chequeo.
// Conexión por env var PGURL (no se hardcodea).
//
//   PGURL="postgresql://..." node scripts/db-run.mjs --check
//   PGURL="postgresql://..." node scripts/db-run.mjs sql/07-catalogo-productos.sql
// =====================================================================
import { readFileSync } from "node:fs";
import pg from "pg";

const PGURL = process.env.PGURL;
if (!PGURL) { console.error("[FATAL] Falta env PGURL"); process.exit(1); }

const arg = process.argv[2];
const client = new pg.Client({ connectionString: PGURL });

async function main() {
  await client.connect();
  if (!arg || arg === "--check") {
    const db = await client.query("select current_database() as db, current_user as usr");
    console.log("Conectado:", db.rows[0]);
    const cats = await client.query(
      "select name, slug, display_order from elpapustore.categories order by display_order"
    );
    console.log(`\nCategorías (${cats.rowCount}):`);
    for (const r of cats.rows) console.log(`  ${r.display_order}\t${r.slug}\t${r.name}`);
    const cnt = await client.query("select count(*)::int as n from elpapustore.products");
    console.log(`\nProductos actuales: ${cnt.rows[0].n}`);
  } else {
    const sql = readFileSync(arg, "utf-8");
    console.log(`Ejecutando ${arg} ...`);
    const res = await client.query(sql);
    const arr = Array.isArray(res) ? res : [res];
    for (const r of arr) {
      if (r.command && r.rowCount != null && !r.rows?.length) console.log(`  ${r.command} ${r.rowCount}`);
      if (r.rows?.length) console.table(r.rows);
    }
    console.log("OK.");
  }
  await client.end();
}
main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
