import { NextRequest, NextResponse } from 'next/server'
import { checkUserAliadoExists, createAliado, getLastAliadoId } from '@/lib/sanityClient'
import { UserDataaliado } from '@/lib/sanityClient'
import bcrypt from 'bcryptjs'

// Función mejorada para generar el siguiente ID de aliado
async function generateNextAliadoId(): Promise<string> {
  try {
    const lastId = await getLastAliadoId()
    
    let nextNumber: number
    
    if (!lastId) {
      // Si no hay aliados registrados, empezar desde 150
      nextNumber = 150
    } else {
      // Extraer el número del último ID (AR-0150 -> 150)
      const lastIdNumber = parseInt(lastId.replace('AR-', ''))
      nextNumber = lastIdNumber + 1
    }
    
    // Formatear el número con ceros a la izquierda (AR-0150)
    const formattedId = `AR-${nextNumber.toString().padStart(4, '0')}`
    
    console.log('🆔 Nuevo ID generado:', formattedId)
    return formattedId
  } catch (error) {
    console.error('❌ Error al generar ID de aliado:', error)
    // Si hay error, generar un ID basado en timestamp como fallback
    const timestamp = Date.now().toString().slice(-4)
    return `AR-${timestamp.padStart(4, '0')}`
  }
}

// Función para validar datos del frontend
function validateUserData(userData: UserDataaliado): string[] {
  const errors: string[] = []
  
  // Validaciones básicas
  if (!userData.nombreApellido?.trim()) errors.push('Nombre y apellido requerido')
  if (!userData.cedula?.trim()) errors.push('Cédula requerida')
  if (!userData.correo?.trim()) errors.push('Correo requerido')
  if (!userData.celular?.trim()) errors.push('Celular requerido')
  if (!userData.ciudad?.trim()) errors.push('Ciudad requerida')
  if (!userData.sectorTrabajo?.trim()) errors.push('Sector de trabajo requerido')
  if (!userData.cargo?.trim()) errors.push('Cargo requerido')
  if (!userData.experiencia?.trim()) errors.push('Experiencia requerida')
  if (!userData.potencialClientes?.trim()) errors.push('Potencial de clientes requerido')
  if (!userData.edad?.trim()) errors.push('Edad requerida')
  if (!userData.contrasena?.trim()) errors.push('Contraseña requerida')
  
  // Validaciones de formato
  if (userData.cedula && !/^\d{7,10}$/.test(userData.cedula)) {
    errors.push('Cédula debe tener entre 7 y 10 dígitos')
  }
  
  if (userData.correo && !/\S+@\S+\.\S+/.test(userData.correo)) {
    errors.push('Formato de correo inválido')
  }
  
  if (userData.celular && !/^\d{10}$/.test(userData.celular)) {
    errors.push('Celular debe tener 10 dígitos')
  }
  
  if (userData.contrasena && userData.contrasena.length < 6) {
    errors.push('Contraseña debe tener al menos 6 caracteres')
  }
  
  return errors
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando registro de aliado...')
    
    // Parsear los datos del request
    const userData: UserDataaliado = await request.json()
    console.log('📝 Datos recibidos:', {
      ...userData,
      contrasena: '[OCULTA]'
    })

    // Validar datos de entrada
    const validationErrors = validateUserData(userData)
    if (validationErrors.length > 0) {
      console.log('❌ Errores de validación:', validationErrors)
      return NextResponse.json(
        { error: `Datos inválidos: ${validationErrors.join(', ')}` },
        { status: 400 }
      )
    }

    // Normalizar datos - ASEGURAR QUE TODOS LOS CAMPOS ESTÉN PRESENTES
    const normalizedData = {
      nombreApellido: userData.nombreApellido?.trim() || '',
      cedula: userData.cedula?.trim() || '',
      correo: userData.correo?.trim().toLowerCase() || '',
      celular: userData.celular?.trim() || '',
      ciudad: userData.ciudad?.trim() || '',
      sectorTrabajo: userData.sectorTrabajo?.trim() || '', // CORRECCIÓN: Asegurar que no sea undefined
      cargo: userData.cargo?.trim() || '', // CORRECCIÓN: Asegurar que no sea undefined
      experiencia: userData.experiencia?.trim() || '',
      potencialClientes: userData.potencialClientes?.trim() || '',
      edad: userData.edad?.trim() || '',
      contrasena: userData.contrasena?.trim() || ''
    }

    // Debug: Verificar datos normalizados
    console.log('📋 Datos normalizados:', {
      ...normalizedData,
      contrasena: '[OCULTA]'
    })

    // Verificar que sectorTrabajo y cargo no estén vacíos después de normalizar
    if (!normalizedData.sectorTrabajo) {
      console.log('❌ sectorTrabajo está vacío después de normalizar')
      return NextResponse.json(
        { error: 'El sector de trabajo es obligatorio' },
        { status: 400 }
      )
    }

    if (!normalizedData.cargo) {
      console.log('❌ cargo está vacío después de normalizar')
      return NextResponse.json(
        { error: 'El cargo es obligatorio' },
        { status: 400 }
      )
    }

    // Verificar si ya existe usuario con esa cédula o correo
    console.log('🔍 Verificando si el usuario ya existe...')
    const existingUsers = await checkUserAliadoExists(normalizedData.cedula, normalizedData.correo)
    
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      let errorMessage = 'Usuario ya registrado: '
      
      if (existingUser.cedula === normalizedData.cedula) {
        errorMessage += 'cédula ya existe'
      }
      if (existingUser.correo === normalizedData.correo) {
        errorMessage += existingUser.cedula === normalizedData.cedula ? 
          ' y correo ya existe' : 'correo ya existe'
      }
      
      console.log('⚠️ Usuario duplicado encontrado:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict
      )
    }

    // Generar el siguiente ID de aliado
    console.log('🆔 Generando ID de aliado...')
    const aliadoId = await generateNextAliadoId()

    // Hashear la contraseña
    console.log('🔒 Hasheando contraseña...')
    const hashedPassword = await bcrypt.hash(normalizedData.contrasena, 12)

    // Crear el nuevo usuario utilizando la función optimizada
    console.log('💾 Guardando usuario en Sanity...')
    const newUser = await createAliado(normalizedData, aliadoId, hashedPassword)

    console.log('✅ Usuario creado exitosamente:', newUser._id)

    

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      aliadoId: newUser.aliadoId,
      usuario: {
        id: newUser._id,
        aliadoId: newUser.aliadoId,
        nombreApellido: newUser.nombreApellido,
        correo: newUser.correo,
        sectorTrabajo: newUser.sectorTrabajo, // Incluir en respuesta para debug
        cargo: newUser.cargo, // Incluir en respuesta para debug
        fechaRegistro: newUser.fechaRegistro,
        estadoDocumentacion: newUser.estadoDocumentacion
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en registro de aliado:', error)
    
    // Manejo de errores más específico
    if (error instanceof Error) {
      // Error de Sanity
      if (error.message.includes('Document with ID')) {
        return NextResponse.json(
          { error: 'Error de base de datos: documento duplicado' },
          { status: 409 }
        )
      }
      
      // Error de validación de Sanity
      if (error.message.includes('validation')) {
        console.log('❌ Error de validación de Sanity:', error.message)
        return NextResponse.json(
          { error: 'Error de validación de datos en la base de datos' },
          { status: 400 }
        )
      }
      
      // Error de conexión
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Error de conexión con la base de datos' },
          { status: 503 }
        )
      }
    }
    
    // Error genérico
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}