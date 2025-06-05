
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { UbicacionPersonal, TipoContratacion, Role } from '@/lib/types';
import { TIPOS_CONTRATACION, ALL_ROLES } from '@/lib/types';
import { XIcon } from 'lucide-react'; // Asegurar que XIcon esté importado

export interface NominaFilters {
  ubicacion: UbicacionPersonal | 'todas';
  obraAsignada: string; // Empty string for "todas"
  tipoContratacion: TipoContratacion | 'todas';
  areaOficina: Role | 'todas';
}

interface NominaTableFiltersProps {
  filters: NominaFilters;
  onFilterChange: (filters: NominaFilters) => void;
  uniqueObrasAsignadas: string[];
}

// Constantes para los valores "placeholder" de las opciones "Todas" en los Select
const PLACEHOLDER_VALUE_TODAS_UBICACIONES = "placeholder_todas_ubicaciones";
const PLACEHOLDER_VALUE_TODAS_OBRAS = "placeholder_todas_obras";
const PLACEHOLDER_VALUE_TODOS_TIPOS_CONTRATACION = "placeholder_todos_tipos_contratacion";
const PLACEHOLDER_VALUE_TODAS_AREAS = "placeholder_todas_areas";


export const NominaTableFilters: React.FC<NominaTableFiltersProps> = ({
  filters,
  onFilterChange,
  uniqueObrasAsignadas,
}) => {
  
  const handleSelectChange = (name: keyof NominaFilters, value: string) => {
    let actualValue: string | UbicacionPersonal | TipoContratacion | Role = value;
    
    if (name === 'ubicacion' && value === PLACEHOLDER_VALUE_TODAS_UBICACIONES) actualValue = 'todas';
    else if (name === 'obraAsignada' && value === PLACEHOLDER_VALUE_TODAS_OBRAS) actualValue = '';
    else if (name === 'tipoContratacion' && value === PLACEHOLDER_VALUE_TODOS_TIPOS_CONTRATACION) actualValue = 'todas';
    else if (name === 'areaOficina' && value === PLACEHOLDER_VALUE_TODAS_AREAS) actualValue = 'todas';
    
    onFilterChange({ ...filters, [name]: actualValue });
  };

  const clearFilters = () => {
    onFilterChange({
      ubicacion: 'todas',
      obraAsignada: '',
      tipoContratacion: 'todas',
      areaOficina: 'todas',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <Select
        value={filters.ubicacion === 'todas' ? PLACEHOLDER_VALUE_TODAS_UBICACIONES : filters.ubicacion}
        onValueChange={(value) => handleSelectChange('ubicacion', value)}
      >
        <SelectTrigger><SelectValue placeholder="Ubicación" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={PLACEHOLDER_VALUE_TODAS_UBICACIONES}>Todas las Ubicaciones</SelectItem>
          <SelectItem value="Oficina">Oficina</SelectItem>
          <SelectItem value="Obra">Obra</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.obraAsignada === '' ? PLACEHOLDER_VALUE_TODAS_OBRAS : filters.obraAsignada}
        onValueChange={(value) => handleSelectChange('obraAsignada', value)}
        disabled={filters.ubicacion === 'Oficina'}
      >
        <SelectTrigger><SelectValue placeholder="Obra Asignada" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={PLACEHOLDER_VALUE_TODAS_OBRAS}>Todas las Obras</SelectItem>
          {uniqueObrasAsignadas.map(obra => (
            <SelectItem key={obra} value={obra}>{obra}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tipoContratacion === 'todas' ? PLACEHOLDER_VALUE_TODOS_TIPOS_CONTRATACION : filters.tipoContratacion}
        onValueChange={(value) => handleSelectChange('tipoContratacion', value)}
      >
        <SelectTrigger><SelectValue placeholder="Tipo Contratación" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={PLACEHOLDER_VALUE_TODOS_TIPOS_CONTRATACION}>Todos los Tipos</SelectItem>
          {TIPOS_CONTRATACION.map(tipo => (
            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.areaOficina === 'todas' ? PLACEHOLDER_VALUE_TODAS_AREAS : filters.areaOficina}
        onValueChange={(value) => handleSelectChange('areaOficina', value)}
        disabled={filters.ubicacion === 'Obra'}
      >
        <SelectTrigger><SelectValue placeholder="Área Oficina" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={PLACEHOLDER_VALUE_TODAS_AREAS}>Todas las Áreas</SelectItem>
          {ALL_ROLES.map(role => (
            <SelectItem key={role} value={role}>{role}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={clearFilters} variant="outline" className="w-full lg:w-auto">
        <XIcon className="mr-2 h-4 w-4" /> Limpiar Filtros
      </Button>
    </div>
  );
};
