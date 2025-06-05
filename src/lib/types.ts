
export const ALL_ROLES = [
  "Administración",
  "Comercial",
  "Finanzas",
  "Compras",
  "Logística",
  "Marketing",
  "Oficina Técnica",
  "Recursos Humanos",
] as const;

export type Role = typeof ALL_ROLES[number];

export interface Obra {
  id: string;
  nombre_obra: string;
  ubicacion: string;
  comitente: string;
  es_ute: boolean;
  empresa_ute?: string;
  fecha_invitacion: string; // Store as ISO string
  fecha_presentacion: string; // Store as ISO string
  monto_oferta: number;
  moneda: string;
  precio_dolar?: number;
  porcentaje_anticipo?: number;
  plazo_validez: number;
  unidad_validez: "días" | "meses" | "años";
  formula_polinomica: boolean;
  duracion_obra: number;
  unidad_duracion: string; // e.g. "meses", "días"
  estado_obra:
    | "No se tienen datos"
    | "En Licitación"
    | "Adjudicada"
    | "En Ejecución"
    | "Adjudicada a otra Empresa"
    | "Finalizada"
    | "No se licitó"
    | "Actualizada";
  empresa_adjudicada?: string;
  observaciones?: string;
  anio_licitacion: number;
  fecha_inicio_obra?: string; // Store as ISO string
  fecha_finalizacion_obra?: string; // Store as ISO string
  archivo_oferta_pdf?: string; // filename
  archivo_descripcion_pdf?: string; // filename
  fecha_recepcion_provisoria?: string; // Store as ISO string
  fecha_recepcion_definitiva?: string; // Store as ISO string
  createdBy?: Role; // Role that created this entry
  createdAt?: string; // ISO string
}

export const ESTADOS_OBRA = [
  "No se tienen datos",
  "En Licitación",
  "Adjudicada",
  "En Ejecución",
  "Adjudicada a otra Empresa",
  "Finalizada",
  "No se licitó",
  "Actualizada",
] as const;

export type EstadoObra = typeof ESTADOS_OBRA[number];

export const UNIDADES_VALIDEZ = ["días", "meses", "años"] as const;
export type UnidadValidez = typeof UNIDADES_VALIDEZ[number];

// Tipos para Recursos Humanos - Nómina
export type UbicacionPersonal = "Obra" | "Oficina";
export const TIPOS_CONTRATACION = ["Línea A", "Línea B"] as const;
export type TipoContratacion = typeof TIPOS_CONTRATACION[number];

export interface Personal {
  id: string;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string; // Store as ISO string
  ubicacion: UbicacionPersonal;
  obraAsignada?: string; // Requerido si ubicacion es "Obra"
  areaOficina?: Role; // Requerido si ubicacion es "Oficina"
  tipoContratacion: TipoContratacion;
  estadoCivil: string;
  tieneHijos: boolean;
  obraSocial: string;
  datosMedicosAdicionales?: string;
  archivoExamenPreocupacional?: string; // filename
  createdBy?: Role;
  createdAt?: string; // ISO string
}

// Tipos para Recursos Humanos - Asistencia
export const ESTADOS_ASISTENCIA = ["Jornada completa", "Media jornada", "Ausente"] as const;
export type EstadoAsistencia = typeof ESTADOS_ASISTENCIA[number];

export interface RegistroAsistencia {
    id: string;
    personalId: string; // ID del empleado de la nómina
    fecha: string; // YYYY-MM-DD
    estado: EstadoAsistencia;
    registradoPor?: Role;
    registradoAt?: string; // ISO string
}

// Tipos para Sala de Reuniones
export interface ReservaSala {
  id: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  responsable: string;
  tema: string;
  createdBy?: Role;
  createdAt?: string; // ISO string
}
