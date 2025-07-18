import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { correo, contrasena } = await request.json()

  // Normaliza el correo a minúsculas
  const correoNormalized = correo.trim().toLowerCase();

  const query = `*[_type == "registroaliado" && correo == $correo][0]{_id, contrasena}`
  const user = await client.fetch(query, { correo: correoNormalized })

  if (!user) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
  }

  const isMatch = await bcrypt.compare(contrasena, user.contrasena)
  if (!isMatch) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
  }

  return NextResponse.json({ userId: user._id })
}