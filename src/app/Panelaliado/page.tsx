'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  nombreApellido?: string
  aliadoId?: string
  estadoDocumentacion?: string
  motivoDenegacion?: string
}

function capitalizarNombre(nombre: string = '') {
  return nombre
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

export default function Panel() {
  const [tipoCedula, setTipoCedula] = useState<'foto' | 'documento'>('foto')
  const [cedulaFiles, setCedulaFiles] = useState<File[]>([])
  const [comprobantesFiles, setComprobantesFiles] = useState<File[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario autenticado y estado
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/loginaliado')
      return
    }
    fetch(`/api/useraliado?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          router.push('/loginaliado')
        } else {
          setUser(data)
        }
        setLoading(false)
      })
  }, [router])

  // Redirigir si está validado
  useEffect(() => {
    if (user && user.estadoDocumentacion === 'aprobado') {
      router.push('/Panelprincipalaliado')
    }
  }, [user, router])

  // Manejo subida archivos
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    if (tipoCedula === 'foto' && files.length !== 2) {
      alert('Debes subir 2 fotos (frente y reverso)')
      return
    }
    if (tipoCedula === 'documento' && files.length !== 1) {
      alert('Debes subir 1 documento PDF')
      return
    }
    setCedulaFiles(files)
  }

  const handleComprobantesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setComprobantesFiles(Array.from(e.target.files))
  }

  // Detectar formato de audio soportado por el navegador
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return 'audio/webm' // fallback
  }

  // Grabación de audio
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert('No se soporta grabación de audio en este navegador')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const mr = new MediaRecorder(stream, { mimeType })
      const chunks: BlobPart[] = []
      mr.ondataavailable = e => chunks.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch {
      alert('Error al acceder al micrófono')
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    mediaRecorder?.stream.getTracks().forEach(track => track.stop())
    setRecording(false)
  }

  // Subida de archivos asociada al usuario
  const uploadFiles = async () => {
    if (!cedulaFiles.length) {
      alert('Debes subir la cédula')
      return
    }
    if (!user?._id) {
      alert('No se encontró el usuario autenticado')
      return
    }
    setIsUploading(true)
    setUploadProgress(0)

    // Construir FormData para enviar archivos y userId
    const formData = new FormData()
    formData.append('userId', user._id)
    cedulaFiles.forEach(f => formData.append('cedulaFiles', f))
    comprobantesFiles.forEach(f => formData.append('comprobantesFiles', f))
    if (audioBlob) {
      // Crear archivo con extensión correcta según el tipo MIME
      const getExtension = (mimeType: string) => {
        if (mimeType.includes('webm')) return 'webm'
        if (mimeType.includes('ogg')) return 'ogg'
        if (mimeType.includes('mp4')) return 'm4a'
        return 'webm'
      }
      const extension = getExtension(audioBlob.type)
      const audioFile = new File([audioBlob], `audio.${extension}`, { type: audioBlob.type })
      formData.append('audioBlob', audioFile)
    }

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Subir a la API
      const res = await fetch('/api/uploadaliado', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (res.ok) {
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          alert('¡Archivos subidos exitosamente!')
          location.reload()
        }, 500)
      } else {
        setIsUploading(false)
        alert('Error al subir archivos')
      }
    } catch {
      setIsUploading(false)
      alert('Error al subir archivos')
    }
  }

  const removeFile = (index: number, type: 'cedula' | 'comprobantes') => {
    if (type === 'cedula') {
      setCedulaFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setComprobantesFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.replace('/');
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Panel de Documentación
            {user && (
              <>
                {" - "}
                {capitalizarNombre(user.nombreApellido || '')}
                {" - "}
                {user.aliadoId}
              </>
            )}
          </h1>
          <p className="text-gray-600">Sube tus documentos de forma segura y rápida</p>
        </div>
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Estado de documentación */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Estado de documentación:{" "}
            <span className={`font-semibold ${
              user.estadoDocumentacion === 'aprobado' ? 'text-green-600' :
              user.estadoDocumentacion === 'denegado' ? 'text-red-600' :
              user.estadoDocumentacion === 'revision' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {user.estadoDocumentacion?.toUpperCase() || 'PENDIENTE'}
            </span>
          </p>
          {user.estadoDocumentacion === 'denegado' && user.motivoDenegacion && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mt-2">
              <strong>Motivo de denegación:</strong> {user.motivoDenegacion}
            </div>
          )}
        </div>
        {(user.estadoDocumentacion === 'pendiente' || user.estadoDocumentacion === 'revision' || user.estadoDocumentacion === 'denegado') && (
          <div className="grid gap-8">
          {/* Sección Cédula */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <i className="fas fa-id-card text-blue-600 text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Documento de Identidad</h2>
                <p className="text-gray-600">Sube tu cédula en formato foto o PDF</p>
              </div>
            </div>

            {/* Radio buttons mejorados */}
            <div className="flex gap-4 mb-6">
              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                tipoCedula === 'foto' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="tipoCedula"
                  value="foto"
                  checked={tipoCedula === 'foto'}
                  onChange={() => setTipoCedula('foto')}
                  className="sr-only"
                />
                <i className="fas fa-camera mr-3 text-lg"></i>
                <div>
                  <div className="font-semibold">Fotografías</div>
                  <div className="text-sm opacity-75">2 archivos (frente y reverso)</div>
                </div>
              </label>

              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                tipoCedula === 'documento' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="tipoCedula"
                  value="documento"
                  checked={tipoCedula === 'documento'}
                  onChange={() => setTipoCedula('documento')}
                  className="sr-only"
                />
                <i className="fas fa-file-pdf mr-3 text-lg"></i>
                <div>
                  <div className="font-semibold">Documento PDF</div>
                  <div className="text-sm opacity-75">1 archivo escaneado</div>
                </div>
              </label>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept={tipoCedula === 'foto' ? 'image/*' : '.pdf'}
                multiple={tipoCedula === 'foto'}
                onChange={handleCedulaChange}
                className="hidden"
                id="cedula-upload"
              />
              <label htmlFor="cedula-upload" className="cursor-pointer">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </div>
                <div className="text-gray-500">
                  {tipoCedula === 'foto' ? 'Máximo 2 imágenes' : 'Solo archivos PDF'}
                </div>
              </label>
            </div>

            {/* Archivos seleccionados */}
            {cedulaFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {cedulaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-file text-blue-500 mr-3"></i>
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(index, 'cedula')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección Audio */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <i className="fas fa-microphone text-green-600 text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Grabación de Audio</h2>
                <p className="text-gray-600">Graba un mensaje de verificación</p>
              </div>
            </div>

            <div className="text-center">
              {!recording && !audioUrl && (
                <button
                  onClick={startRecording}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <i className="fas fa-microphone mr-2"></i>
                  Iniciar Grabación
                </button>
              )}

              {recording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-600 font-semibold">Grabando...</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <i className="fas fa-stop mr-2"></i>
                    Detener Grabación
                  </button>
                </div>
              )}

              {audioUrl && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p className="text-green-600 font-semibold">¡Audio grabado exitosamente!</p>
                  </div>
                  <audio controls src={audioUrl} className="w-full mb-4" />
                  <button
                    onClick={() => {
                      setAudioBlob(null)
                      setAudioUrl(null)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Grabar de nuevo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sección Comprobantes */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <i className="fas fa-receipt text-purple-600 text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Comprobantes de Deuda</h2>
                <p className="text-gray-600">Sube fotos o PDFs de tus comprobantes</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleComprobantesChange}
                className="hidden"
                id="comprobantes-upload"
              />
              <label htmlFor="comprobantes-upload" className="cursor-pointer">
                <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  Selecciona múltiples archivos
                </div>
                <div className="text-gray-500">
                  Imágenes y PDFs permitidos
                </div>
              </label>
            </div>

            {comprobantesFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Archivos seleccionados ({comprobantesFiles.length})
                </h4>
                {comprobantesFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <i className={`fas ${file.type.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-image text-blue-500'} mr-3`}></i>
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(index, 'comprobantes')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <div className="text-center">
            <button
              onClick={uploadFiles}
              disabled={isUploading || !cedulaFiles.length}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Subiendo... {uploadProgress}%
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Enviar y Guardar
                </>
              )}
            </button>

            {isUploading && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}