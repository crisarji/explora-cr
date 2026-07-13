import divisiones from "@/data/divisiones.json";

export interface Distrito {
  codigo: string;
  nombre: string;
  slug: string;
}

export interface Canton {
  codigo: string;
  nombre: string;
  slug: string;
  distritos: Distrito[];
}

export interface Provincia {
  codigo: string;
  nombre: string;
  slug: string;
  cantones: Canton[];
}

export const fuente: string = divisiones.fuente;

export const provincias: Provincia[] = divisiones.provincias;

export function getProvincia(slug: string): Provincia | undefined {
  return provincias.find((p) => p.slug === slug);
}

export function getProvinciaByCodigo(codigo: string): Provincia | undefined {
  return provincias.find((p) => p.codigo === codigo);
}

export function getCanton(
  provinciaSlug: string,
  cantonSlug: string
): { provincia: Provincia; canton: Canton } | undefined {
  const provincia = getProvincia(provinciaSlug);
  const canton = provincia?.cantones.find((c) => c.slug === cantonSlug);
  return provincia && canton ? { provincia, canton } : undefined;
}

/**
 * The cabecera (canton seat). By the official coding convention it is the
 * canton's district 01; divisiones.json carries no separate cabecera field.
 */
export function getCabecera(canton: Canton): Distrito | undefined {
  return (
    canton.distritos.find((d) => d.codigo.endsWith("01")) ?? canton.distritos[0]
  );
}

export function totalDistritos(provincia: Provincia): number {
  return provincia.cantones.reduce((n, c) => n + c.distritos.length, 0);
}

export const totales = {
  provincias: provincias.length,
  cantones: provincias.reduce((n, p) => n + p.cantones.length, 0),
  distritos: provincias.reduce((n, p) => n + totalDistritos(p), 0),
};

export function getDistrito(
  provinciaSlug: string,
  cantonSlug: string,
  distritoSlug: string
):
  | { provincia: Provincia; canton: Canton; distrito: Distrito }
  | undefined {
  const match = getCanton(provinciaSlug, cantonSlug);
  const distrito = match?.canton.distritos.find((d) => d.slug === distritoSlug);
  return match && distrito ? { ...match, distrito } : undefined;
}
