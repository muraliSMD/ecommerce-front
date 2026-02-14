
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

    // Parallelize count queries
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);

    // Calculate Total Revenue (excluding cancelled)
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Daily Sales (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
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

    // Fill in missing days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = dailyData.find((item) => item._id === dateStr);
      chartData.push({
        date: new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short' }),
        fullDate: dateStr,
        sales: found ? found.sales : 0,
        orders: found ? found.orders : 0,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      chartData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
