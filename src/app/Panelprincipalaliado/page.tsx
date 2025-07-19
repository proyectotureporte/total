'use client'

import { useState, useEffect } from 'react';

const ciudadesColombia = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Buenaventura',
  'Tuluá', 'Palmira', 'Floridablanca', 'Turbaco', 'Malambo', 'Facatativá', 'Sogamoso', 'Girardot', 'Ubaté', 'Fusagasugá',
  'Barrancas', 'Maicao', 'Cartago', 'Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas', 'Copacabana',
  'Girardota', 'Barbosa', 'Rionegro', 'Apartadó', 'Turbo', 'Caucasia', 'Necoclí', 'Chigorodó', 'Mutatá', 'Carepa'
];

// Función para capitalizar la primera letra de cada palabra
function capitalizarNombre(nombre: string = ''): string {
  return nombre
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

// Función para obtener valor seguro de una propiedad con múltiples posibles nombres
function obtenerValorSeguro(obj: Record<string, unknown> | null | undefined, ...propiedades: string[]): string {
  for (const prop of propiedades) {
    if (obj && obj[prop] !== undefined && obj[prop] !== null && obj[prop] !== '') {
      return String(obj[prop]);
    }
  }
  return '';
}

// Función para formatear fecha
function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '-';
  const fechaStr = String(fecha);
  if (fechaStr.includes('-')) {
    return fechaStr.slice(0, 10);
  }
  return fechaStr;
}

// MOCK: Datos de usuario logueado
const user = {
  nombreApellido: 'juan perez',
  aliadoId: 'AR-0150',
  estadoDocumentacion: 'aprobado'
};

// MOCK: Transacciones
const transacciones = [
  {
    fechaPago: '2025-07-05',
    monto: 120,
    metodo: 'Transferencia',
    titular: 'Carlos Gómez',
    estado: 'Pagado'
  },
  {
    fechaPago: '2025-07-20',
    monto: 200,
    metodo: 'Tarjeta',
    titular: 'Pedro López',
    estado: 'Pendiente'
  }
];

// MOCK: Datos de ejemplo que coinciden con tu estructura de Sanity
const clientesMock = [
  {
    _id: '1',
    _type: 'registro',
    nombreApellido: 'María García',
    cedula: '12345678',
    correo: 'maria@email.com',
    celular: '3001234567',
    ciudad: 'Bogotá',
    fechaRegistro: '2025-07-01T10:30:00.000Z',
    estadoDocumentacion: 'aprobado',
    motivoDenegacion: '',
    aliadoId: 'AR-0150',
    comision: 150,
    fase: 'exitoso'
  },
  {
    _id: '2',
    _type: 'registro',
    nombreApellido: 'Carlos López',
    cedula: '87654321',
    correo: 'carlos@email.com',
    celular: '3009876543',
    ciudad: 'Medellín',
    fechaRegistro: '2025-07-10T14:20:00.000Z',
    estadoDocumentacion: 'revision',
    motivoDenegacion: '',
    aliadoId: 'AR-0150',
    comision: 0,
    fase: 'proceso'
  },
  {
    _id: '3',
    _type: 'registro',
    nombreApellido: 'Ana Rodríguez',
    cedula: '11223344',
    correo: 'ana@email.com',
    celular: '3005556789',
    ciudad: 'Cali',
    fechaRegistro: '2025-07-15T09:15:00.000Z',
    estadoDocumentacion: 'denegado',
    motivoDenegacion: 'Documentos incompletos',
    aliadoId: 'AR-0150',
    comision: 0,
    fase: 'fallido'
  }
];

type Cliente = typeof clientesMock[0];

