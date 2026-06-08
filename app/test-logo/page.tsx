import LogoCotolar from "@/components/LogoCotolar";

export default function TestLogoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-200 max-w-2xl w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">
          Propuesta de Logo: COTOLAR
        </h1>
        
        {/* Muestra del logo en tamaño grande */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 mb-8 flex justify-center items-center h-64">
          <LogoCotolar className="w-full max-w-sm h-auto" />
        </div>
        
        <p className="text-gray-600 text-sm mb-6">
          Esta es una propuesta basada en tu referencia. El mapa de fondo (las formas celestes y azules)
          tiene un estilo poligonal/geométrico inspirado en la silueta de la provincia de <strong>La Rioja</strong>,
          y las letras &quot;TO&quot; resaltan en blanco tal como solicitaste.
        </p>

        <p className="text-blue-600 font-semibold text-sm">
          Abre esta página en tu navegador local para revisarlo: <br />
          <a href="http://localhost:3000/test-logo" className="underline text-blue-800" target="_blank" rel="noreferrer">
            http://localhost:3000/test-logo
          </a>
        </p>
      </div>
    </div>
  );
}
