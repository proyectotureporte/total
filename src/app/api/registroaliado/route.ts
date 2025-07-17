import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'
import { UserDataaliado } from '@/lib/sanityClient'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const userData: UserDataaliado = await request.json()

    // Normaliza el correo a minúsculas
    const correo = userData.correo.trim().toLowerCase();

    // Verifica si ya existe usuario con esa cédula o correo
    const query = '*[_type == "registroaliado" && (cedula == $cedula || correo == $correo)][0]'
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

    // Crea el nuevo usuario aliado
    const newUser = await client.create({
      _type: 'registroaliado',
      nombreApellido: userData.nombreApellido,
      cedula: userData.cedula,
      correo, // Guarda el correo normalizado
      celular: userData.celular,
      ciudad: userData.ciudad,
      sectorTrabajo: userData.sectorTrabajo,
      cargo: userData.cargo,
      experiencia: userData.experiencia,
      potencialClientes: userData.potencialClientes,
      edad: userData.edad,
      contrasena: hashedPassword,
      fechaRegistro: new Date().toISOString(),
      estadoDocumentacion: 'pendiente',
      motivoDenegacion: ''
    })

    // No devuelvas la contraseña en la respuesta
    const { contrasena, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}