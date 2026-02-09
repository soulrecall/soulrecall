import { NextResponse } from 'next/server';
import { loadDeploymentHistory, getAllDeployments } from '../../../../src/deployment/promotion.js';

export async function GET() {
  try {
    const deployments = await getAllDeployments();
    
    return NextResponse.json({
      success: true,
      data: deployments,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
