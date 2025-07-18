import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'
import { UserData } from '@/lib/sanityClient'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const userData: UserData = await request.json()

    // Normaliza el correo a minúsculas
    const correo = userData.correo.trim().toLowerCase();

    // Verifica si ya existe usuario con esa cédula o correo
    const query = '*[_type == "registro" && (cedula == $cedula || correo == $correo)][0]'
    const existing = await client.fetch(query, {
      cedula: userData.cedula,
      correo
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con esa cédula o correo' },
        { status: 400 }
      )
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10)

    const newUser = await client.create({
      _type: 'registro',
      nombreApellido: userData.nombreApellido,
      cedula: userData.cedula,
      correo, // Guarda el correo normalizado
      celular: userData.celular,
      ciudad: userData.ciudad,
      contrasena: hashedPassword,
      fechaRegistro: new Date().toISOString(),
      estadoDocumentacion: 'pendiente',
      motivoDenegacion: ''
    })
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}