/**
 * Phase 1 data pipeline (see scripts/fetch-geo.md and PLAN.md §3).
 *
 * 1. Downloads official boundaries from the IGN SNIT WFS geoservice
 *    (layer IGN_5_CO:limitedistrital_5k) into data/geo/raw/ — cached,
 *    delete the file to force a re-download.
 * 2. Simplifies districts with mapshaper, then dissolves upward into
 *    cantones and provincias so the three layers share arcs exactly.
 * 3. Emits data/geo/costa-rica.topo.json (3 layers, target < 500 KB).
 * 4. Emits data/divisiones.json (full hierarchy) and data/slugs.json
 *    (flat search/lookup index) from the same source features.
 *
 * Run: npm run build:topo
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "geo", "raw");
const RAW_DISTRITOS = path.join(RAW_DIR, "distritos.raw.geojson");
const TOPO_OUT = path.join(ROOT, "data", "geo", "costa-rica.topo.json");
const DIVISIONES_OUT = path.join(ROOT, "data", "divisiones.json");
const SLUGS_OUT = path.join(ROOT, "data", "slugs.json");

const WFS_URL =
  "https://geos.snitcr.go.cr/be/IGN_5_CO/wfs?service=WFS&version=2.0.0" +
  "&request=GetFeature&typeNames=IGN_5_CO:limitedistrital_5k" +
  "&outputFormat=application/json&srsName=EPSG:4326";

const SIMPLIFY = "2.5%";

interface RawProps {
  CÓDIGO_DTA: number;
  DISTRITO: string;
  CÓDIGO_CANTÓN: number;
  CANTÓN: string;
  CÓDIGO_PROVINCIA: number;
  PROVINCIA: string;
  VERSIÓN: number;
}

function slugify(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function download(): Promise<void> {
  if (existsSync(RAW_DISTRITOS)) {
    console.log(`✓ raw data cached (${RAW_DISTRITOS})`);
    return;
  }
  mkdirSync(RAW_DIR, { recursive: true });
  console.log("Downloading district boundaries from IGN SNIT WFS…");
  const res = await fetch(WFS_URL);
  if (!res.ok) throw new Error(`WFS request failed: ${res.status}`);
  writeFileSync(RAW_DISTRITOS, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ downloaded ${(statSync(RAW_DISTRITOS).size / 1e6).toFixed(0)} MB`);
}

function buildTopo(): void {
  console.log(`Simplifying (${SIMPLIFY}) and dissolving with mapshaper…`);
  execFileSync(
    "npx",
    [
      "mapshaper",
      "-i", RAW_DISTRITOS, "name=distritos",
      "-simplify", SIMPLIFY, "keep-shapes",
      "-each",
      'codigo=String(this.properties["CÓDIGO_DTA"]), ' +
        'nombre=this.properties["DISTRITO"], ' +
        'codigoCanton=String(this.properties["CÓDIGO_CANTÓN"]), ' +
        'nombreCanton=this.properties["CANTÓN"], ' +
        'codigoProvincia=String(this.properties["CÓDIGO_PROVINCIA"]), ' +
        'nombreProvincia=this.properties["PROVINCIA"]',
      "-dissolve2", "fields=codigoCanton",
      "copy-fields=nombreCanton,codigoProvincia,nombreProvincia", "+", "name=cantones",
      "-dissolve2", "fields=codigoProvincia",
      "copy-fields=nombreProvincia", "+", "name=provincias", "target=cantones",
      "-rename-fields", "codigo=codigoCanton,nombre=nombreCanton", "target=cantones",
      "-rename-fields", "codigo=codigoProvincia,nombre=nombreProvincia", "target=provincias",
      "-filter-fields", "codigo,nombre,codigoProvincia", "target=cantones",
      "-filter-fields", "codigo,nombre,codigoCanton,codigoProvincia", "target=distritos",
      "-o", TOPO_OUT, "format=topojson", "target=provincias,cantones,distritos",
    ],
    { cwd: ROOT, stdio: "inherit" }
  );
  console.log(`✓ wrote ${TOPO_OUT} (${(statSync(TOPO_OUT).size / 1024).toFixed(0)} KB)`);
}

interface Distrito { codigo: string; nombre: string; slug: string }
interface Canton { codigo: string; nombre: string; slug: string; distritos: Distrito[] }
interface Provincia { codigo: string; nombre: string; slug: string; cantones: Canton[] }

function buildDivisiones(): void {
  console.log("Building divisiones.json and slugs.json…");
  const raw = JSON.parse(readFileSync(RAW_DISTRITOS, "utf8")) as {
    features: { properties: RawProps }[];
  };

  const provincias = new Map<string, Provincia>();
  const cantones = new Map<string, Canton>();
  let version = 0;

  for (const { properties: p } of raw.features) {
    version = Math.max(version, p["VERSIÓN"]);
    const provCodigo = String(p["CÓDIGO_PROVINCIA"]);
    let prov = provincias.get(provCodigo);
    if (!prov) {
      prov = { codigo: provCodigo, nombre: p.PROVINCIA, slug: slugify(p.PROVINCIA), cantones: [] };
      provincias.set(provCodigo, prov);
    }
    const cantCodigo = String(p["CÓDIGO_CANTÓN"]);
    let cant = cantones.get(cantCodigo);
    if (!cant) {
      cant = { codigo: cantCodigo, nombre: p["CANTÓN"], slug: slugify(p["CANTÓN"]), distritos: [] };
      cantones.set(cantCodigo, cant);
      prov.cantones.push(cant);
    }
    cant.distritos.push({
      codigo: String(p["CÓDIGO_DTA"]),
      nombre: p.DISTRITO,
      slug: slugify(p.DISTRITO),
    });
  }

  // Official DTA codes sort correctly as numbers; sort children for stable output.
  const byCodigo = (a: { codigo: string }, b: { codigo: string }) =>
    Number(a.codigo) - Number(b.codigo);
  const provList = [...provincias.values()].sort(byCodigo);
  for (const prov of provList) {
    prov.cantones.sort(byCodigo);
    for (const cant of prov.cantones) cant.distritos.sort(byCodigo);
  }

  // Slugs must be unique within their parent scope (they form the URL path).
  const assertUnique = (items: { slug: string }[], scope: string) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.slug)) throw new Error(`duplicate slug "${item.slug}" in ${scope}`);
      seen.add(item.slug);
    }
  };
  assertUnique(provList, "provincias");
  for (const prov of provList) {
    assertUnique(prov.cantones, `cantones of ${prov.nombre}`);
    for (const cant of prov.cantones) assertUnique(cant.distritos, `distritos of ${cant.nombre}`);
  }

  const divisiones = {
    fuente: `IGN SNIT WFS IGN_5_CO:limitedistrital_5k (versión ${version})`,
    generado: new Date().toISOString().slice(0, 10),
    provincias: provList,
  };
  writeFileSync(DIVISIONES_OUT, JSON.stringify(divisiones, null, 1) + "\n");
  console.log(`✓ wrote ${DIVISIONES_OUT}`);

  // Flat index: one row per region with its full URL path — feeds routing
  // lookups now and the Fuse.js search index in Phase 6.
  const slugs = provList.flatMap((prov) => [
    { tipo: "provincia", codigo: prov.codigo, nombre: prov.nombre, path: `/${prov.slug}` },
    ...prov.cantones.flatMap((cant) => [
      {
        tipo: "canton",
        codigo: cant.codigo,
        nombre: cant.nombre,
        path: `/${prov.slug}/${cant.slug}`,
      },
      ...cant.distritos.map((dist) => ({
        tipo: "distrito",
        codigo: dist.codigo,
        nombre: dist.nombre,
        path: `/${prov.slug}/${cant.slug}/${dist.slug}`,
      })),
    ]),
  ]);
  writeFileSync(SLUGS_OUT, JSON.stringify(slugs, null, 1) + "\n");
  console.log(`✓ wrote ${SLUGS_OUT} (${slugs.length} regions)`);

  const totalCantones = provList.reduce((n, p) => n + p.cantones.length, 0);
  const totalDistritos = provList.reduce(
    (n, p) => n + p.cantones.reduce((m, c) => m + c.distritos.length, 0),
    0
  );
  console.log(
    `Totals: ${provList.length} provincias / ${totalCantones} cantones / ${totalDistritos} distritos`
  );
}

await download();
buildTopo();
buildDivisiones();
