import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const archives: unknown[] = []
    return NextResponse.json({ success: true, data: archives })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch archives' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ success: true, data: { id: 'archive-1', ...body } })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create archive' } },
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
      { success: false, error: { message: 'Failed to delete archive' } },
      { status: 500 }
    )
  }
}
