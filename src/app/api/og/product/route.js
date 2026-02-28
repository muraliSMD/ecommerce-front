import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || 'GRABSZY Product';
    const price = searchParams.get('price');
    const image = searchParams.get('image');
    const siteName = searchParams.get('siteName') || 'GRABSZY';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #f3f4f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f3f4f6 0%, transparent 50%)',
            padding: '40px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {/* Logo/Site Name */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#000',
                borderRadius: '8px',
              }}
            />
            <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.05em' }}>
              {siteName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
            }}
          >
            {/* Product Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  color: '#111',
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {name}
              </h1>
              {price && (
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '10px 24px',
                    borderRadius: '20px',
                    width: 'fit-content',
                  }}
                >
                  ${price}
                </div>
              )}
            </div>

            {/* Product Image */}
            {image && (
              <div
                style={{
                  display: 'flex',
                  width: '400px',
                  height: '400px',
                  borderRadius: '40px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '18px',
              color: '#9CA3AF',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Shop now at grabszy.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
