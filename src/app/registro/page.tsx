'use client'

import { useState } from 'react'
import { UserData } from '@/lib/sanityClient'
import { useRouter } from 'next/navigation'

interface FormData {
  nombreApellido: string
  cedula: string
  correo: string
  celular: string
  contrasena: string
}

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    nombreApellido: '',
    cedula: '',
    correo: '',
    celular: '',
    contrasena: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    if (!form.nombreApellido.trim()) {
      setError('El nombre y apellido son obligatorios')
      return false
    }
    if (!form.cedula.trim()) {
      setError('La cédula es obligatoria')
      return false
    }
    if (!/^\d{7,10}$/.test(form.cedula)) {
      setError('La cédula debe tener entre 7 y 10 dígitos')
      return false
    }
    if (!form.correo.trim()) {
      setError('El correo es obligatorio')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(form.correo)) {
      setError('El correo no tiene un formato válido')
      return false
    }
    if (!form.celular.trim()) {
      setError('El celular es obligatorio')
      return false
    }
    if (!/^\d{10}$/.test(form.celular)) {
      setError('El celular debe tener 10 dígitos')
      return false
    }
    if (!form.contrasena.trim()) {
      setError('La contraseña es obligatoria')
      return false
    }
    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    setLoading(true)
    try {
      const userData: UserData = {
        nombreApellido: form.nombreApellido.trim(),
        cedula: form.cedula.trim(),
        correo: form.correo.trim().toLowerCase(),
        celular: form.celular.trim(),
        contrasena: form.contrasena
      }
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario')
      }
      setForm({
        nombreApellido: '',
        cedula: '',
        correo: '',
        celular: '',
        contrasena: '',
      })
      alert('¡Usuario registrado exitosamente!')
      router.push('/Panel')
    } catch (error) {
      setLoading(false)
      const errorMessage = (error as Error).message || String(error)
      setError('Error al registrar: ' + errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0b0f19] overflow-hidden">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Registro de Usuario</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombreApellido" className="block text-sm font-medium mb-1 text-gray-200">
              Nombre y Apellido
            </label>
            <input
              id="nombreApellido"
              type="text"
              name="nombreApellido"
              placeholder="Ingresa tu nombre completo"
              value={form.nombreApellido}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-white text-white"
            />
          </div>
          <div>
            <label htmlFor="cedula" className="block text-sm font-medium mb-1 text-gray-200">
              Número de Cédula
            </label>
            <input
              id="cedula"
              type="text"
              name="cedula"
              placeholder="Ingresa tu número de cédula"
              value={form.cedula}
              onChange={handleChange}
              required
              pattern="[0-9]{7,10}"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-white text-white"
            />
          </div>
          <div>
            <label htmlFor="correo" className="block text-sm font-medium mb-1 text-gray-200">
              Correo Electrónico
            </label>
            <input
              id="correo"
              type="email"
              name="correo"
              placeholder="ejemplo@correo.com"
              value={form.correo}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-white text-white"
            />
          </div>
          <div>
            <label htmlFor="celular" className="block text-sm font-medium mb-1 text-gray-200">
              Celular
            </label>
            <input
              id="celular"
              type="tel"
              name="celular"
              placeholder="3001234567"
              value={form.celular}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-white text-white"
            />
          </div>
          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium mb-1 text-gray-200">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              placeholder="Mínimo 6 caracteres"
              value={form.contrasena}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-white text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors rounded p-3 font-semibold mt-6"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="flex flex-col items-center mt-6 space-y-2">
          <a
            href="#"
            className="text-sm text-blue-400 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <span className="text-gray-400 text-sm">¿Ya tienes cuenta?</span>
          <a
            href="/login"
            className="text-sm text-blue-400 hover:underline font-semibold"
          >
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  )
}