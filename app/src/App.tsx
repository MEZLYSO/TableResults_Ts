import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Participante } from "./types";
import { useState, useEffect } from "react";

function App() {
  const { data, error, isLoading } = useQuery<Participante[]>({
    queryKey: ['careers'],
    queryFn: async () => {
      const response = await axios.get("https://api-js-proyect.onrender.com/user/times");
      return response.data.data;
    },
    refetchInterval: 3000
  });

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [orden, setOrden] = useState<{ campo: string; direccion: "asc" | "desc" }>({
    campo: "IDParticipant",
    direccion: "asc",
  });

  // Update participantes when data changes
  useEffect(() => {
    if (data) {
      setParticipantes(data);
    }
  }, [data]);

  // Obtener categorías únicas para el filtro
  const categorias = data ? ["todas", ...new Set(data.map((p) => p.Category))] : ["todas"];

  // Función para convertir tiempo string "HH:MM:SS" a segundos (para ordenamiento)
  const tiempoASegundos = (tiempo: string) => {
    if (!tiempo) return 0;
    const [horas, minutos, segundos] = tiempo.split(':').map(Number);
    return horas * 3600 + minutos * 60 + segundos;
  };

  // Función para manejar el ordenamiento
  const manejarOrdenamiento = (campo: string) => {
    let direccion: "asc" | "desc" = "asc";

    if (orden.campo === campo && orden.direccion === "asc") {
      direccion = "desc";
    }

    setOrden({ campo, direccion });

    const datosOrdenados = [...participantes].sort((a, b) => {
      // Orden especial para tiempos (convertimos a segundos para comparar)
      if (campo === "StartTime" || campo === "EndTime" || campo === "TotalTime") {
        const tiempoA = tiempoASegundos(a[campo]);
        const tiempoB = tiempoASegundos(b[campo]);
        return direccion === "asc" ? tiempoA - tiempoB : tiempoB - tiempoA;
      }

      // Ordenamiento genérico para otros campos
      const valueA = a[campo as keyof Participante];
      const valueB = b[campo as keyof Participante];

      if (valueA < valueB) {
        return direccion === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direccion === "asc" ? 1 : -1;
      }
      return 0;
    });

    setParticipantes(datosOrdenados);
  };

  // Función para manejar el filtrado por categoría
  const manejarFiltro = (categoria: string) => {
    setFiltroCategoria(categoria);

    if (!data) return;

    if (categoria === "todas") {
      setParticipantes(data);
    } else {
      const datosFiltrados = data.filter((p) => p.Category === categoria);
      setParticipantes(datosFiltrados);
    }

    // Resetear el orden después de filtrar
    setOrden({ campo: "IDParticipant", direccion: "asc" });
  };


  // Función para renderizar el ícono de ordenamiento
  const renderizarIconoOrden = (campo: string) => {
    if (orden.campo !== campo) return null;

    return (
      <span className="ml-1">
        {orden.direccion === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading data</div>;

  return (
    <div className="overflow-x-auto p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resultados de Participantes</h2>

      {/* Controles de filtrado */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="filtro-categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por categoría:
          </label>
          <select
            id="filtro-categoria"
            value={filtroCategoria}
            onChange={(e) => manejarFiltro(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => manejarOrdenamiento("TotalTime")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ordenar por Tiempo Total {renderizarIconoOrden("TotalTime")}
        </button>

        <button
          onClick={() => manejarOrdenamiento("NameParticipant")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Ordenar por Nombre {renderizarIconoOrden("NameParticipant")}
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th
                onClick={() => manejarOrdenamiento("NameParticipant")}
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
              >
                Nombre {renderizarIconoOrden("NameParticipant")}
              </th>
              <th className="py-3 px-4 text-left">Apellido 1</th>
              <th className="py-3 px-4 text-left">Apellido 2</th>
              <th className="py-3 px-4 text-left">Categoría</th>
              <th
                onClick={() => manejarOrdenamiento("StartTime")}
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
              >
                Hora Inicio {renderizarIconoOrden("StartTime")}
              </th>
              <th
                onClick={() => manejarOrdenamiento("EndTime")}
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
              >
                Hora Fin {renderizarIconoOrden("EndTime")}
              </th>
              <th
                onClick={() => manejarOrdenamiento("TotalTime")}
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
              >
                Tiempo Total {renderizarIconoOrden("TotalTime")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participantes && participantes.length > 0 ? (
              participantes.map((participante) => (
                <tr
                  key={participante.IDParticipant}
                  className={`hover:bg-gray-50 ${participantes.indexOf(participante) % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  <td className="py-4 px-4 font-mono text-sm">{participante.IDParticipant}</td>
                  <td className="py-4 px-4 font-medium">{participante.NameParticipant}</td>
                  <td className="py-4 px-4">{participante.LastName_1}</td>
                  <td className="py-4 px-4">{participante.LastName_2}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${participante.Category === "Estudiante"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                      }`}>
                      {participante.Category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono">{participante.StartTime}</td>
                  <td className="py-4 px-4 font-mono">{participante.EndTime}</td>
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">
                    {participante.TotalTime}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No hay participantes que coincidan con el filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {data && (
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {participantes.length} de {data.length} participantes
        </div>
      )}
    </div>
  );
}

export default App;
