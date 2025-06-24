import { useState } from "react";
import type { Competidor } from "../types";

const useTable = () => {

  const [competidores, setCompetidores] = useState<Competidor[]>(datosIniciales);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [orden, setOrden] = useState<{ campo: string; direccion: "asc" | "desc" }>({
    campo: "posicion",
    direccion: "asc",
  });

  // Obtener categorías únicas para el filtro
  const categorias = ["todas", ...new Set(datosIniciales.map((c) => c.categoria))];

  // Función para convertir tiempo string "HH:MM:SS" a segundos (para ordenamiento)
  const tiempoASegundos = (tiempo: string) => {
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

    const datosOrdenados = [...competidores].sort((a, b) => {
      // Orden especial para tiempos (convertimos a segundos para comparar)
      if (campo.includes("tiempo")) {
        const tiempoA = tiempoASegundos(a[campo as keyof Competidor] as string);
        const tiempoB = tiempoASegundos(b[campo as keyof Competidor] as string);
        return direccion === "asc" ? tiempoA - tiempoB : tiempoB - tiempoA;
      }

      // Ordenamiento genérico para otros campos
      if (a[campo as keyof Competidor] < b[campo as keyof Competidor]) {
        return direccion === "asc" ? -1 : 1;
      }
      if (a[campo as keyof Competidor] > b[campo as keyof Competidor]) {
        return direccion === "asc" ? 1 : -1;
      }
      return 0;
    });

    setCompetidores(datosOrdenados);
  };

  // Función para manejar el filtrado por categoría
  const manejarFiltro = (categoria: string) => {
    setFiltroCategoria(categoria);

    if (categoria === "todas") {
      setCompetidores(datosIniciales);
    } else {
      const datosFiltrados = datosIniciales.filter((c) => c.categoria === categoria);
      setCompetidores(datosFiltrados);
    }

    // Resetear el orden después de filtrar
    setOrden({ campo: "posicion", direccion: "asc" });
  };

  return {

  }

}

export default useTable
