import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'CHANGELOG.md');
    const content = readFileSync(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: '' }, { status: 500 });
  }
}
