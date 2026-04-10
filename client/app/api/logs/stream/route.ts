import { NextRequest } from 'next/server';

// SSE 프록시 — Spring SSE 스트림을 클라이언트로 그대로 전달
// EventSource는 커스텀 헤더 불가 → 토큰을 쿼리 파라미터로 전달
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file') ?? 'app';
  const token = req.nextUrl.searchParams.get('token') ?? '';

  // 클라이언트가 연결을 끊으면 upstream(Spring)도 함께 닫기 위한 AbortController
  const controller = new AbortController();
  req.signal.addEventListener('abort', () => controller.abort());

  try {
    // Spring SSE 엔드포인트에 연결 (토큰은 쿼리 파라미터로 전달)
    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/logs/stream?file=${file}&token=${token}`,
      {
        headers: { Accept: 'text/event-stream' },
        cache: 'no-store',
        signal: controller.signal,
      },
    );

    if (!upstream.ok || !upstream.body) {
      return new Response('upstream connection failed', { status: 502 });
    }

    // Spring에서 오는 SSE 스트림을 그대로 클라이언트로 흘려보냄
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return new Response('stream error', { status: 500 });
  }
}
