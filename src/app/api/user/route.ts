import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const aliadoId = searchParams.get('aliadoId')
  const userId = searchParams.get('userId')

  // Si viene userId, busca un usuario específico
  if (userId) {
    const user = await client.fetch(
      `*[_type == "registro" && _id == $userId][0]`,
      { userId }
    )
    if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })
    return NextResponse.json(user)
  }

  // Si viene aliadoId, busca todos los usuarios/clientes de ese aliado
  if (aliadoId) {
    const users = await client.fetch(
      `*[_type == "registro" && aliadoId == $aliadoId] | order(fechaRegistro desc)`,
      { aliadoId }
    )
    return NextResponse.json(users)
  }

  // Si no viene ningún parámetro válido
  return NextResponse.json({ error: 'No userId or aliadoId provided' }, { status: 400 })
}