import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validación de campos requeridos
    if (!userData.nombreApellido || !userData.cedula || !userData.correo || 
        !userData.celular || !userData.ciudad || !userData.contrasena || !userData.aliadoId) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Normaliza el correo a minúsculas
    const correo = userData.correo.trim().toLowerCase();

    // Normaliza la ciudad (opcional: eliminar espacios extra)
    const ciudad = userData.ciudad.trim();

    // Verifica si ya existe usuario con esa cédula o correo
    const query = '*[_type == "registro" && (cedula == $cedula || correo == $correo)][0]'
    const existing = await client.fetch(query, {
      cedula: userData.cedula,
      correo
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con esa cédula o correo' },
        { status: 400 }
      );
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

    const newUser = await client.create({
      _type: 'registro',
      nombreApellido: userData.nombreApellido,
      cedula: userData.cedula,
      correo,
      celular: userData.celular,
      ciudad,
      contrasena: hashedPassword,
      fechaRegistro: new Date().toISOString(),
      estadoDocumentacion: 'pendiente',
      motivoDenegacion: '',
      aliadoId: userData.aliadoId // <-- ASOCIA AL ALIADO
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}