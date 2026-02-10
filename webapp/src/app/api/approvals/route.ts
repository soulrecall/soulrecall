import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const approvals: unknown[] = []
    return NextResponse.json({ success: true, data: approvals })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch approvals' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ success: true, data: { id: 'approval-1', ...body } })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create approval' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    return NextResponse.json({ success: true, data: { id } })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete approval' } },
      { status: 500 }
    )
  }
}
