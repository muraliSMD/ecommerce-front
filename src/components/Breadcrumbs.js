"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ items }) {
  const pathname = usePathname();

  const truncate = (text, length = 25) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  if (items) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm mb-4">
        <ol className="flex items-center gap-2 text-gray-600 overflow-x-auto flex-nowrap md:flex-wrap pb-1 no-scrollbar">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            // Truncate only if it's not the first few items or if label is very long
            const displayLabel = idx > 1 ? truncate(item.label, isLast ? 20 : 25) : item.label;
            
            return (
              <li key={idx} className="flex items-center gap-1 flex-shrink-0">
                {idx > 0 && <span className="opacity-40">/</span>}
                {!isLast ? (
                  <Link href={item.href} className="hover:underline whitespace-nowrap">
                    {displayLabel}
                  </Link>
                ) : (
                  <span className="text-gray-800 font-medium whitespace-nowrap">{displayLabel}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // split path into parts
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="flex items-center gap-2 text-gray-600 overflow-x-auto flex-nowrap md:flex-wrap pb-1 no-scrollbar">
        {/* Always render Home first */}
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          
          let label = decodeURIComponent(segment)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          
          label = truncate(label, isLast ? 20 : 25);

          return (
            <li key={idx} className="flex items-center gap-1 flex-shrink-0">
              <span className="opacity-40">/</span>
              {!isLast ? (
                <Link href={href} className="hover:underline whitespace-nowrap">
                  {label}
                </Link>
              ) : (
                <span className="text-gray-800 whitespace-nowrap">{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
