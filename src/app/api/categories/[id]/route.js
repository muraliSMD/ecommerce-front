import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    if (body.sku !== undefined && body.sku.trim() !== "") {
        const collision = await Category.findOne({ sku: body.sku, _id: { $ne: id } });
        if (collision) {
            return NextResponse.json({ message: "SKU already exists" }, { status: 400 });
        }
        updateData.sku = body.sku;
    }
    
    if (body.slug !== undefined && body.slug.trim() !== "") {
        let slug = body.slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        // Check if slug is different and unique
        const existingCategory = await Category.findById(id);
        if (existingCategory && existingCategory.slug !== slug) {
            const collision = await Category.findOne({ slug });
            if (collision) {
                slug = `${slug}-${Date.now()}`;
            }
            updateData.slug = slug;
        }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // Cascade activation/inactivation if status is changed
    if (updateData.isActive !== undefined) {
        await Category.updateMany(
            { ancestors: id },
            { $set: { isActive: updateData.isActive } }
        );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
