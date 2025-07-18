'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error de autenticación')
      localStorage.setItem('userId', data.userId)
      router.push('/Panel')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error desconocido')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Bienvenido de Nuevo</h2>
          <p className="text-blue-100 mt-2">Ingresa tus credenciales</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-600 text-white rounded-lg text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium mb-1 text-gray-200">
                Correo Electrónico
              </label>
              <input
                id="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium mb-1 text-gray-200">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 rounded-lg p-4 font-semibold text-white mt-8 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="flex flex-col items-center mt-8 space-y-3 pt-6 border-t border-gray-700">
            <a
              href="#"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <div className="text-center">
              <span className="text-gray-400 text-sm">¿No tienes cuenta? </span>
              <a
                href="/registro"
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors"
              >
                Regístrate
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}