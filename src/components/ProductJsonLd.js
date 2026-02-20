"use client";

import JsonLd from "./JsonLd";

export default function ProductJsonLd({ product, url }) {
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description.replace(/<[^>]*>?/gm, ''), // Strip HTML
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "GRABSZY"
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "USD", // Should ideally be dynamic
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  // Add reviews if available
  if (product.reviews?.length > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews
    };
    data.review = product.reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating
      },
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "reviewBody": review.comment
    }));
  }

  return <JsonLd data={data} />;
}
