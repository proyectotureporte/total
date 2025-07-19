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
    estadoDocumentacion: 'pendiente',
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

export default function App() {
  const [clientes, setClientes] = useState(clientesMock);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombreApellido: '',
    cedula: '',
    correo: '',
    celular: '',
    ciudad: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    return documentacion === 'pendiente';
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
        <div className="min-w-[700px] grid grid-cols-7 gap-2 font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-2 text-sm">
          <div>Cliente</div>
          <div>Ciudad</div>
          <div>Teléfono</div>
          <div>Fecha de registro</div>
          <div>Documentación</div>
          <div>Fase de proceso</div>
          <div>Comisión generada</div>
        </div>
        {/* Primeros 3 clientes */}
        {primerosClientes.map((c, idx) => (
          <div key={c._id || `cliente-${idx}`} className="min-w-[700px] grid grid-cols-7 gap-2 py-2 border-b border-gray-800 text-sm">
                <div className="font-medium">{c.nombreApellido || 'Sin nombre'}</div>
                <div>{c.ciudad || '-'}</div>
                <div>{c.celular || '-'}</div>
                <div>{formatearFecha(c.fechaRegistro)}</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.estadoDocumentacion === 'aprobado' 
                      ? 'bg-green-600 text-white' 
                      : c.estadoDocumentacion === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {c.estadoDocumentacion ? c.estadoDocumentacion.charAt(0).toUpperCase() + c.estadoDocumentacion.slice(1) : 'Sin estado'}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    c.fase === 'exitoso' 
                      ? 'bg-blue-600 text-white' 
                      : c.fase === 'fallido'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {c.fase || 'proceso'}
                  </span>
                </div>
                <div className="font-semibold text-green-400">{Number(c.comision) || 0}€</div>
              </div>
        ))}
        {/* Resto de clientes en scroll vertical */}
        {restoClientes.length > 0 && (
          <div className="max-h-32 overflow-y-auto mt-2">
            {restoClientes.map((c, idx) => (
              <div key={c._id || `resto-${idx}`} className="min-w-[700px] grid grid-cols-7 gap-2 py-2 border-b border-gray-800 text-sm">
                    <div className="font-medium">{c.nombreApellido || 'Sin nombre'}</div>
                    <div>{c.ciudad || '-'}</div>
                    <div>{c.celular || '-'}</div>
                    <div>{formatearFecha(c.fechaRegistro)}</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        c.estadoDocumentacion === 'aprobado' 
                          ? 'bg-green-600 text-white' 
                          : c.estadoDocumentacion === 'pendiente'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {c.estadoDocumentacion ? c.estadoDocumentacion.charAt(0).toUpperCase() + c.estadoDocumentacion.slice(1) : 'Sin estado'}
                      </span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        c.fase === 'exitoso' 
                          ? 'bg-blue-600 text-white' 
                          : c.fase === 'fallido'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {c.fase || 'proceso'}
                      </span>
                    </div>
                    <div className="font-semibold text-green-400">{Number(c.comision) || 0}€</div>
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

      {/* MODAL FLOTANTE */}
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
    </div>
  );
}