"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  // split path into parts
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="flex flex-wrap gap-1 text-gray-600">
        {/* Always render Home first */}
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          // turn `cart-checkout` into `Cart Checkout`
          const label = decodeURIComponent(segment)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          const isLast = idx === segments.length - 1;

          return (
            <li key={idx} className="flex items-center gap-1">
              <span>/</span>
              {!isLast ? (
                // clickable for all except the last
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              ) : (
                // last one plain text
                <span className="text-gray-800">{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
