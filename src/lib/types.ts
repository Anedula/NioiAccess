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
