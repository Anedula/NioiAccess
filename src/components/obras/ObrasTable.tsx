
"use client";

import React, { useState, useMemo } from 'react';
import type { Obra } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye, Pencil, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useObras } from '@/contexts/ObrasContext';
import { ObrasTableFilters, Filters } from './ObrasTableFilters';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import ObraDetailsDialog from './ObraDetailsDialog'; // Nueva importación

export const formatDateSafe = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    // console.error("Error formatting date:", dateString, error);
    return 'Fecha inválida';
  }
};

export default function ObrasTable() {
  const { userRole } = useAuth();
  const { obras, isLoading } = useObras();
  const [filters, setFilters] = useState<Filters>({
    anio_licitacion: '',
    comitente: '',
    es_ute: 'todos',
    estado_obra: 'todos',
  });

  const [selectedObraForView, setSelectedObraForView] = useState<Obra | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredObras = useMemo(() => {
    return obras.filter(obra => {
      const matchAnio = filters.anio_licitacion ? obra.anio_licitacion === parseInt(filters.anio_licitacion) : true;
      const matchComitente = filters.comitente ? obra.comitente === filters.comitente : true;
      const matchUte = filters.es_ute === 'todos' ? true : (filters.es_ute === 'si' ? obra.es_ute : !obra.es_ute);
      const matchEstado = filters.estado_obra === 'todos' ? true : obra.estado_obra === filters.estado_obra;
      return matchAnio && matchComitente && matchUte && matchEstado;
    });
  }, [obras, filters]);

  const uniqueComitentes = useMemo(() => Array.from(new Set(obras.map(o => o.comitente).filter(Boolean))).sort(), [obras]);
  const uniqueAnios = useMemo(() => Array.from(new Set(obras.map(o => o.anio_licitacion))).sort((a, b) => b - a), [obras]);


  const handleViewDetails = (obra: Obra) => {
    setSelectedObraForView(obra);
    setIsViewDialogOpen(true);
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <p>Cargando listado de obras...</p>;
  }

  const showActionsColumn = !!userRole;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <ObrasTableFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          uniqueComitentes={uniqueComitentes}
          uniqueAnios={uniqueAnios}
        />
      </div>
      <div className="border rounded-lg shadow-sm printable-area">
        <Table>
          <TableCaption>
            {filteredObras.length === 0 ? 'No hay obras que coincidan con los filtros.' : `Total de obras: ${filteredObras.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Obra</TableHead>
              <TableHead>Comitente</TableHead>
              <TableHead>Año Licitación</TableHead>
              <TableHead>Monto Oferta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Es UTE?</TableHead>
              <TableHead>Fecha Presentación</TableHead>
              {showActionsColumn && <TableHead className="text-center no-print">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredObras.length > 0 ? (
              filteredObras.map((obra) => (
                <TableRow key={obra.id}>
                  <TableCell className="font-medium">{obra.nombre_obra}</TableCell>
                  <TableCell>{obra.comitente}</TableCell>
                  <TableCell>{obra.anio_licitacion}</TableCell>
                  <TableCell>
                    {obra.monto_oferta.toLocaleString('es-AR', { style: 'currency', currency: obra.moneda === 'USD' ? 'USD' : 'ARS' })} {obra.moneda}
                  </TableCell>
                  <TableCell>
                    <Badge variant={obra.estado_obra === 'Adjudicada' || obra.estado_obra === 'En Ejecución' ? 'default' : 'secondary'}>
                        {obra.estado_obra}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{obra.es_ute ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{formatDateSafe(obra.fecha_presentacion)}</TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-center space-x-1 no-print">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(obra)} title="Ver Detalles">
                          <Eye className="h-4 w-4" />
                      </Button>
                      {userRole === 'Oficina Técnica' && (
                        <Link href={`/dashboard/obras/editar/${obra.id}`} passHref>
                          <Button variant="ghost" size="sm" title="Editar Obra">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {/* Los botones de descarga ahora estarán en el diálogo de detalles */}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActionsColumn ? 8 : 7} className="text-center h-24">
                  No se encontraron obras.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 flex justify-end no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" /> Imprimir Listado
        </Button>
      </div>
      {selectedObraForView && (
        <ObraDetailsDialog 
          obra={selectedObraForView}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}
