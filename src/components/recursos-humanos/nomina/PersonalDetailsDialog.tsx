
"use client";

import type { Personal } from '@/lib/types';
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
import { formatDateSafe } from './NominaTable';

interface PersonalDetailsDialogProps {
  personal: Personal | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PersonalDetailsDialog: React.FC<PersonalDetailsDialogProps> = ({ personal, isOpen, onOpenChange }) => {
  if (!personal) return null;

  const handleDownload = (fileName?: string) => {
    if (fileName) {
      alert(`Simulando descarga de Examen Preocupacional: ${fileName}`);
    } else {
      alert(`No hay archivo de examen preocupacional disponible para esta persona.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{personal.nombreCompleto}</DialogTitle>
          <DialogDescription>Detalles completos del empleado.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 text-sm">
          <div><strong>ID:</strong> {personal.id}</div>
          <div><strong>DNI:</strong> {personal.dni}</div>
          <div><strong>Fecha de Nacimiento:</strong> {formatDateSafe(personal.fechaNacimiento)}</div>
          <div><strong>Ubicación Laboral:</strong> <Badge variant={personal.ubicacionLaboral === "Oficina" ? "secondary" : "default"}>{personal.ubicacionLaboral}</Badge></div>
          {personal.ubicacionLaboral === "Obra" && <div><strong>Obra Asignada:</strong> {personal.obraAsignada || 'N/A'}</div>}
          {personal.ubicacionLaboral === "Oficina" && <div><strong>Área Oficina:</strong> {personal.areaOficina || 'N/A'}</div>}
          <div><strong>Tipo Contratación:</strong> <Badge variant="outline">{personal.tipoContratacion}</Badge></div>
          <div><strong>Estado Civil:</strong> {personal.estadoCivil}</div>
          <div><strong>Tiene Hijos:</strong> {personal.tieneHijos ? 'Sí' : 'No'}</div>
          <div><strong>Obra Social:</strong> {personal.obraSocial}</div>
          <div>
            <strong>Estado Personal:</strong> 
            <Badge
                variant="outline"
                className={`ml-2 ${personal.estadoPersonal === 'Alta' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600' : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600'}`}
            >
                {personal.estadoPersonal}
            </Badge>
          </div>
          {personal.estadoPersonal === "Baja" && <div><strong>Fecha de Baja:</strong> {formatDateSafe(personal.fechaBaja)}</div>}
          
          {personal.datosMedicosAdicionales && <div className="md:col-span-2 mt-2"><strong>Datos Médicos Adicionales:</strong> <p className="whitespace-pre-wrap text-muted-foreground">{personal.datosMedicosAdicionales}</p></div>}
          
          <h4 className="md:col-span-2 text-md font-semibold text-primary mt-3">Examen Preocupacional</h4>
          <div>
            <strong>Archivo:</strong> {personal.archivoExamenPreocupacional || 'No disponible'}
            {personal.archivoExamenPreocupacional && (
              <Button variant="link" size="sm" onClick={() => handleDownload(personal.archivoExamenPreocupacional)} className="ml-2 p-0 h-auto">
                <Download className="mr-1 h-4 w-4" /> Descargar
              </Button>
            )}
          </div>

          <h4 className="md:col-span-2 text-md font-semibold text-primary mt-3">Metadata</h4>
          <div><strong>Creado por:</strong> {personal.createdBy || 'N/A'}</div>
          <div><strong>Fecha de Creación:</strong> {personal.createdAt ? formatDateSafe(personal.createdAt) : 'N/A'}</div>
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

export default PersonalDetailsDialog;
