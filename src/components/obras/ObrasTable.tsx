
"use client";

import React, { useState, useMemo } from 'react';
import type { Obra } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useObras } from '@/contexts/ObrasContext';
import { ObrasTableFilters, Filters } from './ObrasTableFilters';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const formatDateSafe = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export default function ObrasTable() {
  const { userRole } = useAuth(); // userRole será null si no está autenticado
  const { obras, isLoading } = useObras();
  const [filters, setFilters] = useState<Filters>({
    anio_licitacion: '',
    comitente: '',
    es_ute: 'todos',
    estado_obra: 'todos',
  });

  const filteredObras = useMemo(() => {
    return obras.filter(obra => {
      const matchAnio = filters.anio_licitacion ? obra.anio_licitacion === parseInt(filters.anio_licitacion) : true;
      const matchComitente = filters.comitente ? obra.comitente === filters.comitente : true; // Comparación exacta
      const matchUte = filters.es_ute === 'todos' ? true : (filters.es_ute === 'si' ? obra.es_ute : !obra.es_ute);
      const matchEstado = filters.estado_obra === 'todos' ? true : obra.estado_obra === filters.estado_obra;
      return matchAnio && matchComitente && matchUte && matchEstado;
    });
  }, [obras, filters]);

  const uniqueComitentes = useMemo(() => Array.from(new Set(obras.map(o => o.comitente))), [obras]);
  const uniqueAnios = useMemo(() => Array.from(new Set(obras.map(o => o.anio_licitacion))), [obras]);

  if (isLoading) {
    return <p>Cargando listado de obras...</p>;
  }

  const showActionsColumn = !!userRole; // Mostrar columna de acciones si el usuario está autenticado

  return (
    <div className="space-y-6">
      <ObrasTableFilters 
        filters={filters} 
        onFilterChange={setFilters} 
        uniqueComitentes={uniqueComitentes}
        uniqueAnios={uniqueAnios}
      />
      <div className="border rounded-lg shadow-sm">
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
              {showActionsColumn && <TableHead className="text-center">Acciones</TableHead>}
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
                    <TableCell className="text-center space-x-2">
                      {obra.archivo_oferta_pdf && (
                        <Button variant="outline" size="sm" onClick={() => alert(`Descargando ${obra.archivo_oferta_pdf}`)}>
                          <Download className="mr-1 h-4 w-4" /> Oferta
                        </Button>
                      )}
                      {obra.archivo_descripcion_pdf && (
                        <Button variant="outline" size="sm" onClick={() => alert(`Descargando ${obra.archivo_descripcion_pdf}`)}>
                          <Download className="mr-1 h-4 w-4" /> Desc.
                        </Button>
                      )}
                       <Button variant="ghost" size="sm" onClick={() => alert(`Viendo detalles de ${obra.nombre_obra}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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
    </div>
  );
}
