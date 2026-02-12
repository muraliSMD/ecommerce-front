import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { rating, comment } = await request.json();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === user.userId
    );

    if (alreadyReviewed) {
      return NextResponse.json({ message: "Product already reviewed" }, { status: 400 });
    }

    const review = {
      name: user.name || "Anonymous", // Ideally fetch latest user name but this works
      rating: Number(rating),
      comment,
      user: user.userId,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    return NextResponse.json({ message: "Review added" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
