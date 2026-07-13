import seed from "@/data/divisiones.seed.json";

export interface Canton {
  codigo: string;
  nombre: string;
  slug: string;
}

export interface Provincia {
  codigo: string;
  nombre: string;
  slug: string;
  cantones: Canton[];
}

export const provincias: Provincia[] = seed.provincias;

export function getProvincia(slug: string): Provincia | undefined {
  return provincias.find((p) => p.slug === slug);
}

export function getCanton(
  provinciaSlug: string,
  cantonSlug: string
): { provincia: Provincia; canton: Canton } | undefined {
  const provincia = getProvincia(provinciaSlug);
  const canton = provincia?.cantones.find((c) => c.slug === cantonSlug);
  return provincia && canton ? { provincia, canton } : undefined;
}
