import { NextResponse } from 'next/server';
import { listWallets } from '../../../../src/wallet/wallet-storage.js';

export async function GET() {
  try {
    const wallets = await listWallets();
    
    return NextResponse.json({
      success: true,
      data: wallets,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
