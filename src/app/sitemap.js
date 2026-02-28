import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Blog from "@/models/Blog";

export default async function sitemap() {
  await dbConnect();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://grabszy.com";

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
    "/wishlist",
    "/blog",
    "/returns-and-exchange",
    "/shipping-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Product Routes
  const products = await Product.find({ isActive: true }).select("slug updatedAt").lean();
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 3. Blog Routes
  const blogs = await Blog.find({ isPublished: true }).select("slug updatedAt").lean();
  const blogRoutes = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
