import facts from "@/data/facts/cantones.json";

export interface Fact {
  es: string;
  en: string;
}

/** Curated tidbit for a canton, if one exists (see data/facts/README.md). */
export function getFact(codigoCanton: string): Fact | undefined {
  return (facts as Record<string, Fact>)[codigoCanton];
}
