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
      <div className="container mx-auto px-4 md:px-8 py-2 border-b border-border-main/30">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center gap-2 text-text-muted overflow-x-auto flex-nowrap md:flex-wrap pb-1 scroll-smooth scrollbar-hide">
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              // Truncate only if it's not the first few items or if label is very long
              const displayLabel = idx > 1 ? truncate(item.label, isLast ? 20 : 25) : item.label;
              
              return (
                <li key={idx} className="flex items-center gap-1 flex-shrink-0">
                  {idx > 0 && <span className="opacity-40">/</span>}
                  {!isLast ? (
                    <Link href={item.href} className="hover:text-primary transition-colors whitespace-nowrap">
                      {displayLabel}
                    </Link>
                  ) : (
                    <span className="text-text-main font-medium whitespace-nowrap">{displayLabel}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    );
  }

  // split path into parts
    const segments = pathname.split("/").filter(Boolean);
  
    // Mapping for segments that don't have direct pages or should point elsewhere
    const segmentMapping = {
      product: { href: "/shop", label: "Shop" },
      account: { href: "/account", label: "My Account" },
    };
  
    return (
      <div className="container mx-auto px-4 md:px-8 py-2 border-b border-border-main/30">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center gap-2 text-text-muted overflow-x-auto flex-nowrap md:flex-wrap pb-1 scroll-smooth scrollbar-hide">
            {/* Always render Home first */}
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
  
            {segments.map((segment, idx) => {
              const mapping = segmentMapping[segment.toLowerCase()];
              const href = mapping ? mapping.href : "/" + segments.slice(0, idx + 1).join("/");
              const isLast = idx === segments.length - 1;
              
              let label = mapping ? mapping.label : decodeURIComponent(segment)
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              
              label = truncate(label, isLast ? 20 : 25);

            return (
              <li key={idx} className="flex items-center gap-1 flex-shrink-0">
                <span className="opacity-40">/</span>
                {!isLast ? (
                  <Link href={href} className="hover:text-primary transition-colors whitespace-nowrap">
                    {label}
                  </Link>
                ) : (
                  <span className="text-text-main font-medium whitespace-nowrap">{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
