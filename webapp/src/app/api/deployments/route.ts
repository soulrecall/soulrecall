import { NextResponse } from 'next/server';
import { loadDeploymentHistory, getAllDeployments } from '@/deployment/promotion.js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const agentName = url.searchParams.get('agent');
    
    if (!agentName) {
      return NextResponse.json({
        success: false,
        error: 'agent name is required',
      }, { status: 400 });
    }
    
    const deployments = getAllDeployments(agentName);
    
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