export default function App() {
  const [clientes, setClientes] = useState(clientesMock);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    nombreApellido: '',
    cedula: '',
    correo: '',
    celular: '',
    ciudad: '',
    contrasena: ''
  });

  // Estados para el modal de documentos
  const [tipoCedula, setTipoCedula] = useState<'foto' | 'documento'>('foto');
  const [cedulaFiles, setCedulaFiles] = useState<File[]>([]);
  const [comprobantesFiles, setComprobantesFiles] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        // API real - descomenta estas líneas cuando tengas el endpoint listo
        const res = await fetch(`/api/user?aliadoId=${user.aliadoId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          console.warn('Los datos recibidos no son un array:', data);
          setClientes([]);
        }
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        // En caso de error, usar datos mock para desarrollo
        setClientes(clientesMock);
      }
    };
    fetchClientes();
  }, []);

  // Cálculos de contadores con validaciones mejoradas
  const cantidadClientes = Array.isArray(clientes) ? clientes.length : 0;

  const clientesActivos = Array.isArray(clientes) ? clientes.filter(c => {
    const documentacion = obtenerValorSeguro(c, 'estadoDocumentacion').toLowerCase();
    return documentacion === 'aprobado';
  }).length : 0;

  const clientesPendientes = Array.isArray(clientes) ? clientes.filter(c => {
    const documentacion = obtenerValorSeguro(c, 'estadoDocumentacion').toLowerCase();
    return documentacion === 'pendiente' || documentacion === 'revision';
  }).length : 0;

  const clientesExitosos = Array.isArray(clientes) ? clientes.filter(c => {
    const fase = obtenerValorSeguro(c, 'fase').toLowerCase();
    return fase === 'exitoso';
  }).length : 0;

  const clientesFallidos = Array.isArray(clientes) ? clientes.filter(c => {
    const fase = obtenerValorSeguro(c, 'fase').toLowerCase();
    const documentacion = obtenerValorSeguro(c, 'estadoDocumentacion').toLowerCase();
    return fase === 'fallido' || documentacion === 'denegado';
  }).length : 0;

  const comisionesMes = Array.isArray(clientes) ? clientes.filter(c => {
    const fecha = obtenerValorSeguro(c, 'fechaRegistro');
    return fecha && fecha.toString().startsWith('2025-07');
  }).reduce((sum, c) => sum + (Number(c.comision) || 0), 0) : 0;

  const comisionesTotales = Array.isArray(clientes) ? clientes.reduce((sum, c) => sum + (Number(c.comision) || 0), 0) : 0;

  // Para el scroll: primeros 3 fijos, el resto en scroll
  const primerosClientes = Array.isArray(clientes) ? clientes.slice(0, 3) : [];
  const restoClientes = Array.isArray(clientes) ? clientes.slice(3) : [];

  // Manejo de formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Funciones para manejo de documentos en el modal
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (tipoCedula === 'foto' && files.length !== 2) {
      setUploadError('Debes subir 2 fotos (frente y reverso)');
      return;
    }
    if (tipoCedula === 'documento' && files.length !== 1) {
      setUploadError('Debes subir 1 documento PDF');
      return;
    }
    setCedulaFiles(files);
    setUploadError('');
  };

  const handleComprobantesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setComprobantesFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number, type: 'cedula' | 'comprobantes') => {
    if (type === 'cedula') {
      setCedulaFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setComprobantesFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  // CORREGIDO: handleSubmit debe recibir el evento del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setError('');
    setSuccess('');
    setLoading(true);

    // Validación simple
    if (!form.nombreApellido || !form.cedula || !form.correo || !form.celular || !form.ciudad || !form.contrasena) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      // API real
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          aliadoId: user.aliadoId
        })
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        setError(data.error || 'Error al registrar cliente');
        setLoading(false);
        return;
      }
    
      setSuccess('¡Cliente registrado exitosamente!');
    
      // Resetear formulario
      setForm({
        nombreApellido: '',
        cedula: '',
        correo: '',
        celular: '',
        ciudad: '',
        contrasena: ''
      });
    
      setLoading(false);
    
      // Refresca la lista de clientes
      const res = await fetch(`/api/user?aliadoId=${user.aliadoId}`);
      if (res.ok) {
        const nuevosClientes = await res.json();
        setClientes(Array.isArray(nuevosClientes) ? nuevosClientes : []);
      }
    
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Error al registrar cliente:', err);
      setError('Error al registrar cliente');
      setLoading(false);
    }
  };

  // Manejo de subida de documentos
  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    setUploadLoading(true);

    if (!cedulaFiles.length) {
      setUploadError('Debes subir la cédula');
      setUploadLoading(false);
      return;
    }

    if (!selectedClient) {
      setUploadError('No se ha seleccionado un cliente');
      setUploadLoading(false);
      return;
    }

    try {
      setUploadProgress(0);

      // Construir FormData para enviar archivos y userId
      const formData = new FormData();
      const clientId = obtenerValorSeguro(selectedClient, '_id');
      formData.append('userId', clientId);
      
      cedulaFiles.forEach(f => formData.append('cedulaFiles', f));
      comprobantesFiles.forEach(f => formData.append('comprobantesFiles', f));
      
      if (audioBlob) {
        // Crear archivo con extensión correcta según el tipo MIME
        const getExtension = (mimeType: string) => {
          if (mimeType.includes('webm')) return 'webm';
          if (mimeType.includes('ogg')) return 'ogg';
          if (mimeType.includes('mp4')) return 'm4a';
          return 'webm';
        };
        
        const extension = getExtension(audioBlob.type);
        const audioFile = new File([audioBlob], `audio.${extension}`, { type: audioBlob.type });
        formData.append('audioBlob', audioFile);
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.error || 'Error al subir documento');
        setUploadLoading(false);
        return;
      }

      setUploadProgress(100);
      setUploadSuccess('¡Documentos subidos exitosamente!');
      
      setUploadLoading(false);

      // Recargar datos del cliente para ver el estado actualizado
      try {
        const res = await fetch(`/api/user?aliadoId=${user.aliadoId}`);
        if (res.ok) {
          const nuevosClientes = await res.json();
          setClientes(Array.isArray(nuevosClientes) ? nuevosClientes : []);
        }
      } catch (refreshErr) {
        console.error('Error al recargar clientes:', refreshErr);
      }

      // Simular login automático del usuario
      console.log(`Usuario ${obtenerValorSeguro(selectedClient, 'nombreApellido')} logueado automáticamente`);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess('');
        setSelectedClient(null);
        // Resetear estados del modal
        resetUploadModal();
      }, 2000);

    } catch (err) {
      console.error('Error al subir documento:', err);
      setUploadError('Error al subir documento');
      setUploadLoading(false);
    }
  };

  // Función para resetear el modal de upload
  const resetUploadModal = () => {
    setTipoCedula('foto');
    setCedulaFiles([]);
    setComprobantesFiles([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess('');
  };

  // Función para abrir modal de subir documentos
  const handleSubirDocumentos = (cliente: Cliente) => {
    setSelectedClient(cliente);
    resetUploadModal();
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-2 sm:p-4 md:p-6">
      {/* TITULO */}
      <h1 className="text-3xl font-bold mb-8">
        Bienvenido - {capitalizarNombre(user.nombreApellido)} - {user.aliadoId}
      </h1>

      {/* CONTADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Cantidad de clientes</span>
          <span className="text-3xl font-bold text-blue-400">{cantidadClientes}</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Clientes activos</span>
          <span className="text-3xl font-bold text-green-400">{clientesActivos}</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Clientes pendientes</span>
          <span className="text-3xl font-bold text-yellow-400">{clientesPendientes}</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Clientes exitosos</span>
          <span className="text-3xl font-bold text-blue-300">{clientesExitosos}</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Clientes fallidos</span>
          <span className="text-3xl font-bold text-red-400">{clientesFallidos}</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Comisiones mes</span>
          <span className="text-3xl font-bold text-green-300">{comisionesMes}€</span>
        </div>
        <div className="bg-[#111827] rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-semibold">Comisiones totales</span>
          <span className="text-3xl font-bold text-green-200">{comisionesTotales}€</span>
        </div>
      </div>

      {/* CLIENTES ACTIVOS + BOTÓN */}
<div className="bg-[#111827] rounded-xl p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Clientes activos</h2>
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
      onClick={() => setShowModal(true)}
    >
      Crear cliente
    </button>
  </div>

  {cantidadClientes === 0 ? (
    <div className="text-center py-8 text-gray-400">
      No hay clientes registrados aún
    </div>
  ) : (
    <>
      {/* WRAPPER SCROLL HORIZONTAL SOLO EN MOVIL */}
      <div className="overflow-x-auto md:overflow-x-visible">
        {/* Encabezados */}
        <div className="min-w-[800px] grid grid-cols-8 gap-2 font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-2 text-sm">
          <div>Cliente</div>
          <div>Ciudad</div>
          <div>Teléfono</div>
          <div>Fecha registro</div>
          <div>Documentos</div>
          <div>Fase proceso</div>
          <div>Comisión generada</div>
          <div>Acciones</div>
        </div>
        {/* Primeros 3 clientes */}
        {primerosClientes.map((c, idx) => (
          <div key={c._id || `cliente-${idx}`} className="min-w-[800px] grid grid-cols-8 gap-2 py-2 border-b border-gray-800 text-sm">
                <div className="font-medium">{obtenerValorSeguro(c, 'nombreApellido') || 'Sin nombre'}</div>
                <div>{obtenerValorSeguro(c, 'ciudad') || '-'}</div>
                <div>{obtenerValorSeguro(c, 'celular') || '-'}</div>
                <div>{formatearFecha(obtenerValorSeguro(c, 'fechaRegistro'))}</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    obtenerValorSeguro(c, 'estadoDocumentacion') === 'aprobado' 
                      ? 'bg-green-600 text-white' 
                      : obtenerValorSeguro(c, 'estadoDocumentacion') === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : obtenerValorSeguro(c, 'estadoDocumentacion') === 'revision'
                      ? 'bg-blue-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {obtenerValorSeguro(c, 'estadoDocumentacion') ? obtenerValorSeguro(c, 'estadoDocumentacion').charAt(0).toUpperCase() + obtenerValorSeguro(c, 'estadoDocumentacion').slice(1) : 'Sin estado'}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    obtenerValorSeguro(c, 'fase') === 'exitoso' 
                      ? 'bg-blue-600 text-white' 
                      : obtenerValorSeguro(c, 'fase') === 'fallido'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {obtenerValorSeguro(c, 'fase') || 'proceso'}
                  </span>
                </div>
                <div className="font-semibold text-green-400">{Number(c.comision) || 0}€</div>
                <div>
                  {(obtenerValorSeguro(c, 'estadoDocumentacion') === 'pendiente' || obtenerValorSeguro(c, 'estadoDocumentacion') === 'denegado') && (
                    <button
                      onClick={() => handleSubirDocumentos(c)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      Subir docs
                    </button>
                  )}
                </div>
              </div>
        ))}
        {/* Resto de clientes en scroll vertical */}
        {restoClientes.length > 0 && (
          <div className="max-h-32 overflow-y-auto mt-2">
            {restoClientes.map((c, idx) => (
              <div key={c._id || `resto-${idx}`} className="min-w-[800px] grid grid-cols-8 gap-2 py-2 border-b border-gray-800 text-sm">
                    <div className="font-medium">{obtenerValorSeguro(c, 'nombreApellido') || 'Sin nombre'}</div>
                    <div>{obtenerValorSeguro(c, 'ciudad') || '-'}</div>
                    <div>{obtenerValorSeguro(c, 'celular') || '-'}</div>
                    <div>{formatearFecha(obtenerValorSeguro(c, 'fechaRegistro'))}</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        obtenerValorSeguro(c, 'estadoDocumentacion') === 'aprobado' 
                          ? 'bg-green-600 text-white' 
                          : obtenerValorSeguro(c, 'estadoDocumentacion') === 'pendiente'
                          ? 'bg-yellow-600 text-white'
                          : obtenerValorSeguro(c, 'estadoDocumentacion') === 'revision'
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {obtenerValorSeguro(c, 'estadoDocumentacion') ? obtenerValorSeguro(c, 'estadoDocumentacion').charAt(0).toUpperCase() + obtenerValorSeguro(c, 'estadoDocumentacion').slice(1) : 'Sin estado'}
                      </span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        obtenerValorSeguro(c, 'fase') === 'exitoso' 
                          ? 'bg-blue-600 text-white' 
                          : obtenerValorSeguro(c, 'fase') === 'fallido'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {obtenerValorSeguro(c, 'fase') || 'proceso'}
                      </span>
                    </div>
                    <div className="font-semibold text-green-400">{Number(c.comision) || 0}€</div>
                    <div>
                      {(obtenerValorSeguro(c, 'estadoDocumentacion') === 'pendiente' || obtenerValorSeguro(c, 'estadoDocumentacion') === 'denegado') && (
                        <button
                          onClick={() => handleSubirDocumentos(c)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                        >
                          Subir docs
                        </button>
                      )}
                    </div>
                  </div>
            ))}
          </div>
        )}
      </div>
    </>
  )}
</div>

      {/* TRANSACCIONES */}
      <div className="bg-[#111827] rounded-xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Transacciones</h2>
        {/* WRAPPER SCROLL HORIZONTAL SOLO EN MOVIL */}
        <div className="overflow-x-auto md:overflow-x-visible">
          <div className="min-w-[500px] grid grid-cols-5 gap-2 font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-2 text-sm">
            <div>Fecha de pago</div>
            <div>Monto</div>
            <div>Método de pago</div>
            <div>Titular</div>
            <div>Estado</div>
        </div>
            {transacciones.map((t, idx) => (
          <div key={idx} className="min-w-[500px] grid grid-cols-5 gap-2 py-2 border-b border-gray-800 text-sm">
            <div>{t.fechaPago}</div>
            <div>{t.monto}€</div>
            <div>{t.metodo}</div>
            <div>{t.titular}</div>
            <div>
              <span className={`px-2 py-1 rounded text-xs ${
                t.estado === 'Pagado' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
              }`}>
                {t.estado}
              </span>
            </div>
          </div>
    ))}
  </div>
</div>

      {/* MODAL FLOTANTE - CREAR CLIENTE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative text-gray-900">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Registrar nuevo cliente</h2>
            {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
            {success && <div className="mb-2 text-green-600 text-sm">{success}</div>}
            {/* CORREGIDO: Ahora es un formulario con onSubmit */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="nombreApellido"
                placeholder="Nombre completo del cliente"
                value={form.nombreApellido}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una ciudad</option>
                {ciudadesColombia.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
              <input
                type="tel"
                name="celular"
                placeholder="Número de teléfono"
                value={form.celular}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="cedula"
                placeholder="Número de cédula"
                value={form.cedula}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded font-semibold transition"
              >
                {loading ? 'Registrando...' : 'Registrar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE - SUBIR DOCUMENTOS COMPLETO */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative text-gray-900">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedClient(null);
                resetUploadModal();
              }}
            >
              ×
            </button>
            
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Subir documentos</h2>
              <p className="text-gray-600 mb-6">Sube los documentos de forma segura y rápida</p>
              
              {selectedClient && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cliente:</div>
                  <div className="font-semibold text-lg">{obtenerValorSeguro(selectedClient, 'nombreApellido') || 'Sin nombre'}</div>
                  <div className="text-sm text-gray-600 mt-2">Estado documentación:</div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    obtenerValorSeguro(selectedClient, 'estadoDocumentacion') === 'aprobado' 
                      ? 'bg-green-600 text-white' 
                      : obtenerValorSeguro(selectedClient, 'estadoDocumentacion') === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : obtenerValorSeguro(selectedClient, 'estadoDocumentacion') === 'revision'
                      ? 'bg-blue-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {obtenerValorSeguro(selectedClient, 'estadoDocumentacion') ? obtenerValorSeguro(selectedClient, 'estadoDocumentacion').charAt(0).toUpperCase() + obtenerValorSeguro(selectedClient, 'estadoDocumentacion').slice(1) : 'Sin estado'}
                  </span>
                </div>
              )}

              {uploadError && <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{uploadError}</div>}
              {uploadSuccess && <div className="mb-4 text-green-600 text-sm bg-green-50 p-3 rounded">{uploadSuccess}</div>}
              
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Sección Cédula */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <i className="fas fa-id-card text-blue-600"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Documento de Identidad</h3>
                      <p className="text-gray-600 text-sm">Sube tu cédula en formato foto o PDF</p>
                    </div>
                  </div>

                  {/* Radio buttons */}
                  <div className="flex gap-3 mb-4">
                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
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
                      <i className="fas fa-camera mr-2"></i>
                      <div>
                        <div className="font-semibold">Fotografías</div>
                        <div className="text-xs opacity-75">2 archivos (frente y reverso)</div>
                      </div>
                    </label>

                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
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
                      <i className="fas fa-file-pdf mr-2"></i>
                      <div>
                        <div className="font-semibold">Documento PDF</div>
                        <div className="text-xs opacity-75">1 archivo escaneado</div>
                      </div>
                    </label>
                  </div>

                  {/* Upload area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept={tipoCedula === 'foto' ? 'image/*' : '.pdf'}
                      multiple={tipoCedula === 'foto'}
                      onChange={handleCedulaChange}
                      className="hidden"
                      id="cedula-upload"
                    />
                    <label htmlFor="cedula-upload" className="cursor-pointer">
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <div className="font-semibold text-gray-700 mb-1">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </div>
                      <div className="text-gray-500 text-sm">
                        {tipoCedula === 'foto' ? 'Máximo 2 imágenes' : 'Solo archivos PDF'}
                      </div>
                    </label>
                  </div>

                  {/* Archivos seleccionados */}
                  {cedulaFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {cedulaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center">
                            <i className="fas fa-file text-blue-500 mr-2 text-sm"></i>
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
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
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <i className="fas fa-file-audio text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Archivo de Audio</h3>
                        <p className="text-gray-600 text-sm">Sube un archivo de audio para verificación (opcional)</p>
                      </div>
                    </div>

                    <div className="text-center">
                      {!audioUrl && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setAudioBlob(file);
                                setAudioUrl(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                            id="audio-upload"
                          />
                          <label htmlFor="audio-upload" className="cursor-pointer">
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <div className="font-semibold text-gray-700 mb-1">
                              Arrastra un archivo de audio aquí o haz clic para seleccionar
                            </div>
                            <div className="text-gray-500 text-sm">
                              Formatos soportados: MP3, WAV, M4A, OGG
                            </div>
                          </label>
                        </div>
                      )}

                      {audioUrl && (
                        <div className="bg-white p-4 rounded-lg">
                          <div className="mb-3">
                            <i className="fas fa-check-circle text-green-500 text-xl mb-1"></i>
                            <p className="text-green-600 font-semibold">¡Audio subido exitosamente!</p>
                          </div>
                          <audio controls src={audioUrl} className="w-full mb-3" />
                          <button
                            type="button"
                            onClick={() => {
                              setAudioBlob(null);
                              setAudioUrl(null);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                          >
                            <i className="fas fa-redo mr-1"></i>
                            Subir otro archivo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Sección Comprobantes */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <i className="fas fa-receipt text-purple-600"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Comprobantes de Deuda</h3>
                      <p className="text-gray-600 text-sm">Sube fotos o PDFs de tus comprobantes (opcional)</p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleComprobantesChange}
                      className="hidden"
                      id="comprobantes-upload"
                    />
                    <label htmlFor="comprobantes-upload" className="cursor-pointer">
                      <i className="fas fa-folder-open text-3xl text-gray-400 mb-2"></i>
                      <div className="font-semibold text-gray-700 mb-1">
                        Selecciona múltiples archivos
                      </div>
                      <div className="text-gray-500 text-sm">
                        Imágenes y PDFs permitidos
                      </div>
                    </label>
                  </div>

                  {comprobantesFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Archivos seleccionados ({comprobantesFiles.length})
                      </h4>
                      {comprobantesFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center">
                            <i className={`fas ${file.type.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-image text-blue-500'} mr-2 text-sm`}></i>
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
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
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={uploadLoading || !cedulaFiles.length}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
                  >
                    {uploadLoading ? (
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

                  {uploadLoading && (
                    <div className="mt-3 max-w-md mx-auto">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}