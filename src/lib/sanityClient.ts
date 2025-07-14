import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Solo para backend
})

// Cliente público (sin token) para el frontend
export const publicClient = createClient({
  projectId: 'p02io4ti',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Puede usar CDN para lectura
  // Sin token - solo para consultas públicas
})

// Verificar configuración (solo en backend)
console.log('Sanity Config:', {
  projectId: 'p02io4ti',
  dataset: 'production',
  hasToken: !!process.env.SANITY_API_TOKEN,
  tokenPrefix: process.env.SANITY_API_TOKEN?.substring(0, 10) + '...'
})

// Función helper para verificar la conexión (frontend)
export const testConnection = async () => {
  try {
    const result = await publicClient.fetch('*[_type == "registro"][0...1]')
    console.log('✅ Conexión a Sanity exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión a Sanity:', error)
    return false
  }
}

// Función para verificar usuario existente (frontend)
export const checkUserExists = async (cedula: string, correo: string) => {
  console.log('🔍 Buscando usuario con cédula:', cedula, 'y correo:', correo)
  
  try {
    // Buscar por cédula
    const cedulaQuery = '*[_type == "registro" && cedula == $cedula]'
    const cedulaResults = await publicClient.fetch(cedulaQuery, { cedula })
    
    // Buscar por correo
    const correoQuery = '*[_type == "registro" && correo == $correo]'
    const correoResults = await publicClient.fetch(correoQuery, { correo })
    
    return [...cedulaResults, ...correoResults]
  } catch (error) {
    console.error('❌ Error al verificar usuario:', error)
    throw error
  }
}

// Interfaces para TypeScript
export interface UserData {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  contrasena: string
}