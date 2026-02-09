import { NextResponse } from 'next/server';
import { readAgentConfig } from '../../../src/packaging/config-persistence.js';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const agentConfig = await readAgentConfig(id);
    
    if (!agentConfig) {
      return NextResponse.json({
        success: false,
        error: `Agent '${id}' not found`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: agentConfig,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { config } = body;
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Config is required',
      }, { status: 400 });
    }

    const existingConfig = await readAgentConfig(id);
    if (!existingConfig) {
      return NextResponse.json({
        success: false,
        error: `Agent '${id}' not found`,
      }, { status: 404 });
    }

    const mergedConfig = { ...existingConfig, ...config };
    await import('../../../src/packaging/config-persistence.js').then(
      (m) => m.writeAgentConfig(id, mergedConfig)
    );

    return NextResponse.json({
      success: true,
      data: mergedConfig,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
