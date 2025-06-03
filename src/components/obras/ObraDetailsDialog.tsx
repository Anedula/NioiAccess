
"use client";

import type { Obra } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from './ObrasTable'; // Reutilizamos formatDateSafe

interface ObraDetailsDialogProps {
  obra: Obra | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ObraDetailsDialog: React.FC<ObraDetailsDialogProps> = ({ obra, isOpen, onOpenChange }) => {
  if (!obra) return null;

  const handleDownload = (fileName?: string, fileType?: string) => {
    if (fileName) {
      alert(`Simulando descarga de ${fileType}: ${fileName}`);
      // En una aplicación real, aquí se implementaría la lógica de descarga del archivo.
    } else {
      alert(`No hay archivo de ${fileType} disponible para esta obra.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{obra.nombre_obra}</DialogTitle>
          <DialogDescription>Detalles completos de la obra.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 text-sm">
          <div><strong>ID:</strong> {obra.id}</div>
          <div><strong>Ubicación:</strong> {obra.ubicacion}</div>
          <div><strong>Comitente:</strong> {obra.comitente}</div>
          <div><strong>Año Licitación:</strong> {obra.anio_licitacion}</div>
          <div><strong>Es UTE:</strong> {obra.es_ute ? `Sí (${obra.empresa_ute || 'N/A'})` : 'No'}</div>
          <div><strong>Monto Oferta:</strong> {obra.monto_oferta.toLocaleString('es-AR', { style: 'currency', currency: obra.moneda === 'USD' ? 'USD' : 'ARS' })} {obra.moneda}</div>
          {obra.precio_dolar && <div><strong>Precio Dólar (Referencia):</strong> ${obra.precio_dolar.toLocaleString('es-AR')}</div>}
          {obra.porcentaje_anticipo !== undefined && <div><strong>% Anticipo:</strong> {obra.porcentaje_anticipo}%</div>}
          <div><strong>Plazo Validez Oferta:</strong> {obra.plazo_validez} {obra.unidad_validez}</div>
          <div><strong>Fórmula Polinómica:</strong> {obra.formula_polinomica ? 'Sí' : 'No'}</div>
          <div><strong>Duración Obra:</strong> {obra.duracion_obra} {obra.unidad_duracion}</div>
          <div><strong>Estado:</strong> <Badge variant={obra.estado_obra === 'Adjudicada' || obra.estado_obra === 'En Ejecución' ? 'default' : 'secondary'}>{obra.estado_obra}</Badge></div>
          {obra.estado_obra === "Adjudicada a otra Empresa" && obra.empresa_adjudicada && <div><strong>Empresa Adjudicada:</strong> {obra.empresa_adjudicada}</div>}

          <h4 className="md:col-span-2 text-md font-semibold text-primary mt-3">Fechas Clave</h4>
          <div><strong>Fecha Invitación:</strong> {formatDateSafe(obra.fecha_invitacion)}</div>
          <div><strong>Fecha Presentación:</strong> {formatDateSafe(obra.fecha_presentacion)}</div>
          {obra.estado_obra === "En Ejecución" || obra.estado_obra === "Finalizada" ? (
            <>
              {obra.fecha_inicio_obra && <div><strong>Fecha Inicio Obra:</strong> {formatDateSafe(obra.fecha_inicio_obra)}</div>}
              {obra.fecha_finalizacion_obra && <div><strong>Fecha Finalización Obra:</strong> {formatDateSafe(obra.fecha_finalizacion_obra)}</div>}
            </>
          ): null}
          {obra.estado_obra === "Finalizada" && (
             <>
              {obra.fecha_recepcion_provisoria && <div><strong>Fecha Recepción Provisoria:</strong> {formatDateSafe(obra.fecha_recepcion_provisoria)}</div>}
              {obra.fecha_recepcion_definitiva && <div><strong>Fecha Recepción Definitiva:</strong> {formatDateSafe(obra.fecha_recepcion_definitiva)}</div>}
            </>
          )}
          
          {obra.observaciones && <div className="md:col-span-2 mt-2"><strong>Observaciones:</strong> <p className="whitespace-pre-wrap text-muted-foreground">{obra.observaciones}</p></div>}

          <h4 className="md:col-span-2 text-md font-semibold text-primary mt-3">Archivos</h4>
          <div>
            <strong>Oferta Económica:</strong> {obra.archivo_oferta_pdf || 'No disponible'}
            {obra.archivo_oferta_pdf && (
              <Button variant="link" size="sm" onClick={() => handleDownload(obra.archivo_oferta_pdf, 'Oferta Económica')} className="ml-2 p-0 h-auto">
                <Download className="mr-1 h-4 w-4" /> Descargar
              </Button>
            )}
          </div>
           <div>
            <strong>Descripción de Obra:</strong> {obra.archivo_descripcion_pdf || 'No disponible'}
            {obra.archivo_descripcion_pdf && (
              <Button variant="link" size="sm" onClick={() => handleDownload(obra.archivo_descripcion_pdf, 'Descripción de Obra')} className="ml-2 p-0 h-auto">
                <Download className="mr-1 h-4 w-4" /> Descargar
              </Button>
            )}
          </div>
          
          <h4 className="md:col-span-2 text-md font-semibold text-primary mt-3">Metadata</h4>
          <div><strong>Creado por:</strong> {obra.createdBy || 'N/A'}</div>
          <div><strong>Fecha de Creación:</strong> {obra.createdAt ? formatDateSafe(obra.createdAt) : 'N/A'}</div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ObraDetailsDialog;
