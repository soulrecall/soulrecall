import { NextResponse } from 'next/server';
import { listAgents } from '@/packaging/config-persistence.js';

export async function GET() {
  try {
    const agents = await listAgents();
    return NextResponse.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
