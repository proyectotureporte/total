import { createClient } from '@sanity/client'

// Cliente principal con token para operaciones de escritura
export const client = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Cliente público para operaciones de solo lectura
export const publicClient = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
})

// Log de configuración (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('Sanity Config:', {
    projectId: 'p02io4ti',
    dataset: 'production',
    hasToken: !!process.env.SANITY_API_TOKEN,
    tokenPrefix: process.env.SANITY_API_TOKEN?.substring(0, 10) + '...'
  })
}

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    await publicClient.fetch('*[_type == "registroaliado"][0...1]')
    console.log('✅ Conexión a Sanity exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión a Sanity:', error)
    return false
  }
}

// Función mejorada para verificar usuarios existentes
export const checkUserAliadoExists = async (cedula: string, correo: string): Promise<AliadoDocument[]> => {
  console.log('🔍 Buscando aliado con cédula:', cedula, 'y correo:', correo)
  try {
    // Query optimizada que busca ambos campos en una sola consulta
    const query = '*[_type == "registroaliado" && (cedula == $cedula || correo == $correo)]'
    const results: AliadoDocument[] = await publicClient.fetch(query, { 
      cedula: cedula.trim(), 
      correo: correo.trim().toLowerCase() 
    })
    return results
  } catch (error) {
    console.error('❌ Error al verificar aliado:', error)
    throw error
  }
}

// Función para obtener el último ID de aliado (optimizada)
export const getLastAliadoId = async (): Promise<string | null> => {
  try {
    const query = '*[_type == "registroaliado" && defined(aliadoId)] | order(aliadoId desc)[0] { aliadoId }'
    const result = await publicClient.fetch(query)
    return result?.aliadoId || null
  } catch (error) {
    console.error('❌ Error al obtener último ID de aliado:', error)
    return null
  }
}

// Interfaz para el modelo básico (mantener por compatibilidad)
export interface UserData {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  ciudad: string
  contrasena: string
}

// Interfaz principal para aliados
export interface UserDataaliado {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  ciudad: string
  sectorTrabajo: string
  cargo: string
  experiencia: string
  potencialClientes: string
  edad: string
  contrasena: string
}

// Interfaz para el documento completo en Sanity
export interface AliadoDocument extends Omit<UserDataaliado, 'contrasena'> {
  _id?: string
  _type: 'registroaliado'
  _createdAt?: string
  _updatedAt?: string
  aliadoId: string
  contrasena: string
  fechaRegistro: string
  estadoDocumentacion: 'pendiente' | 'aprobado' | 'denegado'
  motivoDenegacion?: string
}

// Función para crear un nuevo aliado (optimizada)
export const createAliado = async (
  userData: UserDataaliado, 
  aliadoId: string, 
  hashedPassword: string
): Promise<AliadoDocument> => {
  try {
    const doc: Omit<AliadoDocument, '_id' | '_createdAt' | '_updatedAt'> = {
      _type: 'registroaliado',
      aliadoId,
      nombreApellido: userData.nombreApellido.trim(),
      cedula: userData.cedula.trim(),
      correo: userData.correo.trim().toLowerCase(),
      celular: userData.celular.trim(),
      ciudad: userData.ciudad.trim(),
      sectorTrabajo: userData.sectorTrabajo.trim(),
      cargo: userData.cargo.trim(),
      experiencia: userData.experiencia.trim(),
      potencialClientes: userData.potencialClientes.trim(),
      edad: userData.edad.trim(),
      contrasena: hashedPassword,
      fechaRegistro: new Date().toISOString(),
      estadoDocumentacion: 'pendiente',
      motivoDenegacion: ''
    }
    
    const result = await client.create(doc) as AliadoDocument
    console.log('✅ Usuario aliado guardado en Sanity:', result._id)
    return result
  } catch (error) {
    console.error('❌ Error al crear aliado:', error)
    throw error
  }
}

// Función para buscar aliado por credenciales (útil para login)
export const findAliadoByCredentials = async (correo: string) => {
  try {
    const query = '*[_type == "registroaliado" && correo == $correo][0]'
    const result = await publicClient.fetch(query, { 
      correo: correo.trim().toLowerCase() 
    })
    return result
  } catch (error) {
    console.error('❌ Error al buscar aliado por credenciales:', error)
    throw error
  }
}

// Función para actualizar estado de documentación
export const updateAliadoStatus = async (
  aliadoId: string, 
  status: 'pendiente' | 'aprobado' | 'denegado',
  motivoDenegacion?: string
) => {
  try {
    const query = '*[_type == "registroaliado" && aliadoId == $aliadoId][0]'
    const aliado = await client.fetch(query, { aliadoId })
    
    if (!aliado) {
      throw new Error('Aliado no encontrado')
    }
    
    const result = await client
      .patch(aliado._id)
      .set({ 
        estadoDocumentacion: status,
        motivoDenegacion: motivoDenegacion || ''
      })
      .commit()
      
    console.log('✅ Estado de aliado actualizado:', result._id)
    return result
  } catch (error) {
    console.error('❌ Error al actualizar estado de aliado:', error)
    throw error
  }
}

// FUNCIÓN LEGACY - Mantener por compatibilidad (pero marcada como deprecated)
/** @deprecated Usa createAliado en su lugar */
export const saveUserCompleto = async (user: UserDataaliado) => {
  try {
    const doc = {
      _type: 'registroaliado',
      ...user,
      fechaRegistro: new Date().toISOString(),
    }
    const result = await client.create(doc)
    console.log('✅ Usuario aliado guardado en Sanity:', result)
    return result
  } catch (error) {
    console.error('❌ Error al guardar usuario aliado:', error)
    throw error
  }
}