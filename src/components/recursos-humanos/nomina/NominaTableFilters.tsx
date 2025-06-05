
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { UbicacionPersonal, TipoContratacion, Role } from '@/lib/types';
import { TIPOS_CONTRATACION, ALL_ROLES } from '@/lib/types';
import { XIcon } from 'lucide-react';

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

const ALL_UBICACIONES_VALUE = "todas_ubicaciones";
const ALL_OBRAS_VALUE = "__ALL_OBRAS__";
const ALL_TIPOS_CONTRATACION_VALUE = "todas_contrataciones";
const ALL_AREAS_VALUE = "todas_areas";


export const NominaTableFilters: React.FC<NominaTableFiltersProps> = ({
  filters,
  onFilterChange,
  uniqueObrasAsignadas,
}) => {
  
  const handleSelectChange = (name: keyof NominaFilters, value: string) => {
    let actualValue: string | UbicacionPersonal | TipoContratacion | Role = value;
    
    if (name === 'ubicacion' && value === ALL_UBICACIONES_VALUE) actualValue = 'todas';
    else if (name === 'obraAsignada' && value === ALL_OBRAS_VALUE) actualValue = '';
    else if (name === 'tipoContratacion' && value === ALL_TIPOS_CONTRATACION_VALUE) actualValue = 'todas';
    else if (name === 'areaOficina' && value === ALL_AREAS_VALUE) actualValue = 'todas';
    
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
        value={filters.ubicacion === 'todas' ? ALL_UBICACIONES_VALUE : filters.ubicacion}
        onValueChange={(value) => handleSelectChange('ubicacion', value)}
      >
        <SelectTrigger><SelectValue placeholder="Ubicación" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_UBICACIONES_VALUE}>Todas las Ubicaciones</SelectItem>
          <SelectItem value="Oficina">Oficina</SelectItem>
          <SelectItem value="Obra">Obra</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.obraAsignada === '' ? ALL_OBRAS_VALUE : filters.obraAsignada}
        onValueChange={(value) => handleSelectChange('obraAsignada', value)}
        disabled={filters.ubicacion === 'Oficina'}
      >
        <SelectTrigger><SelectValue placeholder="Obra Asignada" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OBRAS_VALUE}>Todas las Obras</SelectItem>
          {uniqueObrasAsignadas.map(obra => (
            <SelectItem key={obra} value={obra}>{obra}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tipoContratacion === 'todas' ? ALL_TIPOS_CONTRATACION_VALUE : filters.tipoContratacion}
        onValueChange={(value) => handleSelectChange('tipoContratacion', value)}
      >
        <SelectTrigger><SelectValue placeholder="Tipo Contratación" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_TIPOS_CONTRATACION_VALUE}>Todos los Tipos</SelectItem>
          {TIPOS_CONTRATACION.map(tipo => (
            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.areaOficina === 'todas' ? ALL_AREAS_VALUE : filters.areaOficina}
        onValueChange={(value) => handleSelectChange('areaOficina', value)}
        disabled={filters.ubicacion === 'Obra'}
      >
        <SelectTrigger><SelectValue placeholder="Área Oficina" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_AREAS_VALUE}>Todas las Áreas</SelectItem>
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
