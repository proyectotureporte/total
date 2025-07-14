'use client'

import { useState, useEffect } from 'react';
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
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.replace('/');
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
      {/* Menú lateral */}
      <aside className="w-64 bg-[#111827] p-6 space-y-6">
        <h2 className="text-xl font-bold">Menú</h2>
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
      <main className="flex-1 p-10 space-y-10 max-w-5xl">
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