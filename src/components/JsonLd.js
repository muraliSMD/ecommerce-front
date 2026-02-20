"use client";

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({ siteName, logo, url, supportEmail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": url,
    "logo": logo,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": supportEmail,
      "contactType": "customer service"
    }
  };

  return <JsonLd data={data} />;
}

export function WebSiteJsonLd({ siteName, url }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return <JsonLd data={data} />;
}
