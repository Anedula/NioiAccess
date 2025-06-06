
"use client";
// This component is primarily used within EgresoDialog.tsx

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { TIPOS_GASTO_CAJA_CHICA, type TipoGastoCajaChica, type EgresoCajaChica } from '@/lib/types';

export const egresoSchema = z.object({
  fecha: z.date({ required_error: "La fecha del egreso es obligatoria." }),
  tipoGasto: z.custom<TipoGastoCajaChica>((val) => TIPOS_GASTO_CAJA_CHICA.includes(val as TipoGastoCajaChica), "Tipo de gasto no válido."),
  detalleGasto: z.string().optional(),
  monto: z.coerce.number().positive("El monto del egreso debe ser positivo."),
});

export type EgresoFormValues = z.infer<typeof egresoSchema>;

interface FormularioEgresoCajaProps {
  onSubmitEgreso: (data: EgresoFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Omit<EgresoFormValues, 'fecha' | 'monto'> & { fecha?: Date | string, monto?: number | string | null }>;
}

// Helper to prepare form values, ensuring 'monto' is suitable for controlled input
const prepareFormValues = (propDefaults?: FormularioEgresoCajaProps['defaultValues']): EgresoFormValues => {
  const baseDefaults = {
    fecha: new Date(),
    tipoGasto: TIPOS_GASTO_CAJA_CHICA[0],
    detalleGasto: '',
    monto: '' as unknown as number, // Initialize monto as empty string for the form, Zod will coerce
  };

  if (propDefaults) {
    return {
      ...baseDefaults,
      ...propDefaults,
      fecha: propDefaults.fecha ? (typeof propDefaults.fecha === 'string' ? new Date(propDefaults.fecha) : propDefaults.fecha) : new Date(),
      // Ensure monto is a string if it's empty/null/undefined, otherwise keep the number for editing
      monto: (propDefaults.monto === undefined || propDefaults.monto === null || propDefaults.monto === '') ? ('' as unknown as number) : Number(propDefaults.monto),
    };
  }
  return baseDefaults;
};


export default function FormularioEgresoCaja({ onSubmitEgreso, onCancel, isSubmitting, defaultValues }: FormularioEgresoCajaProps) {
  const form = useForm<EgresoFormValues>({
    resolver: zodResolver(egresoSchema),
    defaultValues: prepareFormValues(defaultValues),
  });
  
  React.useEffect(() => {
    form.reset(prepareFormValues(defaultValues));
  }, [defaultValues, form.reset]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitEgreso)} className="space-y-4">
        <FormField
          control={form.control}
          name="fecha"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha del Egreso</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipoGasto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Gasto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl>
                <SelectContent>
                  {TIPOS_GASTO_CAJA_CHICA.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="detalleGasto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalle del Gasto (Opcional)</FormLabel>
              <FormControl><Textarea placeholder="Descripción breve del gasto..." {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto del Egreso (ARS)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 300"
                  {...field}
                  value={field.value === undefined || field.value === null || field.value === '' ? '' : String(field.value)}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : (defaultValues?.fecha ? "Actualizar Egreso" : "Agregar Egreso")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
