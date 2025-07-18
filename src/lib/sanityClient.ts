import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export const publicClient = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
})

console.log('Sanity Config:', {
  projectId: 'p02io4ti',
  dataset: 'production',
  hasToken: !!process.env.SANITY_API_TOKEN,
  tokenPrefix: process.env.SANITY_API_TOKEN?.substring(0, 10) + '...'
})

export const testConnection = async () => {
  try {
    await publicClient.fetch('*[_type == "registroaliado"][0...1]')
    console.log('✅ Conexión a Sanity exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión a Sanity:', error)
    return false
  }
}

// Verifica si ya existe un usuario aliado con esa cédula o correo
export const checkUserAliadoExists = async (cedula: string, correo: string) => {
  console.log('🔍 Buscando aliado con cédula:', cedula, 'y correo:', correo)
  try {
    const cedulaQuery = '*[_type == "registroaliado" && cedula == $cedula]'
    const cedulaResults = await publicClient.fetch(cedulaQuery, { cedula })
    const correoQuery = '*[_type == "registroaliado" && correo == $correo]'
    const correoResults = await publicClient.fetch(correoQuery, { correo })
    return [...cedulaResults, ...correoResults]
  } catch (error) {
    console.error('❌ Error al verificar aliado:', error)
    throw error
  }
}

// Modelo antiguo (puedes eliminarlo si ya no lo usas)
export interface UserData {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  ciudad: string
  contrasena: string
}

// NUEVO MODELO PARA EL FORMULARIO COMPLETO
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

// FUNCIÓN PARA GUARDAR EL NUEVO REGISTRO COMPLETO EN SANITY
export const saveUserCompleto = async (user: UserDataaliado) => {
  try {
    const doc = {
      _type: 'registroaliado', // ← Cambiado al nuevo schema
      ...user,
      // Guarda la fecha de registro automáticamente
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