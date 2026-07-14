import { create } from "zustand";

/**
 * Client-side UI-string switching (ES default). Region names are proper
 * nouns and never translate; metadata stays Spanish. The stored language
 * is applied post-hydration (see Header) — server HTML is always Spanish,
 * so there is nothing to mismatch.
 */
export type Lang = "es" | "en";

const STRINGS = {
  es: {
    "nav.acerca": "Acerca",
    "nav.principal": "Principal",
    "nav.jugar": "Jugar",
    "juego.titulo": "¿Cuál es este cantón?",
    "juego.descripcion":
      "Pon a prueba cuánto conocés los 84 cantones de Costa Rica: 10 rondas, 4 opciones.",
    "juego.empezar": "Empezar",
    "juego.ronda": "Ronda {n} de {total}",
    "juego.puntaje": "Puntaje",
    "juego.pregunta": "¿Cuál es este cantón de {provincia}?",
    "juego.correcto": "¡Correcto!",
    "juego.incorrecto": "Incorrecto — era {nombre}.",
    "juego.siguiente": "Siguiente",
    "juego.verResultado": "Ver resultado",
    "juego.resultado": "Acertaste {score} de {total}",
    "juego.jugarDeNuevo": "Jugar de nuevo",
    "juego.mapaLabel": "Mapa con un cantón resaltado en rojo",
    "compartir.boton": "Compartir",
    "compartir.copiado": "Enlace copiado",
    "facto.titulo": "¿Sabías que…?",
    "footer.texto": "Proyecto de servicio social · datos abiertos",
    "home.intro":
      "Explora las divisiones territoriales del país. Haz clic en una provincia para acercarte.",
    "prov.intro": "Haz clic en un cantón para acercarte.",
    "canton.intro":
      "Cantón de {provincia}. Haz clic en un distrito para acercarte.",
    "distrito.intro": "Distrito del cantón de {canton}, {provincia}.",
    "distrito.introCabecera":
      "Distrito y cabecera del cantón de {canton}, {provincia}.",
    "stats.provincias": "Provincias",
    "stats.cantones": "Cantones",
    "stats.distritos": "Distritos",
    "stats.cabecera": "Cabecera",
    "stats.area": "Área aprox.",
    "stats.codigo": "Código",
    "list.provincias": "Provincias",
    "list.cantones": "Cantones",
    "list.distritos": "Distritos",
    "list.otrosDistritos": "Otros distritos de {canton}",
    "search.abrir": "Buscar",
    "search.titulo": "Buscar una región",
    "search.placeholder": "Provincia, cantón o distrito…",
    "search.vacio": "Sin resultados para “{query}”",
    "search.tipo.provincia": "provincia",
    "search.tipo.canton": "cantón",
    "search.tipo.distrito": "distrito",
    "breadcrumb.label": "Ruta de navegación",
    "lang.cambiar": "Switch to English",
    "tema.cambiar": "Cambiar tema (claro/oscuro)",
    "mapa.pais": "Mapa de las 7 provincias de Costa Rica",
    "mapa.provincia": "Mapa de la provincia de {nombre}",
    "mapa.canton": "Mapa del cantón {nombre}",
    "mapa.distrito": "Mapa del distrito {nombre}",
    "acerca.titulo": "Acerca de este proyecto",
    "acerca.p1":
      "Explora Costa Rica es un proyecto gratuito de servicio social: un mapa interactivo de las divisiones territoriales del país — 7 provincias, 84 cantones y sus distritos.",
    "acerca.p2":
      "Los límites geográficos provienen del Instituto Geográfico Nacional (servicio WFS oficial del SNIT). El código es abierto — ver el repositorio del proyecto para el detalle de fuentes y el plan de construcción.",
  },
  en: {
    "nav.acerca": "About",
    "nav.principal": "Main",
    "nav.jugar": "Play",
    "juego.titulo": "Which canton is this?",
    "juego.descripcion":
      "Test how well you know Costa Rica's 84 cantons: 10 rounds, 4 choices.",
    "juego.empezar": "Start",
    "juego.ronda": "Round {n} of {total}",
    "juego.puntaje": "Score",
    "juego.pregunta": "Which canton of {provincia} is this?",
    "juego.correcto": "Correct!",
    "juego.incorrecto": "Not quite — it was {nombre}.",
    "juego.siguiente": "Next",
    "juego.verResultado": "See result",
    "juego.resultado": "You got {score} out of {total}",
    "juego.jugarDeNuevo": "Play again",
    "juego.mapaLabel": "Map with one canton highlighted in red",
    "compartir.boton": "Share",
    "compartir.copiado": "Link copied",
    "facto.titulo": "Did you know…?",
    "footer.texto": "A free public-service project · open data",
    "home.intro":
      "Explore the country's territorial divisions. Click a province to zoom in.",
    "prov.intro": "Click a canton to zoom in.",
    "canton.intro": "Canton of {provincia}. Click a district to zoom in.",
    "distrito.intro": "District of the canton of {canton}, {provincia}.",
    "distrito.introCabecera":
      "District and seat of the canton of {canton}, {provincia}.",
    "stats.provincias": "Provinces",
    "stats.cantones": "Cantons",
    "stats.distritos": "Districts",
    "stats.cabecera": "Seat",
    "stats.area": "Approx. area",
    "stats.codigo": "Code",
    "list.provincias": "Provinces",
    "list.cantones": "Cantons",
    "list.distritos": "Districts",
    "list.otrosDistritos": "Other districts of {canton}",
    "search.abrir": "Search",
    "search.titulo": "Search for a region",
    "search.placeholder": "Province, canton or district…",
    "search.vacio": "No results for “{query}”",
    "search.tipo.provincia": "province",
    "search.tipo.canton": "canton",
    "search.tipo.distrito": "district",
    "breadcrumb.label": "Breadcrumb",
    "lang.cambiar": "Cambiar a español",
    "tema.cambiar": "Toggle theme (light/dark)",
    "mapa.pais": "Map of Costa Rica's 7 provinces",
    "mapa.provincia": "Map of {nombre} province",
    "mapa.canton": "Map of the canton of {nombre}",
    "mapa.distrito": "Map of the district of {nombre}",
    "acerca.titulo": "About this project",
    "acerca.p1":
      "Explora Costa Rica is a free public-service project: an interactive map of the country's territorial divisions — 7 provinces, 84 cantons, and their districts.",
    "acerca.p2":
      "Geographic boundaries come from the National Geographic Institute (the SNIT's official WFS service). The code is open source — see the project repository for source details and the build plan.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type StringKey = keyof (typeof STRINGS)["es"];
export type StringParams = Record<string, string | number>;

const STORAGE_KEY = "explora-lang";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: "es",
  setLang: (lang) => {
    set({ lang });
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private browsing without storage — the toggle still works in-session.
    }
    document.documentElement.lang = lang;
  },
}));

/** Stored preference, read post-hydration (never during render). */
export function storedLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "es" ? value : null;
  } catch {
    return null;
  }
}

export function format(template: string, params?: StringParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

/** Translation hook for client components. */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: StringKey, params?: StringParams) =>
    format(STRINGS[lang][key] ?? STRINGS.es[key], params);
}
