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
    await publicClient.fetch('*[_type == "registro"][0...1]')
    console.log('✅ Conexión a Sanity exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión a Sanity:', error)
    return false
  }
}

export const checkUserExists = async (cedula: string, correo: string) => {
  console.log('🔍 Buscando usuario con cédula:', cedula, 'y correo:', correo)
  try {
    const cedulaQuery = '*[_type == "registro" && cedula == $cedula]'
    const cedulaResults = await publicClient.fetch(cedulaQuery, { cedula })
    const correoQuery = '*[_type == "registro" && correo == $correo]'
    const correoResults = await publicClient.fetch(correoQuery, { correo })
    return [...cedulaResults, ...correoResults]
  } catch (error) {
    console.error('❌ Error al verificar usuario:', error)
    throw error
  }
}

export interface UserData {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  contrasena: string
}