import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })
  const user = await client.fetch(`*[_type == "registro" && _id == $userId][0]`, { userId })
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })
  return NextResponse.json(user)
}