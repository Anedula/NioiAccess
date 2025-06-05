
"use client";

import React, { useState, useMemo } from 'react';
import type { Personal } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonal } from '@/contexts/PersonalContext';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import PersonalDetailsDialog from './PersonalDetailsDialog'; 

export const formatDateSafe = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export default function NominaTable() {
  const { userRole } = useAuth();
  const { personalList, isLoading } = usePersonal();
  
  const [selectedPersonalForView, setSelectedPersonalForView] = useState<Personal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewDetails = (personal: Personal) => {
    setSelectedPersonalForView(personal);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return <p>Cargando nómina del personal...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableCaption>
            {personalList.length === 0 ? 'No hay personal cargado.' : `Total de registros: ${personalList.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Detalle Ubicación</TableHead>
              <TableHead>Tipo Contratación</TableHead>
              <TableHead>Obra Social</TableHead>
              {userRole === 'Recursos Humanos' && <TableHead className="text-center">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {personalList.length > 0 ? (
              personalList.map((personal) => (
                <TableRow key={personal.id}>
                  <TableCell className="font-medium">{personal.nombreCompleto}</TableCell>
                  <TableCell>{personal.dni}</TableCell>
                  <TableCell><Badge variant={personal.ubicacion === "Oficina" ? "secondary" : "default"}>{personal.ubicacion}</Badge></TableCell>
                  <TableCell>{personal.ubicacion === 'Obra' ? personal.obraAsignada : personal.areaOficina}</TableCell>
                  <TableCell><Badge variant="outline">{personal.tipoContratacion}</Badge></TableCell>
                  <TableCell>{personal.obraSocial}</TableCell>
                  {userRole === 'Recursos Humanos' && (
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(personal)} title="Ver Detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/recursos-humanos/nomina/editar/${personal.id}`} passHref>
                        <Button variant="ghost" size="sm" title="Editar Personal">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={userRole === 'Recursos Humanos' ? 7 : 6} className="text-center h-24">
                  No hay personal cargado en la nómina.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedPersonalForView && (
        <PersonalDetailsDialog
          personal={selectedPersonalForView}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}
