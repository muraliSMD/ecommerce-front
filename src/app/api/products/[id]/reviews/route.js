
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAuth(user)) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { rating, comment } = await request.json();
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === user._id.toString()
    );

    if (alreadyReviewed) {
      return NextResponse.json({ message: "Product already reviewed" }, { status: 400 });
    }

    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      user: user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    
    return NextResponse.json({ message: "Review added" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
