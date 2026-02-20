import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductDetails from "./ProductDetails";
import ProductJsonLd from "@/components/ProductJsonLd";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).select("name description images").lean();

  if (!product) return { title: "Product Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";
  const plainDescription = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160);

  return {
    title: `${product.name} | GRABSZY`,
    description: plainDescription,
    openGraph: {
      title: product.name,
      description: plainDescription,
      url: `${siteUrl}/product/${slug}`,
      images: [
        {
          url: product.images?.[0] || `${siteUrl}/og-image.jpg`,
          width: 800,
          height: 800,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: plainDescription,
      images: [product.images?.[0] || `${siteUrl}/og-image.jpg`],
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
