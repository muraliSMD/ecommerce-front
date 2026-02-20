import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Blog from "@/models/Blog";

export default async function sitemap() {
  await dbConnect();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/shop",
    "/cart",
    "/wishlist",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  }));

  // Dynamic products
  const products = await Product.find({}).select("slug updatedAt").lean();
  const productRoutes = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic categories
  const categories = await Category.find({}).select("name slug updatedAt").lean();
  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/shop?category=${category.slug || category.name}`,
    lastModified: category.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic blogs
  const blogs = await Blog.find({}).select("slug updatedAt").lean();
  const blogRoutes = blogs.map((blog) => ({
    url: `${siteUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...blogRoutes,
  ];
}
