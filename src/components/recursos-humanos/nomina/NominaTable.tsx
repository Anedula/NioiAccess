
"use client";

import React, { useState, useMemo } from 'react';
import type { Personal, Role, TipoContratacion, UbicacionPersonal } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { usePersonal } from '@/contexts/PersonalContext';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import PersonalDetailsDialog from './PersonalDetailsDialog'; 
import { NominaFilters, type NominaFilters as FiltersState } from './NominaTableFilters';
import { useToast } from '@/hooks/use-toast';

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
  const { personalList, isLoading, deletePersonal } = usePersonal();
  const { toast } = useToast();
  
  const [selectedPersonalForView, setSelectedPersonalForView] = useState<Personal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [personalToDeleteId, setPersonalToDeleteId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    ubicacion: 'todas',
    obraAsignada: '',
    tipoContratacion: 'todas',
    areaOficina: 'todas',
  });

  const uniqueObrasAsignadas = useMemo(() => 
    Array.from(new Set(personalList.map(p => p.obraAsignada).filter(Boolean as any as (value: string | undefined) => value is string))).sort()
  , [personalList]);

  const filteredPersonalList = useMemo(() => {
    return personalList.filter(p => {
      const matchUbicacion = filters.ubicacion === 'todas' || p.ubicacion === filters.ubicacion;
      const matchObra = filters.ubicacion !== 'Obra' || filters.obraAsignada === '' || p.obraAsignada === filters.obraAsignada;
      const matchTipoContratacion = filters.tipoContratacion === 'todas' || p.tipoContratacion === filters.tipoContratacion;
      const matchArea = filters.ubicacion !== 'Oficina' || filters.areaOficina === 'todas' || p.areaOficina === filters.areaOficina;
      
      return matchUbicacion && matchObra && matchTipoContratacion && matchArea;
    });
  }, [personalList, filters]);

  const handleViewDetails = (personal: Personal) => {
    setSelectedPersonalForView(personal);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (personalId: string) => {
    setPersonalToDeleteId(personalId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (personalToDeleteId) {
      deletePersonal(personalToDeleteId);
      // Toast is handled in PersonalContext
    }
    setIsDeleteDialogOpen(false);
    setPersonalToDeleteId(null);
  };

  if (isLoading) {
    return <p>Cargando nómina del personal...</p>;
  }
  
  const showActionsColumn = userRole === 'Recursos Humanos';

  return (
    <div className="space-y-6">
      <NominaTableFilters
        filters={filters}
        onFilterChange={setFilters}
        uniqueObrasAsignadas={uniqueObrasAsignadas}
      />
      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableCaption>
            {filteredPersonalList.length === 0 ? 'No hay personal que coincida con los filtros.' : `Total de registros: ${filteredPersonalList.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Detalle Ubicación</TableHead>
              <TableHead>Tipo Contratación</TableHead>
              <TableHead>Obra Social</TableHead>
              {showActionsColumn && <TableHead className="text-center">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPersonalList.length > 0 ? (
              filteredPersonalList.map((personal) => (
                <TableRow key={personal.id}>
                  <TableCell className="font-medium">{personal.nombreCompleto}</TableCell>
                  <TableCell>{personal.dni}</TableCell>
                  <TableCell><Badge variant={personal.ubicacion === "Oficina" ? "secondary" : "default"}>{personal.ubicacion}</Badge></TableCell>
                  <TableCell>{personal.ubicacion === 'Obra' ? personal.obraAsignada : personal.areaOficina}</TableCell>
                  <TableCell><Badge variant="outline">{personal.tipoContratacion}</Badge></TableCell>
                  <TableCell>{personal.obraSocial}</TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(personal)} title="Ver Detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/recursos-humanos/nomina/editar/${personal.id}`} passHref>
                        <Button variant="ghost" size="icon" title="Editar Personal">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Eliminar Personal" onClick={() => handleDeleteClick(personal.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActionsColumn ? 7 : 6} className="text-center h-24">
                  No hay personal cargado o que coincida con los filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro del personal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPersonalToDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
