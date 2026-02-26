import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";
import ProductDetails from "./ProductDetails";
import ProductJsonLd from "@/components/ProductJsonLd";
import { notFound } from "next/navigation";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { color, size, length } = await searchParams;

  await dbConnect();
  const product = await Product.findOne({ slug }).select("name description images variants").lean();

  if (!product) return { title: "Product Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";
  const plainDescription = product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || "";
  
  // Find matching variant if params exist
  let variant = null;
  if (color || size || length) {
    variant = product.variants?.find(v => 
      (!color || v.color === color) && 
      (!size || v.size === size) && 
      (!length || v.length === length)
    );
  }

  // Determine share image: variant image -> first product image -> fallback
  const shareImage = variant?.images?.[0] || product.images?.[0] || `${siteUrl}/og-image.jpg`;
  
  const variantText = variant ? ` (${variant.color || ''}${variant.size ? ` ${variant.size}` : ''}${variant.length ? ` ${variant.length}` : ''})` : '';
  const title = `${product.name}${variantText} | GRABSZY`;

  return {
    title,
    description: plainDescription,
    openGraph: {
      title,
      description: plainDescription,
      url: `${siteUrl}/product/${slug}${color ? `?color=${color}` : ''}`,
      images: [
        {
          url: shareImage,
          width: 800,
          height: 800,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: plainDescription,
      images: [shareImage],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  await dbConnect();
  
  const product = await Product.findOne({ slug })
    .populate("category")
    .populate("reviews")
    .lean();

  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";

  return (
    <>
      <ProductJsonLd product={serializedProduct} url={`${siteUrl}/product/${slug}`} />
      <ProductDetails initialProduct={serializedProduct} />
    </>
  );
}
