import { NextRequest, NextResponse } from 'next/server';

// 초기 로그 로드 — Spring에서 최근 N줄 가져와서 반환
// 클라이언트에서 Authorization 헤더로 토큰 전달
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file') ?? 'app';
  const lines = req.nextUrl.searchParams.get('lines') ?? '100';
  const auth = req.headers.get('Authorization');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/logs?file=${file}&lines=${lines}`,
      {
        headers: {
          Authorization: auth ?? '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!res.ok) return NextResponse.json({ lines: [] }, { status: res.status });

    const data = await res.json();
    // Spring CommonResponse<List<String>> → { lines: [...] } 형태로 변환
    return NextResponse.json({ lines: data.data ?? [] });
  } catch {
    return NextResponse.json({ lines: [] }, { status: 500 });
  }
}
