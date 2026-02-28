
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === 'all') startDate = new Date(0);

    // Parallelize count queries
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);

    // Calculate Total Revenue based on period
    const revenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Daily Sales for Chart
    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days for the chart
    const chartData = [];
    const daysCount = period === 'all' ? 30 : parseInt(period) || 7; // cap 'all' at 30 for chart readability
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = dailyData.find((item) => item._id === dateStr);
      chartData.push({
        date: new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short', day: 'numeric' }),
        fullDate: dateStr,
        sales: found ? found.sales : 0,
        orders: found ? found.orders : 0,
      });
    }

    // Sales by Category
    const salesByCategory = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },
        {
            $lookup: {
                from: "categories",
                localField: "productInfo.category",
                foreignField: "_id",
                as: "categoryInfo"
            }
        },
        { $unwind: "$categoryInfo" },
        {
            $group: {
                _id: "$categoryInfo.name",
                value: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
            }
        },
        { $project: { name: "$_id", value: 1, _id: 0 } },
        { $sort: { value: -1 } }
    ]);

    // Top Selling Products
    const topSellers = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalQty: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
            }
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $project: {
                name: "$product.name",
                image: { $arrayElemAt: ["$product.images", 0] },
                totalQty: 1,
                revenue: 1
            }
        }
    ]);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      chartData,
      salesByCategory,
      topSellers
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
