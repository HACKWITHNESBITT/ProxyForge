const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/v1/mesh/stats`, {
      cache: 'no-store',
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return Response.json(
      { error: 'Failed to fetch mesh stats from backend' },
      { status: 502 }
    );
  }
}
