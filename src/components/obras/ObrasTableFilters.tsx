"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ESTADOS_OBRA } from '@/lib/types';
import { XIcon } from 'lucide-react';

export interface Filters {
  anio_licitacion: string;
  comitente: string;
  es_ute: string; // "todos", "si", "no"
  estado_obra: string; // "todos" or EstadoObra
}

interface ObrasTableFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  uniqueComitentes: string[];
  uniqueAnios: number[];
}

export const ObrasTableFilters: React.FC<ObrasTableFiltersProps> = ({
  filters,
  onFilterChange,
  uniqueComitentes,
  uniqueAnios,
}) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSelectChange = (name: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      anio_licitacion: '',
      comitente: '',
      es_ute: 'todos',
      estado_obra: 'todos',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <Select
        value={filters.anio_licitacion}
        onValueChange={(value) => handleSelectChange('anio_licitacion', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Año Licitación" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los Años</SelectItem>
          {uniqueAnios.sort((a,b) => b-a).map(anio => (
            <SelectItem key={anio} value={String(anio)}>{anio}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.comitente}
        onValueChange={(value) => handleSelectChange('comitente', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Comitente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los Comitentes</SelectItem>
          {uniqueComitentes.map(comitente => (
            <SelectItem key={comitente} value={comitente}>{comitente}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={filters.es_ute}
        onValueChange={(value) => handleSelectChange('es_ute', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Es UTE?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos (UTE)</SelectItem>
          <SelectItem value="si">Sí</SelectItem>
          <SelectItem value="no">No</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.estado_obra}
        onValueChange={(value) => handleSelectChange('estado_obra', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Estado Obra" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los Estados</SelectItem>
          {ESTADOS_OBRA.map(estado => (
            <SelectItem key={estado} value={estado}>{estado}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={clearFilters} variant="outline" className="w-full lg:w-auto">
        <XIcon className="mr-2 h-4 w-4" /> Limpiar Filtros
      </Button>
    </div>
  );
};
