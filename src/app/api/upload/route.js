import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Add configuration to allow for larger payloads and longer execution on Vercel
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce-products', // Optional: organize uploads into a folder
          resource_type: 'auto', // Allow video uploads as well
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // End the stream with the file buffer
      uploadStream.end(buffer);
    });

    console.log('Cloudinary Upload Success:', result.secure_url);
    console.log('Public ID:', result.public_id);

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Upload error details:', error);
    return NextResponse.json(
      { message: 'Error uploading file to Cloudinary', details: error.message || error.toString() },
      { status: 500 }
    );
  }
}
