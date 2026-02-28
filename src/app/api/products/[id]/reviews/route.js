import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { reviewSchema } from '@/lib/validations/review';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAuth(user)) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);
    
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Validation failed", 
            errors: validation.error.format() 
        }, { status: 400 });
    }

    const { rating, comment, images = [], videos = [] } = validation.data;
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

    // Check for Verified Purchase
    const deliveredOrder = await Order.findOne({
        user: user._id,
        "items.product": id,
        orderStatus: "Delivered"
    });

    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      images,
      videos,
      isVerified: !!deliveredOrder,
      user: user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    
    return NextResponse.json({ message: "Review added", isVerified: !!deliveredOrder });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

// Handler for Helpfulness Voting
export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!isAuth(user)) {
            return NextResponse.json({ message: "Not authorized" }, { status: 401 });
        }

        const { reviewId } = await request.json();
        const { id } = await params;

        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        const review = product.reviews.id(reviewId);
        if (!review) return NextResponse.json({ message: "Review not found" }, { status: 404 });

        // Prevent double voting
        if (review.votedUsers && review.votedUsers.includes(user._id)) {
            return NextResponse.json({ message: "You have already voted" }, { status: 400 });
        }

        review.helpfulVotes = (review.helpfulVotes || 0) + 1;
        if (!review.votedUsers) review.votedUsers = [];
        review.votedUsers.push(user._id);

        await product.save();
        return NextResponse.json({ message: "Vote registered", helpfulVotes: review.helpfulVotes });
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
