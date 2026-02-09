import { NextResponse } from 'next/server';
import { canisterList } from '../../../../src/network/network-config.js';

export async function GET() {
  try {
    const networks = await canisterList({});
    
    return NextResponse.json({
      success: true,
      data: networks.stdout,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
