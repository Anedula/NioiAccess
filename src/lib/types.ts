
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

export const ESTADOS_CIVILES = ["Soltero/a", "Casado/a", "Unión convivencial", "Divorciado/a", "Viudo/a"] as const;
export type EstadoCivil = typeof ESTADOS_CIVILES[number];

export const ESTADOS_PERSONAL = ["Alta", "Baja"] as const;
export type EstadoPersonal = typeof ESTADOS_PERSONAL[number];

export interface Personal {
  id: string;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string; // Store as ISO string
  ubicacionLaboral: UbicacionPersonal; // Renamed from 'ubicacion' for clarity
  obraAsignada?: string; // Requerido si ubicacionLaboral es "Obra"
  areaOficina?: Role; // Requerido si ubicacionLaboral es "Oficina"
  tipoContratacion: TipoContratacion;
  estadoCivil: EstadoCivil;
  tieneHijos: boolean;
  obraSocial: string;
  datosMedicosAdicionales?: string;
  archivoExamenPreocupacional?: string; // filename
  estadoPersonal: EstadoPersonal;
  fechaBaja?: string; // Store as ISO string, optional
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

// Tipos para Oficina Técnica - Pedido de Precios a Compras
export const PEDIDO_PRECIO_UNIDADES = ["m", "kg", "m2", "m3", "rollo", "lts", "un", "otro"] as const;
export type PedidoPrecioUnidad = typeof PEDIDO_PRECIO_UNIDADES[number];

export const PEDIDO_PRECIO_TIPOS = ["Servicio", "Alquiler", "Compra"] as const;
export type PedidoPrecioTipo = typeof PEDIDO_PRECIO_TIPOS[number];

export interface PedidoPrecioItem {
  id: string;
  descripcion: string;
  unidad: PedidoPrecioUnidad;
  unidadPersonalizada?: string; // Usado si unidad es "otro"
  cantidad: number;
  obraDestinoId: string; // ID de la Obra
  tipo: PedidoPrecioTipo;
  precioUnitarioARS?: number; // Editable por Compras
  precioUnitarioUSD?: number; // Editable por Compras
  presupuestoPdf?: string; // filename, editable por Compras
  createdByOT: Role; // Siempre "Oficina Técnica" al crear
  createdAt: string; // ISO string
  lastUpdatedByCompras?: Role; // "Compras" si actualizó precios/pdf
  lastUpdatedAt?: string; // ISO string de la última actualización por Compras
}

// Tipos para Área de Compras - Caja Chica
export const TIPOS_GASTO_CAJA_CHICA = ["Viáticos", "Combustible", "Insumos de Oficina", "Limpieza", "Mantenimiento", "Gastos Notariales", "Otro"] as const;
export type TipoGastoCajaChica = typeof TIPOS_GASTO_CAJA_CHICA[number];

export interface EgresoCajaChica {
  id: string;
  fecha: string; // ISO string (YYYY-MM-DD)
  tipoGasto: TipoGastoCajaChica;
  detalleGasto?: string;
  monto: number; // ARS
}

export interface CajaChica {
  id: string;
  fechaApertura: string; // ISO string (YYYY-MM-DD)
  montoInicial: number; // ARS
  egresos: EgresoCajaChica[];
  fechaCierre?: string; // ISO string (YYYY-MM-DD)
  totalEgresos?: number; // ARS
  saldoFinal?: number; // ARS
  createdBy?: Role; // Role of the user who opened the caja
  createdAt: string; // ISO string of opening time
  closedBy?: Role; // Role of the user who closed the caja
  closedAt?: string; // ISO string of closing time
}
