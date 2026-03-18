import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        // Basic URL validation
        new URL(url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Mimic a browser request to avoid some basic blocking
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch video: ${response.statusText}` },
                { status: response.status }
            );
        }

        const headers = new Headers();
        // Forward important headers for the download
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');

        if (contentLength) headers.set('Content-Length', contentLength);
        if (contentType) headers.set('Content-Type', contentType);

        // Set disposition to attachment to encourage download behavior if accessed directly,
        // though our frontend will handle the blob creation.
        headers.set('Content-Disposition', `attachment; filename="video.mp4"`);

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
