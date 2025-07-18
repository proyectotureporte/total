'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";

interface UserData {
  nombreApellido?: string;
  estadoDocumentacion?: string;
}

const etapasProceso = [
  "En análisis",
  "Diagnóstico entregado",
  "Contrato enviado/firmado",
  "Gestión jurídica en curso",
  "Finalizado"
];

const subetapasGestion = ["Petición", "Tutela", "Otros"];

const cuotas = [
  { label: "Cuota 1", fecha: "2025-08-01", monto: 100, pagado: true },
  { label: "Cuota 2", fecha: "2025-09-01", monto: 100, pagado: false },
  { label: "Cuota 3", fecha: "2025-10-01", monto: 100, pagado: false },
  { label: "Cuota 4", fecha: "2025-11-01", monto: 100, pagado: false },
];

export default function PanelPrincipal() {
  const [estadoDocumento, setEstadoDocumento] = useState("En revisión");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const progresoPagos = (cuotas.filter(q => q.pagado).length / cuotas.length) * 100;

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.replace('/');
      return;
    }
    fetch(`/api/user?userId=${userId}`)
      .then(res => res.json())
      .then((data: UserData) => {
        setUser(data);
        setLoading(false);
        if (data && data.estadoDocumentacion) {
          setEstadoDocumento(data.estadoDocumentacion);
        }
        if (!data || data.estadoDocumentacion !== "validado") {
          router.replace('/Panel');
        }
      })
      .catch(() => {
        setLoading(false);
        router.replace('/');
      });
  }, [router]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.replace('/');
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  if (loading || !user || user.estadoDocumentacion !== "validado") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-white bg-[#0b0f19]">
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#111827] p-2 rounded-lg hover:bg-[#1f2937] transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="w-5 h-0.5 bg-white"></div>
            <div className="w-5 h-0.5 bg-white"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </div>
          <span className="text-sm font-medium">MENU</span>
        </div>
      </button>

      {/* Overlay para móvil */}
      {menuAbierto && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      {/* Menú lateral */}
      <aside
        ref={menuRef}
        className={`
          w-64 bg-[#111827] p-6 space-y-6 
          md:block md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Botón cerrar para móvil */}
        <button
          onClick={toggleMenu}
          className="md:hidden absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mt-8 md:mt-0">Menú</h2>
        <nav className="space-y-4">
          <a href="#" className="block hover:text-blue-400">📄 Documentos</a>
          <ul className="ml-4 text-sm space-y-2">
            <li>📤 Enviados</li>
            <li>📥 Recibidos</li>
          </ul>
          <a href="#" className="block hover:text-blue-400">📁 Expediente legal y financiero</a>
          <a href="#" className="block hover:text-blue-400">🆘 Ayuda y soporte</a>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Panel principal */}
      <main className="flex-1 p-10 space-y-10 max-w-5xl md:ml-0 pt-20 md:pt-10">
        <h1 className="text-3xl font-bold">
          Bienvenido, {user?.nombreApellido || 'Usuario'}
        </h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">Verificación de documentos</h2>
          <p className="text-sm text-gray-300">
            Estado actual: <span className="font-semibold text-yellow-400">{estadoDocumento}</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Progreso del proceso</h2>
          <ol className="list-decimal ml-6 space-y-1 text-gray-300">
            {etapasProceso.map((etapa, idx) => (
              <li key={etapa} className={idx === 1 ? "text-blue-400 font-bold" : ""}>
                {etapa}
                {etapa === "Gestión jurídica en curso" && idx === 1 && (
                  <ul className="ml-4 text-sm mt-1 list-disc">
                    {subetapasGestion.map(sub => (
                      <li key={sub} className={sub === "Tutela" ? "text-green-400 font-semibold" : ""}>{sub}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Cronograma de pagos</h2>
          <div className="space-y-3">
            {cuotas.map((cuota, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#1f2937] p-4 rounded-lg">
                <div>
                  <div className="text-lg font-medium">{cuota.label}</div>
                  <div className="text-sm text-gray-400">Fecha: {cuota.fecha}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{cuota.monto}€</div>
                  <div className="text-sm text-gray-400">{cuota.pagado ? "Pagado" : "Pendiente"}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm text-gray-300">Progreso total de pagos:</p>
            <Progress value={progresoPagos} />
          </div>
        </section>
      </main>
    </div>
  );
}