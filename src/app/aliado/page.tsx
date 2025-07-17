import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans flex flex-col items-center justify-between px-6 sm:px-12 py-10">
      {/* Header */}
      <header className="w-full flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-2xl font-bold flex items-center gap-2">
          <span className="text-[#58e1c1]">●</span> TU REPORTE<span className="text-[#888]">SAS</span>
        </div>
        <a
          href="/login"
          className="border border-blue-500 text-blue-400 rounded-full px-6 py-2 text-sm hover:bg-blue-500 hover:text-white transition"
        >
          Iniciar Sesion
        </a>
      </header>

      {/* Main Content */}
      <main className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 max-w-6xl w-full mt-12">
        {/* Left section */}
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-6">¡Hola Aliado, Unete a nosotros Hoy!</h1>
          <p className="text-[#a0aec0] text-lg mb-8 leading-relaxed">
            Estas ante la mejor opción para generar ingresos extras y poder cumplir tus metas laborales. <br /><br />Empieza ahora. Estamos contigo
en cada paso.
          </p>
          <div>
            <a
              href="/registro"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              Empezar
            </a>
            <p className="text-sm text-[#a0aec0] mt-4">
              Vinculación a ser aliado de TUREPORTE. 
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="bg-[#ecf0f1] rounded-xl p-6 sm:p-10 w-full max-w-xl border border-[#1f2937] text-[black]" >
          <h2 className="text-2xl font-semibold mb-6 text-center">NOSOTROS</h2>
          <div className="grid grid-cols-2 gap-6 text-sm text-[black]">
            <div className="flex flex-col items-center text-center">
              <Image
    src="https://www.svgrepo.com/show/316249/user-check.svg"
    alt="Usuario con check"
    width={40}
    height={40}
  />
  <span className="mt-3 font-medium">Más de 10 años de experiencia</span>
</div>

<div className="flex flex-col items-center text-center">
  <Image
    src="https://www.svgrepo.com/show/468263/check-mark-circle.svg"
    alt="Check circular"
    width={40}
    height={40}
  />
  <span className="mt-3 font-medium">Más de 1500 casos de éxito</span>
</div>

<div className="flex flex-col items-center text-center">
  <Image
    src="https://www.svgrepo.com/show/513373/rocket.svg"
    alt="Cohete"
    width={40}
    height={40}
  />
  <span className="mt-3 font-medium">Más de 200 clientes felices</span>
</div>

<div className="flex flex-col items-center text-center">
  <Image
    src="https://www.svgrepo.com/show/530575/trophy.svg"
    alt="Trofeo"
    width={40}
    height={40}
  />
  <span className="mt-3 font-medium">Más de 6 reconocimientos</span>
</div>
          </div>
        </div>
      </main>
    </div>
  );
}
