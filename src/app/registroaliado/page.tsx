'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  nombreApellido: string
  cedula: string
  celular: string
  correo: string
  ciudad: string
  sectorTrabajo: string
  cargo: string
  experiencia: string
  potencialClientes: string
  edad: string
  contrasena: string
}

const ciudadesColombia = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Buenaventura',
  'Tuluá', 'Palmira', 'Floridablanca', 'Turbaco', 'Malambo', 'Facatativá', 'Sogamoso', 'Girardot', 'Ubaté', 'Fusagasugá',
  'Barrancas', 'Maicao', 'Cartago', 'Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas', 'Copacabana',
  'Girardota', 'Barbosa', 'Rionegro', 'Apartadó', 'Turbo', 'Caucasia', 'Necoclí', 'Chigorodó', 'Mutatá', 'Carepa'
]

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    nombreApellido: '',
    cedula: '',
    celular: '',
    correo: '',
    ciudad: '',
    sectorTrabajo: '',
    cargo: '',
    experiencia: '',
    potencialClientes: '',
    edad: '',
    contrasena: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [generatedId, setGeneratedId] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
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
    if (!form.ciudad) {
      setError('La ciudad es obligatoria')
      return false
    }
    if (!form.sectorTrabajo) {
      setError('El sector de trabajo es obligatorio')
      return false
    }
    if (!form.cargo) {
      setError('El cargo es obligatorio')
      return false
    }
    if (!form.experiencia) {
      setError('La experiencia es obligatoria')
      return false
    }
    if (!form.potencialClientes) {
      setError('El potencial de clientes mensuales es obligatorio')
      return false
    }
    if (!form.edad) {
      setError('La edad es obligatoria')
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
      // Asegurar que todos los campos estén presentes y no vacíos
      const userData = {
        nombreApellido: form.nombreApellido.trim(),
        cedula: form.cedula.trim(),
        correo: form.correo.trim().toLowerCase(),
        celular: form.celular.trim(),
        ciudad: form.ciudad.trim(),
        sectorTrabajo: form.sectorTrabajo.trim(), // Asegurar que no esté vacío
        cargo: form.cargo.trim(), // Asegurar que no esté vacío
        experiencia: form.experiencia.trim(),
        potencialClientes: form.potencialClientes.trim(),
        edad: form.edad.trim(),
        contrasena: form.contrasena.trim()
      }

      // Debug: verificar que los datos estén completos
      console.log('Datos a enviar:', {
        ...userData,
        contrasena: '[OCULTA]'
      })
      
      const response = await fetch('/api/registroaliado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario')
      }
      
      // Mostrar el ID generado al usuario
      setGeneratedId(data.aliadoId)
      
      // Limpiar formulario
      setForm({
        nombreApellido: '',
        cedula: '',
        celular: '',
        correo: '',
        ciudad: '',
        sectorTrabajo: '',
        cargo: '',
        experiencia: '',
        potencialClientes: '',
        edad: '',
        contrasena: '',
      })
      
      // Mostrar mensaje de éxito con el ID generado
      alert(`¡Usuario registrado exitosamente!\nTu ID de aliado es: ${data.aliadoId}\nGuarda este ID para futuras referencias.`)
      
      // CORRECCIÓN: Redirigir a loginaliado en lugar de Panel
      router.push('/loginaliado')
      
    } catch (error) {
      setLoading(false)
      const errorMessage = (error as Error).message || String(error)
      setError('Error al registrar: ' + errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Bienvenido Aliado</h2>
          <p className="text-blue-100 mt-2">Completa tus datos para unirte</p>
          {generatedId && (
            <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
              <p className="text-green-200 text-sm font-medium">ID de Aliado: {generatedId}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-600 text-white rounded-lg text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid de 2 columnas para campos más compactos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="ciudad" className="block text-sm font-medium mb-1 text-gray-200">
                  Ciudad
                </label>
                <select
                  id="ciudad"
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona tu ciudad</option>
                  {ciudadesColombia.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sectorTrabajo" className="block text-sm font-medium mb-1 text-gray-200">
                  Sector de Trabajo
                </label>
                <select
                  id="sectorTrabajo"
                  name="sectorTrabajo"
                  value={form.sectorTrabajo}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona tu sector</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Inmobiliaria">Inmobiliaria</option>
                  <option value="Consultoría">Consultoría</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label htmlFor="cargo" className="block text-sm font-medium mb-1 text-gray-200">
                  Cargo
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona tu cargo</option>
                  <option value="Asesor">Asesor</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Director">Director</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Auxiliar">Auxiliar</option>
                  <option value="Consultor">Consultor</option>
                  <option value="Analista">Analista</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="experiencia" className="block text-sm font-medium mb-1 text-gray-200">
                  Años de Experiencia
                </label>
                <select
                  id="experiencia"
                  name="experiencia"
                  value={form.experiencia}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona tu experiencia</option>
                  <option value="0-1">0-1 años</option>
                  <option value="2-5">2-5 años</option>
                  <option value="6-10">6-10 años</option>
                  <option value="11-15">11-15 años</option>
                  <option value="16-20">16-20 años</option>
                  <option value="20+">Más de 20 años</option>
                </select>
              </div>

              <div>
                <label htmlFor="potencialClientes" className="block text-sm font-medium mb-1 text-gray-200">
                  Potencial de Clientes Mensuales
                </label>
                <select
                  id="potencialClientes"
                  name="potencialClientes"
                  value={form.potencialClientes}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona el potencial</option>
                  <option value="1-5">1-5 clientes</option>
                  <option value="6-10">6-10 clientes</option>
                  <option value="11-20">11-20 clientes</option>
                  <option value="21-50">21-50 clientes</option>
                  <option value="50+">Más de 50 clientes</option>
                </select>
              </div>

              <div>
                <label htmlFor="edad" className="block text-sm font-medium mb-1 text-gray-200">
                  Edad
                </label>
                <select
                  id="edad"
                  name="edad"
                  value={form.edad}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                >
                  <option value="">Selecciona tu edad</option>
                  <option value="18-25">18-25 años</option>
                  <option value="26-35">26-35 años</option>
                  <option value="36-45">36-45 años</option>
                  <option value="46-55">46-55 años</option>
                  <option value="56-65">56-65 años</option>
                  <option value="65+">Más de 65 años</option>
                </select>
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-white transition-all"
                />
              </div>
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
                  Registrando...
                </span>
              ) : (
                'Registrarse'
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
              <span className="text-gray-400 text-sm">¿Ya tienes cuenta? </span>
              <a
                href="/loginaliado"
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors"
              >
                Inicia sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}