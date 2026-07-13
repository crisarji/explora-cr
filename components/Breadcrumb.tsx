import Link from "next/link";

export interface Crumb {
  nombre: string;
  /** Present on ancestors; absent on the current page. */
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className="text-sm text-neutral-500 dark:text-neutral-400"
    >
      {items.map((item, i) => (
        <span key={`${item.nombre}-${i}`}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-neutral-900 dark:hover:text-white"
            >
              {item.nombre}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="text-neutral-900 dark:text-white"
            >
              {item.nombre}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
